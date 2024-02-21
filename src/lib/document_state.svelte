<script lang="ts">
	import Addtask from './addtask.svelte';
	import Alert from './alert.svelte';
	import LoaderButton from './loader_button.svelte';
	import Task from './task.svelte';

	// @ts-ignore
	import JsonPointer from 'json-pointer';

	class TaskData {
		title: string;
		description: string;
		completed: boolean;

		constructor(title: string, description: string, completed: boolean) {
			this.title = title;
			this.description = description;
			this.completed = completed;
		}
	}

	class DocumentState {
		todoList: Array<TaskData> | undefined;
		lastSynced: number;
		document_id: string;
		deltaset: Array<object>;

		constructor(document_id: string) {
			this.todoList = undefined;
			this.lastSynced = 0;
			this.document_id = document_id;
			this.deltaset = [];
		}

		getRaw() {
			return JSON.stringify(this.todoList);
		}
	}

	export let client: any;
	export let document_id: string;

	let documentState = new DocumentState(document_id);
	let shadowDocumentState = new DocumentState(document_id);

	let lastLoadFailed: boolean = false;
	let lastSyncFailed: boolean = false;
	let loaderButton: any;
	let syncerButton: any;

	async function loadDocument() {
		loaderButton.setIsLoading();
		let response: any = await client.v0betaLoadDocument(documentState.document_id);
		if (response.isSuccess()) {
			console.log('Received document state', response.content);
			shadowDocumentState.todoList = response.content.contents.todoList;
			shadowDocumentState.lastSynced = response.content.hlc;
			rerender();
			lastLoadFailed = false;
		} else {
			lastLoadFailed = true;
		}
		loaderButton.setIsLoaded();
	}

	async function syncChanges() {
		syncerButton.setIsLoading();
		console.log('Syncing deltaset', documentState.deltaset);
		let response: any = await client.v0betaSyncDocument(
			documentState.document_id,
			documentState.lastSynced,
			documentState.deltaset
		);
		if (response.isSuccess()) {
			response.content.changes.forEach(function (delta: any) {
				console.log('Applying delta to shadow state', delta);
				let op = delta.op;
				let pointer = delta.pointer;

				if (pointer === undefined) {
					console.error('Received operation with undefined pointer');
					return;
				}

				switch (op) {
					case 'insert':
						JsonPointer.set(shadowDocumentState, pointer, delta.content);
						break;
					case 'replace':
						JsonPointer.set(shadowDocumentState, pointer, delta.content);
						break;
					case 'delete':
						JsonPointer.remove(shadowDocumentState, pointer);
						break;
					default:
						console.error('Operation type ' + op + ' not handled');
				}
			});
			shadowDocumentState.lastSynced = response.content.hlc;
			rerender();
			lastSyncFailed = false;
		} else {
			lastSyncFailed = true;
		}
		syncerButton.setIsLoaded();
	}

	function rerender() {
		console.log('Rerendering document state by cloning shadow state');
		documentState = structuredClone(shadowDocumentState);
	}

	function processTaskUpdate(task_pos: number, e: CustomEvent) {
		let detail = e.detail;
		let pointer = '/todoList/' + task_pos + '/' + detail.key;
		let delta = { op: 'replace', pointer: pointer, content: detail.value };
		console.log('New delta recorded', delta);
		documentState.deltaset.push(delta);
	}

	function processTaskCreation(e: CustomEvent) {
		if (documentState.todoList !== undefined) {
			let detail = e.detail;
			let pointer = '/todoList/' + documentState.todoList?.length;
			let data = new TaskData(detail.title, detail.description, false);
			documentState.todoList = [...documentState.todoList, data];
			let delta = {
				op: 'insert',
				pointer: pointer,
				content: data
			};
			console.log('New delta recorded', delta);
			documentState.deltaset.push(delta);
		}
	}

	function processTaskDeletion(task_pos: number) {
		if (documentState.todoList !== undefined) {
			let pointer = '/todoList/' + task_pos;
			documentState.todoList = documentState.todoList?.toSpliced(task_pos, 1);
			let delta = {
				op: 'delete',
				pointer: pointer
			};
			console.log('New delta recorded', delta);
			documentState.deltaset.push(delta);
		}
	}

	function warnUnsavedChanges() {
		if (documentState.deltaset.length > 0) {
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
		</div>
		<div style="margin-left:auto" class="self-center space-x-2">
			<LoaderButton class="btn-secondary btn-xs" bind:this={loaderButton} on:load={loadDocument}>
				Load Document
			</LoaderButton>
			{#if documentState.todoList !== undefined}
				<LoaderButton class="btn-primary btn-xs" bind:this={syncerButton} on:load={syncChanges}>
					Sync Changes
				</LoaderButton>
			{/if}
		</div>
	</div>
	{#if documentState.todoList !== undefined}
		{#each documentState.todoList as task, pos}
			<Task
				title={task.title}
				description={task.description}
				completed={task.completed}
				on:update={(e) => processTaskUpdate(pos, e)}
				on:delete={() => processTaskDeletion(pos)}
			></Task>
		{/each}
		<Addtask on:addTask={(e) => processTaskCreation(e)}></Addtask>
	{/if}
</div>
