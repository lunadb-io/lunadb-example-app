<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let title: string = '';
	export let description: string = '';

	function finish() {
		dispatch('create', { title: title, description: description });
	}

	function cancel() {
		dispatch('cancel');
	}
</script>

<div class="form-control border rounded-md border-gray-500">
	<input
		type="text"
		placeholder="Task name"
		class="input w-full outline-none focus:outline-none border-none focus:border-none font-semibold"
		bind:value={title}
	/>
	<textarea
		placeholder="Description"
		class="textarea py-0 w-full outline-none focus:outline-none border-none focus:border-none text-sm"
		bind:value={description}
	/>
	<div class="flex flex-row justify-end p-4 space-x-2">
		<button class="btn btn-sm" on:click={cancel}>Cancel</button>
		<button class="btn btn-sm btn-primary" on:click={finish}>Add task</button>
	</div>
</div>
