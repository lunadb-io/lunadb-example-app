<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let className: string;
	export { className as class };

	export let disabled: boolean = false;

	let isLoading = false;

	function requestLoad() {
		if (!isLoading) {
			dispatch('load');
		}
	}

	export function setIsLoading() {
		isLoading = true;
	}

	export function setIsLoaded() {
		isLoading = false;
	}
</script>

<button class="btn {className}" class:btn-disabled={disabled} on:click={requestLoad}>
	{#if isLoading}
		<span class="loading loading-spinner"></span>
	{:else}
		<slot />
	{/if}
</button>
