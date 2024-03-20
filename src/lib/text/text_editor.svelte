<script lang="ts">
	import { onMount } from 'svelte';

	import type LunaDBAPIClientBridge from '@lunadb-io/lunadb-client-js';
	import { EditorView } from 'prosemirror-view';
	import { EditorState, Transaction } from 'prosemirror-state';
	import { exampleSetup } from 'prosemirror-example-setup';
	import { schema, defaultMarkdownParser } from 'prosemirror-markdown';
	import LoaderButton from '$lib/loader_button.svelte';
	import Alert from '$lib/alert.svelte';

	import createLunaDBPlugin from './plugin';

	export let document_id: string;
	export let client: LunaDBAPIClientBridge;

	let view: EditorView;

	let lastSyncedTimestamp: string | undefined;
	let lastLoadFailed: boolean = false;
	let lastSyncFailed: boolean = false;
	let loaderButton: any;
	let syncerButton: any;

	let plugin = createLunaDBPlugin(client, document_id, '/textDoc');

	onMount(() => {
		let state = EditorState.create({
			schema,
			plugins: exampleSetup({ schema }).concat(plugin)
		});
		view = new EditorView(document.querySelector('#editor'), {
			state,
			editable: () => false
		});
	});

	function warnUnsavedChanges() {
		let pluginState = plugin.getState(view.state);
		if (pluginState?.isDirty()) {
			if (event !== undefined) {
				event.preventDefault();
				event.returnValue = true;
			}
		}
	}

	async function loadDocument() {
		let pluginState = plugin.getState(view.state);
		try {
			let newContents = await pluginState?.loadDocument(schema);
			let txn = view.state.tr;
			txn.replaceWith(0, view.state.doc.content.size, newContents);
			view.dispatch(txn);
			view.setProps({
				editable: () => true
			});
		} catch (e) {
			console.error(e);
			lastLoadFailed = true;
		}
	}

	async function syncChanges() {
		let pluginState = plugin.getState(view.state);
		try {
			// note: if changes are made while we are syncing then they have to be rebased.
			// For most applications you can probably get away with "silently" locking the
			// document and skipping rebasing altogether.
			// If that's not acceptable, you'll need to rebase the local changes against
			// a stepmap derived from the content of syncDocument.
			view.setProps({
				editable: () => false
			});
			let newContents = await pluginState?.syncDocument(schema, view.state);
			let txn = view.state.tr;
			txn.replaceWith(0, view.state.doc.content.size, newContents);
			view.dispatch(txn);
		} catch (e) {
			console.error(e);
			lastSyncFailed = true;
		}
		view.setProps({
			editable: () => true
		});
	}
</script>

<svelte:window on:beforeunload={warnUnsavedChanges} />

<Alert bind:showAlert={lastLoadFailed}>Failed to load document</Alert>
<Alert bind:showAlert={lastSyncFailed}>Failed to sync changes</Alert>

<div>
	<div class="flex flex-row w-full">
		<div class="mb-3">
			<p class="text-lg font-bold">Your Text Document</p>
			<p class="italic text-xs text-gray-500">Document: {document_id}</p>
			{#if lastSyncedTimestamp !== undefined}
				<p class="italic text-xs text-gray-500">
					Most Recent Change ID: {lastSyncedTimestamp}
				</p>
			{/if}
		</div>
		<div style="margin-left:auto" class="self-center space-x-2">
			<LoaderButton class="btn-secondary btn-xs" bind:this={loaderButton} on:load={loadDocument}>
				Reload Document
			</LoaderButton>
			<LoaderButton class="btn-primary btn-xs" bind:this={syncerButton} on:load={syncChanges}>
				Sync Changes
			</LoaderButton>
		</div>
	</div>
	<div class="pt-4">
		<div id="editor" class="prose max-w-full"></div>
	</div>
</div>
