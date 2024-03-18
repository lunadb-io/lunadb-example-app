<script lang="ts">
	import { onMount } from 'svelte';

	import type LunaDBAPIClientBridge from '@lunadb-io/lunadb-client-js';
	import { EditorView } from 'prosemirror-view';
	import { EditorState } from 'prosemirror-state';
	import { exampleSetup } from 'prosemirror-example-setup';
	import { schema, defaultMarkdownParser } from 'prosemirror-markdown';
	import LoaderButton from '$lib/loader_button.svelte';
	import Alert from '$lib/alert.svelte';

	export let document_id: string;
	export let client: LunaDBAPIClientBridge;

	let state = EditorState.create({
		// @ts-ignore
		doc: defaultMarkdownParser.parse(''),
		plugins: exampleSetup({ schema })
	});

	let view;

	let lastSyncedTimestamp: string | undefined;
	let lastLoadFailed: boolean = false;
	let lastSyncFailed: boolean = false;

	onMount(() => {
		view = new EditorView(document.querySelector('#editor'), {
			state,
			editable() {
				return true;
			}
		});
	});

	// function warnUnsavedChanges() {
	// 	if (currentTransaction !== undefined && currentTransaction.changes.length > 0) {
	// 		if (event !== undefined) {
	// 			event.preventDefault();
	// 			event.returnValue = true;
	// 		}
	// 	}
	// }
</script>

<!-- <svelte:window on:beforeunload={warnUnsavedChanges} /> -->

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
	</div>
	<div class="pt-4">
		<div id="editor" class="prose max-w-full"></div>
	</div>
</div>
