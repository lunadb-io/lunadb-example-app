<script lang="ts">
	import Alert from '$lib/alert.svelte';
	import DocumentState from '$lib/document_state.svelte';

	// @ts-ignore
	import LunaDBClient from 'lunadb-client-js';

	export let data;
	// @ts-ignore
	let document_id: string | undefined = data.document_id;

	let client = new LunaDBClient('http://localhost:8888');
	client.toggleQueryAnalysis(true);

	let existingDocId = '';
	let creatingDocument: boolean = false;
	let documentCreationFailed: boolean = false;

	async function createDocument(id: string) {
		let response: any = await client.v0betaCreateDocument(id);
		return response.isSuccess();
	}

	async function createNewDocument() {
		if (!creatingDocument) {
			let tempId = crypto.randomUUID();
			let creationSucceeded = await createDocument(tempId);
			if (creationSucceeded) {
				document_id = tempId;
				documentCreationFailed = false;
			} else {
				documentCreationFailed = true;
			}
		}
		creatingDocument = false;
	}
</script>

<Alert bind:showAlert={documentCreationFailed}>Failed to create document</Alert>

{#if document_id === undefined}
	<button class="btn btn-primary" on:click={createNewDocument}>
		{#if creatingDocument}
			<span class="loading loading-spinner"></span>
		{/if}
		Create New</button
	>
	<p>Or...</p>
	<input
		type="text"
		placeholder="Enter document ID"
		class="input input-bordered w-full max-w-xs"
		bind:value={existingDocId}
	/>
	<button class="btn" on:click={() => (document_id = existingDocId)}>Use Existing</button>
{:else}
	<p>Your document's ID is: {document_id}</p>
	<DocumentState {client} {document_id}></DocumentState>
{/if}
