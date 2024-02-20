<script lang="ts">
	import Alert from './alert.svelte';
	import LoaderButton from './loader_button.svelte';
	import Task from './task.svelte';

	class TaskData {
		title: string;
		description: string;
		completed: boolean;
		subtasks: Array<SubtaskData>;

		constructor(
			title: string,
			description: string,
			completed: boolean,
			subtasks: Array<SubtaskData>
		) {
			this.title = title;
			this.description = description;
			this.completed = completed;
			this.subtasks = subtasks;
		}
	}

	class SubtaskData {
		title: string;
		completed: boolean;

		constructor(title: string, completed: boolean) {
			this.title = title;
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

	let active_document_state = new DocumentState(document_id);
	let shadow_document_state = new DocumentState(document_id);
	let lastLoadFailed: boolean = false;

	async function loadDocument() {
		let response: any = await client.v0betaLoadDocument(shadow_document_state.document_id);
		if (response.isSuccess()) {
			shadow_document_state.tasks = response.content.contents.todoList;
			lastLoadFailed = false;
		} else {
			lastLoadFailed = true;
		}
	}
</script>

<Alert bind:showAlert={lastLoadFailed}>Failed to load document</Alert>

<LoaderButton class="btn-primary" on:load={loadDocument}>Load Document</LoaderButton>

{#if shadow_document_state.tasks !== undefined}
	{#each shadow_document_state.tasks as task}
		<Task title={task.title} description={task.description} completed={task.completed}></Task>
	{/each}
{/if}
