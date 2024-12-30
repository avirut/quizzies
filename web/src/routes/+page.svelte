<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import TossupPlayer from '$lib/components/TossupPlayerNew.svelte';
	import type { Tossup } from '$lib/types';
	import { filters } from '$lib/stores/filters';
	import { enhance } from '$app/forms';

	let { form } = $props<{ form: ActionData }>();

	let formEl = $state<HTMLFormElement | null>(null);

	// Reactive form data using derived state
	let formData = $derived({
		difficulties: $filters.difficulties,
		categories: $filters.categories
	});

	// Submit form on mount
	$effect(() => {
		formEl?.requestSubmit();
	});

	function onNext() {
		formEl?.requestSubmit();
	}
</script>

<div class="container">
	<form 
		bind:this={formEl}
		id="tossupForm" 
		method="POST" 
		action="?/getTossup" 
		use:enhance={({ formData: fd }) => {
			// Add filter values to form submission
			fd.append('difficulties', JSON.stringify(formData.difficulties));
			fd.append('categories', JSON.stringify(formData.categories));
		}}
	>
	</form>
	{#if form}
		<TossupPlayer tossup={form as Tossup} {onNext} />
	{:else}
		<p>No tossups found.</p>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem;
	}
</style>