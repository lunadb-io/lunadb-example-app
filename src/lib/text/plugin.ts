import { DocumentTransaction, type LunaDBDocument } from "@lunadb-io/lunadb-client-js";
import type LunaDBAPIClientBridge from "@lunadb-io/lunadb-client-js";
import { detailedDiff, type DetailedDiff } from "deep-object-diff";
import * as jsondiffpatch from "jsondiffpatch";
import DiffMatchPatch from "diff-match-patch";
import type { BaseFormatterContext, DeltaType, NodeType } from "jsondiffpatch/formatters/base";
import BaseFormatter from "jsondiffpatch/formatters/base";
import { Node, Schema } from "prosemirror-model";
import { Plugin, type EditorState } from "prosemirror-state";

const JDPInstance = jsondiffpatch.create({
    arrays: {
        detectMove: false
    },
    textDiff: {
        diffMatchPatch: DiffMatchPatch,
        minLength: 0
    }
});

class LunaDBProseMirrorPlugin {
    client: LunaDBAPIClientBridge;
    documentId: string;
    objectKey: string;
    shadowDocument: LunaDBDocument | undefined;

    constructor(client: LunaDBAPIClientBridge, documentId: string, objectKey: string) {
        this.client = client;
        this.documentId = documentId;
        this.objectKey = objectKey;
    }

    async loadDocument(schema: Schema): Promise<Node> {
        let doc = await this.client.loadDocument(this.documentId);
        this.shadowDocument = doc;
        let docContents = this.shadowDocument.get(this.objectKey);
        return Node.fromJSON(schema, docContents);
    }

    async syncDocument(schema: Schema, currentState: EditorState): Promise<Node> {
        if (this.shadowDocument === undefined) {
            throw new Error("Document must be loaded before we can operate on it");
        }

        let txn = this.diffDocument(currentState);
        await this.client.syncDocument(this.shadowDocument, txn);
        let docContents = this.shadowDocument.get(this.objectKey);
        return Node.fromJSON(schema, docContents);
    }

    diffDocument(currentState: EditorState): DocumentTransaction {
        if (this.shadowDocument === undefined) {
            throw new Error("Document must be loaded before we can operate on it");
        }

        let currentDoc = currentState.doc.toJSON();
        let baseDoc = this.shadowDocument.get(this.objectKey);
        let docDiff = JDPInstance.diff(baseDoc, currentDoc);
        let txn = new LunaDBTransactionFormatter(this.shadowDocument, this.objectKey).format(docDiff);
        return txn;
    }
}

interface LunaDBTransactionFormatterContext extends BaseFormatterContext {
    txn: DocumentTransaction;
    path: (string | number)[];
    basePointer: string;
    currentPath: () => string;
}

class LunaDBTransactionFormatter extends BaseFormatter<LunaDBTransactionFormatterContext, DocumentTransaction> {
    txn: DocumentTransaction;
    basePointer: string;

    constructor(doc: LunaDBDocument, objectKey: string) {
        super();
        this.txn = doc.newTransaction();
        this.basePointer = objectKey;
    }

    prepareContext(context: Partial<LunaDBTransactionFormatterContext>): void {
        super.prepareContext(context);
        context.path = [];
        context.currentPath = function () {
            return `${this.basePointer}/${this.path!.join('/')}`;
        };
    }

    rootBegin(): void {}
    rootEnd(): void {}
    format_unchanged(): void {}
    format_moved(): void {}
    format_movedestination(): void {}

    nodeBegin(context: LunaDBTransactionFormatterContext, key: string, leftKey: string | number, type: DeltaType, nodeType: NodeType, isLast: boolean): void {
        context.path.push(leftKey);
    }

    nodeEnd(context: LunaDBTransactionFormatterContext, key: string, leftKey: string | number, type: DeltaType, nodeType: NodeType, isLast: boolean): void {
        context.path.pop();
    }

    format_added(context: LunaDBTransactionFormatterContext, delta: jsondiffpatch.AddedDelta, leftValue: unknown, key: string | undefined, leftKey: string | number | undefined): void {
        context.txn.insert(context.currentPath(), delta[0]);
    }

    format_modified(context: LunaDBTransactionFormatterContext, delta: jsondiffpatch.ModifiedDelta, leftValue: unknown, key: string | undefined, leftKey: string | number | undefined): void {
        context.txn.replace(context.currentPath(), delta[1]);
    }

    format_deleted(context: LunaDBTransactionFormatterContext, delta: jsondiffpatch.DeletedDelta, leftValue: unknown, key: string | undefined, leftKey: string | number | undefined): void {
        context.txn.delete(context.currentPath());
    }

    format_textdiff(context: LunaDBTransactionFormatterContext, delta: jsondiffpatch.TextDiffDelta, leftValue: unknown, key: string | undefined, leftKey: string | number | undefined): void {
        let rawDiff = new DiffMatchPatch().patch_fromText(delta[0]);
        console.log(rawDiff);
        // todo
        // rawDiff.forEach((step) => {});
    }

    format_node(context: LunaDBTransactionFormatterContext, delta: jsondiffpatch.ObjectDelta | jsondiffpatch.ArrayDelta, leftValue: unknown, key: string | undefined, leftKey: string | number | undefined): void {
        this.formatDeltaChildren(context, delta, leftValue);
    }

    format(delta: jsondiffpatch.Delta, left?: unknown): DocumentTransaction {
        const context = {txn: this.txn, basePointer: this.basePointer};
        this.prepareContext(context);
        const preparedContext = context as LunaDBTransactionFormatterContext;
        this.recurse(preparedContext, delta, left);
        return preparedContext.txn;
    }
}

export default function createLunaDBPlugin(client: LunaDBAPIClientBridge, documentId: string, objectKey: string): Plugin {
    return new Plugin({
        state: {
            init(config, instance) {
                return new LunaDBProseMirrorPlugin(client, documentId, objectKey);
            },
            apply(tr, plugin, oldState, newSennate) {
                return plugin;
            }
        }
    });
}
