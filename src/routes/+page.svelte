<script lang="ts">
	// @ts-ignore
	import { PUBLIC_DB_HOST } from '$env/static/public';

	import Alert from '$lib/alert.svelte';
	import LoaderButton from '$lib/loader_button.svelte';

	import LunaDBAPIClientBridge from '@lunadb-io/lunadb-client-js';
	import { goto } from '$app/navigation';

	let client = new LunaDBAPIClientBridge(PUBLIC_DB_HOST);

	let existingTodoListId = '';
	let todoListLoaderButton: any;

	let existingTextDocId = '';
	let textDocLoaderButton: any;

	let documentCreationFailed: boolean = false;

	async function createNewTodoList() {
		todoListLoaderButton.setIsLoading();
		let tempId = crypto.randomUUID();

		try {
			await client.createDocument(tempId);
			// TODO: initial content will eventually be part of the createDocument call.
			// This is not the preferred way to accomplish this but it doesn't require loading the doc.
			await client.client.v0betaSyncDocument(tempId, '0', [
				{ op: 'insert', pointer: '/todoList', content: [] }
			]);
		} catch (e) {
			documentCreationFailed = true;
			todoListLoaderButton.setIsLoaded();
			return;
		}

		documentCreationFailed = false;
		todoListLoaderButton.setIsLoaded();
		goto('/todo/' + tempId);
	}

	function loadExistingTodoList() {
		goto('/todo/' + existingTodoListId);
	}

	async function createNewTextDoc() {
		textDocLoaderButton.setIsLoading();
		let tempId = crypto.randomUUID();

		try {
			await client.createDocument(tempId);
			// TODO: initial content will eventually be part of the createDocument call.
			// This is not the preferred way to accomplish this but it doesn't require loading the doc.
			await client.client.v0betaSyncDocument(tempId, '0', [
				{ op: 'insert', pointer: '/text', content: '' }
			]);
		} catch (e) {
			documentCreationFailed = true;
			textDocLoaderButton.setIsLoaded();
			return;
		}

		documentCreationFailed = false;
		textDocLoaderButton.setIsLoaded();
		goto('/text/' + tempId);
	}

	function loadExistingTextDoc() {
		goto('/text/' + existingTextDocId);
	}
</script>

<Alert bind:showAlert={documentCreationFailed}>Failed to create document</Alert>

<div class="hero min-h-screen min-w-screen">
	<div class="hero-content flex-col space-x-1">
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
		<div
			class="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-x-4 lg:space-y-0"
		>
			<div class="card card-normal bg-base-200 w-10/12">
				<div class="card-body">
					<div class="flex flex-col items-center pt-4">
						<LoaderButton
							class="btn-primary w-full"
							bind:this={todoListLoaderButton}
							on:load={createNewTodoList}
						>
							Create New Todo List
						</LoaderButton>
						<p class="py-3">Or...</p>
						<div class="space-y-3">
							<input
								type="text"
								placeholder="Enter document ID"
								class="input input-bordered w-full"
								bind:value={existingTodoListId}
							/>
							<button class="btn w-full" on:click={loadExistingTodoList}
								>Load Existing Todo List</button
							>
						</div>
					</div>
				</div>
			</div>
			<div class="card card-normal bg-base-200 w-10/12">
				<div class="card-body">
					<div class="flex flex-col items-center pt-4">
						<LoaderButton
							class="btn-secondary w-full"
							bind:this={textDocLoaderButton}
							on:load={createNewTextDoc}
						>
							Create New Text Document
						</LoaderButton>
						<p class="py-3">Or...</p>
						<div class="space-y-3">
							<input
								type="text"
								placeholder="Enter document ID"
								class="input input-bordered w-full"
								bind:value={existingTextDocId}
							/>
							<button class="btn w-full" on:click={loadExistingTextDoc}
								>Load Existing Text Document</button
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
