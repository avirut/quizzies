<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import TossupPlayer from '$lib/components/TossupPlayer.svelte';
	import type { Tossup } from '$lib/types';
	import { filters } from '$lib/stores/filters';
	import { applyAction, enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let { form } = $props<{ form: ActionData }>();
	let getTossupForm = $state<HTMLFormElement | null>(null);
	let tossupQueue = $state<Tossup[]>([]);
	let currentTossup = $state<Tossup | null>(null);

	const QUEUE_SIZE = 5;

	let formData = $derived({
		difficulties: $filters.difficulties,
		categories: $filters.categories
	});

	onMount(() => {
		for (let i = 0; i < QUEUE_SIZE+1; i++) {
			getTossupForm?.requestSubmit();
		}
	});

	function onNext() {
		currentTossup = tossupQueue.shift() || null;
		getTossupForm?.requestSubmit();
	}
</script>

<div class="flex h-full items-start">
	<form
		bind:this={getTossupForm}
		id="tossupForm"
		method="POST"
		action="?/getTossup"
		class="hidden"
		use:enhance={({ formData: fd }) => {
			fd.append('difficulties', JSON.stringify(formData.difficulties));
			fd.append('categories', JSON.stringify(formData.categories));

			return async ({ result, update }) => {
				if (result.type === 'success') {
					if (!currentTossup) {
						currentTossup = result.data as any as Tossup

					} else {
						tossupQueue.push(result.data as any as Tossup);
					}
				}
				update();
			};
		}}
	></form>

	{#if currentTossup}
		<div class="mx-auto w-full max-w-4xl pt-4 md:pt-0">
			<TossupPlayer tossup={currentTossup} {onNext} />
		</div>
	{:else}
		<p class="text-muted-foreground text-center">No tossups found.</p>
	{/if}
</div>