<script lang="ts">
	import Addtask from './addtask.svelte';
	import Alert from './alert.svelte';
	import LoaderButton from './loader_button.svelte';
	import Task from './task.svelte';

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
		tasks: Array<TaskData> | undefined;
		lastSynced: number;
		document_id: string;
		deltaset: Array<object>;

		constructor(document_id: string) {
			this.tasks = undefined;
			this.lastSynced = 0;
			this.document_id = document_id;
			this.deltaset = [];
		}

		getRaw() {
			return JSON.stringify(this.tasks);
		}
	}

	export let client: any;
	export let document_id: string;

	let documentState = new DocumentState(document_id);
	let lastLoadFailed: boolean = false;

	async function loadDocument() {
		let response: any = await client.v0betaLoadDocument(documentState.document_id);
		if (response.isSuccess()) {
			documentState.tasks = response.content.contents.todoList;
			lastLoadFailed = false;
		} else {
			lastLoadFailed = true;
		}
	}

	function processTaskUpdate(task_pos: number, e: CustomEvent) {
		let detail = e.detail;
		let pointer = '/todoList/' + task_pos + '/' + detail.key;
		let delta = { op: 'insert', pointer: pointer, content: detail.value };
		console.log('New delta recorded', delta);
		documentState.deltaset.push(delta);
	}

	function processTaskCreation(e: CustomEvent) {
		if (documentState.tasks !== undefined) {
			let detail = e.detail;
			let pointer = '/todoList/' + documentState.tasks?.length;
			let data = new TaskData(detail.title, detail.description, false);
			documentState.tasks = [...documentState.tasks, data];
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
		if (documentState.tasks !== undefined) {
			let pointer = '/todoList/' + task_pos;
			documentState.tasks = documentState.tasks?.toSpliced(task_pos, 1);
			let delta = {
				op: 'remove',
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

<div>
	<div class="flex flex-row w-full">
		<div class="mb-3">
			<p class="text-lg font-bold">Your Tasks</p>
			<p class="italic text-xs text-gray-500">Document: {document_id}</p>
		</div>
		<div style="margin-left:auto" class="self-center">
			<LoaderButton class="btn-primary btn-xs" on:load={loadDocument}>Load Document</LoaderButton>
		</div>
	</div>
	{#if documentState.tasks !== undefined}
		{#each documentState.tasks as task, pos}
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
