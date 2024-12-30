<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import TossupPlayer from '$lib/components/TossupPlayerNew.svelte';
	import type { Tossup } from '$lib/types';
	import { filters } from '$lib/stores/filters';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let { form } = $props<{ form: ActionData }>();
	let getTossupForm = $state<HTMLFormElement | null>(null);
	let getTossupCountForm = $state<HTMLFormElement | null>(null);

	let formData = $derived({
		difficulties: $filters.difficulties,
		categories: $filters.categories
	});

	$effect(() => {
		getTossupCountForm?.requestSubmit();
	});

	onMount(() => {
		getTossupForm?.requestSubmit();
	});

	function onNext() {
		getTossupForm?.requestSubmit();
	}
</script>

<div class="mx-auto w-full max-w-4xl p-4">
	<form 
		bind:this={getTossupForm}
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

	<form 
		bind:this={getTossupCountForm}
		method="POST" 
		action="?/getTossupCount"
		use:enhance={({ formData: fd }) => {
			fd.append('difficulties', JSON.stringify(formData.difficulties));
			fd.append('categories', JSON.stringify(formData.categories));
			return async ({ result }) => {
				if (result.type === 'success') {
					filters.update(f => ({ ...f, availableTossups: (result.data?.count as number || null)}));
				}
			};
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