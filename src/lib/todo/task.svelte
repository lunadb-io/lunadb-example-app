<script lang="ts">
	export let title: string;
	export let completed: boolean = false;
</script>

<div class="py-4 px-6 rounded-md border flex {completed ? 'opacity-50' : ''}">
	<p class="flex-auto label-text">{title}</p>
	<div class="form-control">
		<input type="checkbox" class="checkbox" bind:checked={completed} />
	</div>
</div>
