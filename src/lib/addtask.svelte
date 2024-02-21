<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let active: boolean = false;
	let title: string = '';
	let description: string = '';

	function onAddTask() {
		dispatch('addTask', { title: title, description: description });
		clearActive();
	}

	function clearActive() {
		active = false;
		title = '';
		description = '';
	}
</script>

{#if active}
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
			<button class="btn btn-sm" on:click={clearActive}>Cancel</button>
			<button class="btn btn-sm btn-primary" on:click={onAddTask}>Add task</button>
		</div>
	</div>
{:else}
	<div class="p-4">
		<button class="btn btn-sm" on:click={() => (active = true)}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M 12 18 L 12 6 M 6 12 L 18 12"
				/></svg
			>
			<span class="text-sm self-center">Add task</span>
		</button>
	</div>
{/if}
