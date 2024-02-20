<script lang="ts">
	import Alert from './alert.svelte';

	class Task {
		title: string;
		description: string;
		completed: boolean;
		subtasks: Array<Subtask>;

		constructor(title: string, description: string, completed: boolean, subtasks: Array<Subtask>) {
			this.title = title;
			this.description = description;
			this.completed = completed;
			this.subtasks = subtasks;
		}
	}

	class Subtask {
		title: string;
		completed: boolean;

		constructor(title: string, completed: boolean) {
			this.title = title;
			this.completed = completed;
		}
	}

	class TodoList {
		tasks: Array<Task>;

		constructor(tasks: Array<Task>) {
			this.tasks = tasks;
		}
	}

	class DocumentState {
		raw: object | undefined;
		todoList: TodoList;
		lastSynced: number;
		document_id: string;
		deltaset: Array<object>;

		constructor(document_id: string) {
			this.todoList = new TodoList([]);
			this.lastSynced = 0;
			this.document_id = document_id;
			this.deltaset = [];
			this.raw = undefined;
		}
	}

	export let client: any;
	export let document_id: string;

	let active_document_state = new DocumentState(document_id);
	let shadow_document_state = new DocumentState(document_id);
	let loading: boolean = false;
	let lastLoadFailed: boolean = false;

	async function loadDocument() {
		if (!loading) {
			loading = true;
			let response: any = await client.v0betaLoadDocument(shadow_document_state.document_id);
			if (response.isSuccess()) {
				shadow_document_state.raw = response.content;
				lastLoadFailed = false;
			} else {
				lastLoadFailed = true;
			}
			loading = false;
		}
	}

	export async function createDocument(id: string) {
		let response: any = await client.v0betaCreateDocument(id);
		if (response.isSuccess()) {
			shadow_document_state.document_id = id;
			shadow_document_state.raw = {};
			return true;
		} else {
			return false;
		}
	}
</script>

<Alert bind:showAlert={lastLoadFailed}>Failed to load document</Alert>

{#if shadow_document_state.raw === undefined}
	<button class="btn btn-primary" on:click={loadDocument}>
		{#if loading}
			<span class="loading loading-spinner"></span>
		{/if}
		Load Document
	</button>
{:else}
	{shadow_document_state.raw}
{/if}
