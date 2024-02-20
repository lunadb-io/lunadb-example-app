<script lang="ts">
	export let title: string;
	export let description: string;
	export let completed: boolean;
</script>

<div class="border rounded-md p-4 flex flex-row space-x-4">
	<input type="checkbox" bind:checked={completed} class="checkbox flex-none self-center" />
	<div class="flex-initial">
		<p>{title}</p>
		<p class="text-sm text-gray-500">{description}</p>
	</div>
</div>
