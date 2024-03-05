<script lang="ts">
	// @ts-ignore
	import { PUBLIC_DB_HOST } from '$env/static/public';

	import Alert from '$lib/alert.svelte';
	import DocumentState from '$lib/document_state.svelte';
	import LoaderButton from '$lib/loader_button.svelte';

	// @ts-ignore
	import LunaDBClient from 'lunadb-client-js';

	export let data;
	// @ts-ignore
	let document_id: string | null = data.document_id;

	let client = new LunaDBClient(PUBLIC_DB_HOST);
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
			loaderButton.setIsLoaded();
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
			loaderButton.setIsLoaded();
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
	<div class="hero min-h-screen min-w-screen">
		<div class="hero-content flex-col space-x-1 lg:flex-row">
			<div class="text-center lg:text-left">
				<h1 class="text-5xl font-bold">Welcome to LunaDB!</h1>
				<p class="py-6">
					This playground will help you understand the internals of any application that uses LunaDB
					to implement collaborative editing! We recommend having your network console open, as this
					playground logs events as they happen.
				</p>
				<p class="pb-6">
					You can find the code for this application at <span class="prose prose-code">
						<a href="https://github.com/lunadb-io/lunadb-example-app">
							<code>lunadb-io/lunadb-example-app</code>
						</a>
					</span>. If you have any questions, you can visit us at
					<span class="prose prose-code">
						<a href="https://lunadb.io"><code>lunadb.io</code></a></span
					>
					or email us at
					<span class="prose prose-code">
						<a href="mailto:hello@lunadb.io"><code>hello@lunadb.io</code></a></span
					>!
				</p>
				<p></p>
			</div>
			<div class="card card-normal w-full max-w-sm bg-base-200">
				<div class="card-body">
					<div class="flex flex-col items-center pt-4">
						<LoaderButton
							class="btn-primary w-full"
							bind:this={loaderButton}
							on:load={createNewDocument}
						>
							Create New Todo List
						</LoaderButton>
						<p class="py-3">Or...</p>
						<div class="space-y-3">
							<input
								type="text"
								placeholder="Enter document ID"
								class="input input-bordered w-full"
								bind:value={existingDocId}
							/>
							<button class="btn w-full" on:click={() => (document_id = existingDocId)}
								>Load Existing Document</button
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{:else}
	<DocumentState {client} {document_id}></DocumentState>
{/if}
