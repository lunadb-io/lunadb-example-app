<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let title: string;
	export let description: string;
	export let completed: boolean;

	function onCompletedToggle() {
		dispatch('update', {
			key: 'completed',
			value: completed
		});
	}
</script>

<div>
	<div class="p-4 flex flex-row space-x-4">
		<input
			type="checkbox"
			bind:checked={completed}
			on:change={onCompletedToggle}
			class="checkbox flex-none self-center"
		/>
		<div class="flex-initial">
			<p>{title}</p>
			<p class="text-sm text-gray-500">{description}</p>
		</div>
	</div>
</div>
<hr class="border-gray-500" />
