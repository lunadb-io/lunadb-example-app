<script lang="ts">
	// @ts-ignore
	import { PUBLIC_DB_HOST } from '$env/static/public';
	import LunaDBAPIClientBridge from '@lunadb-io/lunadb-client-js';
	import TodoList from '$lib/todo/todo_list.svelte';

	let client = new LunaDBAPIClientBridge(PUBLIC_DB_HOST);

	export let data;
</script>

<TodoList document_id={data.document_id} {client}></TodoList>
