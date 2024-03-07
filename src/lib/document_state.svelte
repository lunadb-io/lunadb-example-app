<script lang="ts">
	import Addtask from './addtask.svelte';
	import Alert from './alert.svelte';
	import LoaderButton from './loader_button.svelte';
	import Task from './task.svelte';

	import LunaDBAPIClientBridge, {
		DocumentTransaction,
		LunaDBDocument
	} from '@lunadb-io/lunadb-client-js';

	interface TaskData {
		title: string;
		description: string;
		completed: boolean;
	}

	class TodoList {
		todoList: Array<TaskData> | undefined;
	}

	export let client: LunaDBAPIClientBridge;
	export let document_id: string;

	let liveDocumentState: TodoList | undefined;
	let shadowDocumentState: LunaDBDocument | undefined;
	let currentTransaction: DocumentTransaction | undefined;
	let lastSyncedTimestamp: string | undefined;

	let lastLoadFailed: boolean = false;
	let lastSyncFailed: boolean = false;
	let loaderButton: any;
	let syncerButton: any;

	async function loadDocument() {
		loaderButton.setIsLoading();
		try {
			shadowDocumentState = await client.loadDocument(document_id);
			currentTransaction = shadowDocumentState.newTransaction();
			console.log('Received document state', shadowDocumentState.baseContent);
			lastLoadFailed = false;
			rerender();
		} catch (e) {
			lastLoadFailed = true;
		}
		loaderButton.setIsLoaded();
	}

	async function syncChanges() {
		if (shadowDocumentState === undefined || currentTransaction === undefined) {
			lastSyncFailed = true;
			throw new Error('Document must be loaded');
		}

		syncerButton.setIsLoading();
		try {
			// NOTE: This could blow out changes made between when the sync button was pressed
			// and the change was actually applied. Editors like ProseMirror fix this problem
			// by allowing you to correct a transaction against remote changes, kind of like
			// git's rebase. Our application here does not provide that however.
			let applied = await client.syncDocument(shadowDocumentState, currentTransaction);
			currentTransaction = shadowDocumentState.newTransaction();
			console.log('Applied changes', applied);
			lastSyncFailed = false;
			rerender();
		} catch (e) {
			lastSyncFailed = true;
		}
		syncerButton.setIsLoaded();
	}

	function rerender() {
		console.log('Rerendering document state by cloning shadow state');
		liveDocumentState = structuredClone(shadowDocumentState?.baseContent) as TodoList;
		lastSyncedTimestamp = shadowDocumentState?.lastSynced;
	}

	function processTaskUpdate(task_pos: number, e: CustomEvent) {
		if (currentTransaction !== undefined) {
			let detail = e.detail;
			let pointer = '/todoList/' + task_pos + '/' + detail.key;
			currentTransaction.replace(pointer, detail.value);
			console.log('Task updated', pointer, detail.value);
		}
	}

	function processTaskCreation(e: CustomEvent) {
		if (liveDocumentState?.todoList !== undefined && currentTransaction !== undefined) {
			let detail = e.detail;
			let pointer = '/todoList/' + liveDocumentState.todoList.length;
			let data: TaskData = {
				title: detail.title,
				description: detail.description,
				completed: false
			};
			liveDocumentState.todoList = [...liveDocumentState.todoList, data];
			currentTransaction.insert(pointer, data);
			console.log('Task created', pointer, data);
		}
	}

	function processTaskDeletion(task_pos: number) {
		if (liveDocumentState?.todoList !== undefined && currentTransaction !== undefined) {
			let pointer = '/todoList/' + task_pos;
			liveDocumentState.todoList = liveDocumentState.todoList.toSpliced(task_pos, 1);
			currentTransaction?.delete(pointer);
			console.log('Task deleted', pointer);
		}
	}

	function warnUnsavedChanges() {
		if (currentTransaction !== undefined && currentTransaction.changes.length > 0) {
			if (event !== undefined) {
				event.preventDefault();
				event.returnValue = true;
			}
		}
	}
</script>

<svelte:window on:beforeunload={warnUnsavedChanges} />

<Alert bind:showAlert={lastLoadFailed}>Failed to load document</Alert>
<Alert bind:showAlert={lastSyncFailed}>Failed to sync changes</Alert>

<div>
	<div class="flex flex-row w-full">
		<div class="mb-3">
			<p class="text-lg font-bold">Your Tasks</p>
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
			<LoaderButton
				class="btn-primary btn-xs"
				disabled={liveDocumentState === undefined}
				bind:this={syncerButton}
				on:load={syncChanges}
			>
				Sync Changes
			</LoaderButton>
		</div>
	</div>
	{#if liveDocumentState?.todoList !== undefined}
		{#each liveDocumentState.todoList as task, pos}
			<Task
				title={task.title}
				description={task.description}
				completed={task.completed}
				on:update={(e) => processTaskUpdate(pos, e)}
				on:delete={() => processTaskDeletion(pos)}
			></Task>
		{/each}
		<Addtask on:addTask={(e) => processTaskCreation(e)}></Addtask>
	{:else}
		<div class="flex flex-row w-full justify-center mt-10">
			<div class="card w-96 bg-neutral text-neutral-content">
				<div class="card-body items-center text-center">
					<p>Before you can make changes, you have to load the current state of the document.</p>
					<p>Once that's done, then application can report using smaller changes.</p>
					<div class="card-actions justify-end pt-4">
						<LoaderButton class="btn-secondary" bind:this={loaderButton} on:load={loadDocument}>
							Load Document
						</LoaderButton>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
