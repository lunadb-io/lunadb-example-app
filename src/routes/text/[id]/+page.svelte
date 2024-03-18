<script lang="ts">
	import '../../../prosemirror.css';

	// @ts-ignore
	import { PUBLIC_DB_HOST } from '$env/static/public';
	import LunaDBAPIClientBridge from '@lunadb-io/lunadb-client-js';
	import TextEditor from '$lib/text/text_editor.svelte';

	export let data;

	let client = new LunaDBAPIClientBridge(PUBLIC_DB_HOST);
</script>

<TextEditor document_id={data.document_id} {client}></TextEditor>
