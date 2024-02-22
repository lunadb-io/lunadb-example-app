<script lang="ts">
	import Alert from '$lib/alert.svelte';
	import DocumentState from '$lib/document_state.svelte';
	import LoaderButton from '$lib/loader_button.svelte';

	// @ts-ignore
	import LunaDBClient from 'lunadb-client-js';

	export let data;
	// @ts-ignore
	let document_id: string | null = data.document_id;

	let client = new LunaDBClient('http://localhost:8888');
	client.toggleQueryAnalysis(true);

	let existingDocId = '';
	let documentCreationFailed: boolean = false;
	let loaderButton: any;

	async function createNewDocument() {
		loaderButton.setIsLoading();
		let tempId = crypto.randomUUID();
		let response = await client.v0betaCreateDocument(tempId);
		if (!response.isSuccess()) {
			documentCreationFailed = true;
			return;
		}

		response = await client.v0betaSyncDocument(tempId, '0', [
			{
				op: 'insert',
				pointer: '/todoList',
				content: [
					{
						title: 'Sample Task',
						description: 'This is a sample task!',
						completed: false
					}
				]
			}
		]);
		if (!response.isSuccess()) {
			documentCreationFailed = true;
			return;
		}

		document_id = tempId;
		documentCreationFailed = false;
		loaderButton.setIsLoaded();

		const urlParams = new URLSearchParams(window.location.search);
		urlParams.set('id', document_id);
		window.location.search = urlParams.toString();
	}
</script>

<Alert bind:showAlert={documentCreationFailed}>Failed to create document</Alert>

{#if document_id === null}
	<div class="flex flex-col items-center pt-4">
		<LoaderButton
			class="btn-primary w-full max-w-xs"
			bind:this={loaderButton}
			on:load={createNewDocument}
		>
			Create New
		</LoaderButton>
		<p class="py-3">Or...</p>
		<div class="space-y-3">
			<input
				type="text"
				placeholder="Enter document ID"
				class="input input-bordered w-full max-w-xs"
				bind:value={existingDocId}
			/>
			<button class="btn w-full max-w-xs" on:click={() => (document_id = existingDocId)}
				>Use Existing</button
			>
		</div>
	</div>
{:else}
	<DocumentState {client} {document_id}></DocumentState>
{/if}
