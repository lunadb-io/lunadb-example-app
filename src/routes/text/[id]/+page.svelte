<script lang="ts">
	// @ts-ignore
	import { PUBLIC_DB_HOST } from '$env/static/public';
	import LunaDBAPIClientBridge from '@lunadb-io/lunadb-client-js';

	export let data;

	let document_id = data.document_id;
	let client = new LunaDBAPIClientBridge(PUBLIC_DB_HOST);
</script>
