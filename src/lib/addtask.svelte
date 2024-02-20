<script lang="ts">
	let active: boolean = false;
</script>

{#if active}
	<div class="form-control border rounded-md border-gray-500">
		<input
			type="text"
			placeholder="Task name"
			class="input w-full outline-none focus:outline-none border-none focus:border-none font-semibold"
		/>
		<textarea
			placeholder="Description"
			class="textarea py-0 w-full outline-none focus:outline-none border-none focus:border-none text-sm"
		/>
		<div class="flex flex-row justify-end p-4 space-x-2">
			<button class="btn btn-sm" on:click={() => (active = false)}>Cancel</button>
			<button class="btn btn-sm btn-primary">Add task</button>
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
