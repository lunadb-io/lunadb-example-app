<script lang="ts">
	import Alert from './alert.svelte';
	import LoaderButton from './loader_button.svelte';

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
		todoList: TodoList | undefined;
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

	let active_document_state = new DocumentState(document_id);
	let shadow_document_state = new DocumentState(document_id);
	let lastLoadFailed: boolean = false;

	async function loadDocument() {
		let response: any = await client.v0betaLoadDocument(shadow_document_state.document_id);
		if (response.isSuccess()) {
			shadow_document_state.todoList = response.content.contents.todoList;
			lastLoadFailed = false;
		} else {
			lastLoadFailed = true;
		}
	}
</script>

<Alert bind:showAlert={lastLoadFailed}>Failed to load document</Alert>

<LoaderButton class="btn-primary" on:load={loadDocument}>Load Document</LoaderButton>

{JSON.stringify(shadow_document_state.getRaw())}
