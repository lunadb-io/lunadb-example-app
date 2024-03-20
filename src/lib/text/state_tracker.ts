import { defaultMarkdownParser, defaultMarkdownSerializer } from "prosemirror-markdown";
import { EditorState, Plugin, type Transaction } from "prosemirror-state";
import type { Step } from "prosemirror-transform";
import * as Diff from "diff";
import LunaDBAPIClientBridge, { DocumentTransaction, LunaDBDocument } from "@lunadb-io/lunadb-client-js";
import type { Node } from "prosemirror-model";

export class LunaDBProseMirrorPlugin {
    documentKey: string;
    pointer: string;
    client: LunaDBAPIClientBridge;
    dirty: boolean;
    baseDocument: LunaDBDocument | undefined;
    state: EditorState;

    constructor(documentKey: string, pointer: string, client: LunaDBAPIClientBridge, state: EditorState) {
        this.documentKey = documentKey;
        this.pointer = pointer;
        this.client = client;
        this.dirty = false;
        this.baseDocument = undefined;
        this.state = state;
    }

    performedInitialSync(): boolean {
        return this.baseDocument !== undefined;
    }

    diff(state: EditorState): Diff.Change[]{
        if (this.baseDocument) {
            let baseState = this.baseDocument.get(this.pointer);
            if (typeof baseState !== "string") {
                throw new Error("Document child at provided pointer is not a string");
            }
            let currentStateAsMarkdown = defaultMarkdownSerializer.serialize(state.doc);
            let changes = Diff.diffChars(baseState, currentStateAsMarkdown);
            return changes;
        } else {
            throw new Error("Must perform initial document sync before diffing");
        }
    }

    packageForLuna(patch: Diff.Change[]): DocumentTransaction {
        if (this.baseDocument) {
            let txn = this.baseDocument.newTransaction();
            let idx = 0;
            patch.forEach((change) => {
                if (change.count) {
                    if (change.added) {
                        txn.stringInsert(this.pointer, idx, change.value);
                        idx += change.count;
                    } else if (change.removed) {
                        txn.stringRemove(this.pointer, idx, change.count);
                    } else {
                        idx += change.count;
                    }
                }
            });
            return txn;
        } else {
            throw new Error("Must perform initial document sync before diffing");
        }
    }
    
    markAsDirty() {
        this.dirty = true;
    }

    markAsClean() {
        this.dirty = false;
    }

    isDirty(): boolean {
        return this.dirty;
    }

    async loadDocument(): Promise<Node>{
        let resp = await this.client.loadDocument(this.documentKey);
        this.baseDocument = resp;
        let contents = this.getContents();
        if (contents !== null) {
            return contents;
        } else {
            throw new Error("Received null document while parsing");
        }
    }

    async syncDocument(currentState: EditorState): Promise<Node> {
        // todo: diff contents against currentState so we can rebase
        // any changes that occurred in the meantime
        if (this.baseDocument !== undefined) {
            let diff = this.diff(currentState);
            let txn = this.packageForLuna(diff);
            await this.client.syncDocument(this.baseDocument, txn);

            let contents = this.getContents();
            if (contents !== null) {
                return contents;
            } else {
                throw new Error("Received null document while parsing");
            }
        } else {
            throw new Error("Must perform initial sync before further syncs can be performed");
        }
    }

    getContents(): Node | null {
        if (this.baseDocument) {
            let baseState = this.baseDocument.get(this.pointer);
            return defaultMarkdownParser.parse(baseState);
        } else {
            return defaultMarkdownParser.parse("");
        }
    }
}

export default function createLunaDBPlugin(documentKey: string, pointer: string, client: LunaDBAPIClientBridge): Plugin {
    return new Plugin({
        state: {
            init(config, instance) {
                return new LunaDBProseMirrorPlugin(documentKey, pointer, client, instance);
            },
            apply(tr, plugin, oldState, newState) {
                console.log(oldState.toJSON(), newState.toJSON());
                if (tr.docChanged) {
                    plugin.markAsDirty();
                }
                return plugin;
            }
        }
    });
}
