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

<div class="mx-auto w-full max-w-4xl p-4">
	<form 
		bind:this={formEl}
		id="tossupForm" 
		method="POST" 
		action="?/getTossup" 
		class="w-full"
		use:enhance={({ formData: fd }) => {
			fd.append('difficulties', JSON.stringify(formData.difficulties));
			fd.append('categories', JSON.stringify(formData.categories));
		}}
	>
	</form>
	{#if form}
		<div class="w-full">
			<TossupPlayer tossup={form as Tossup} {onNext} />
		</div>
	{:else}
		<p class="text-center text-muted-foreground">No tossups found.</p>
	{/if}
</div>