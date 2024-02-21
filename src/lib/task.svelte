<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import TaskEditor from './task_editor.svelte';

	const dispatch = createEventDispatcher();

	export let title: string;
	export let description: string;
	export let completed: boolean;

	let activeEditor: boolean = false;

	function onCompletedToggle() {
		dispatch('update', {
			key: 'completed',
			value: completed
		});
	}

	function onTaskTextUpdate(e: CustomEvent) {
		if (e.detail.title !== undefined) {
			title = e.detail.title;
			dispatch('update', { key: 'title', value: e.detail.title });
		}
		if (e.detail.description !== undefined) {
			description = e.detail.description;
			dispatch('update', { key: 'description', value: e.detail.description });
		}
		activeEditor = false;
	}
</script>

{#if activeEditor}
	<TaskEditor
		{title}
		{description}
		canDelete={true}
		on:create={(e) => onTaskTextUpdate(e)}
		on:cancel={() => (activeEditor = false)}
		on:delete
	></TaskEditor>
{:else}
	<div>
		<div class="p-4 flex flex-row space-x-4">
			<input
				type="checkbox"
				bind:checked={completed}
				on:change={onCompletedToggle}
				class="checkbox flex-none self-center"
			/>
			<div class="flex-initial" on:click={() => (activeEditor = true)}>
				<p>{title}</p>
				<p class="text-sm text-gray-500">{description}</p>
			</div>
		</div>
	</div>
{/if}
<hr class="border-gray-500" />
