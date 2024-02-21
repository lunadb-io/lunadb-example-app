<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import TaskEditor from './task_editor.svelte';

	const dispatch = createEventDispatcher();

	let active: boolean = false;

	function onAddTask(detail: any) {
		dispatch('addTask', detail);
		clearActive();
	}

	function clearActive() {
		active = false;
	}
</script>

{#if active}
	<TaskEditor on:create={(e) => onAddTask(e.detail)} on:cancel={clearActive}></TaskEditor>
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
