<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import TossupPlayer from '$lib/components/TossupPlayer.svelte';
	import type { Tossup } from '$lib/types';
	import { filters } from '$lib/stores/filters';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let { form } = $props<{ form: ActionData }>();
	let getTossupForm = $state<HTMLFormElement | null>(null);

	let formData = $derived({
		difficulties: $filters.difficulties,
		categories: $filters.categories
	});

	onMount(() => {
		getTossupForm?.requestSubmit();
	});

	function onNext() {
		getTossupForm?.requestSubmit();
	}
</script>

<div class="h-full flex items-start">
    <form 
        bind:this={getTossupForm}
        id="tossupForm" 
        method="POST" 
        action="?/getTossup" 
        class="hidden"
        use:enhance={({ formData: fd }) => {
            fd.append('difficulties', JSON.stringify(formData.difficulties));
            fd.append('categories', JSON.stringify(formData.categories));
        }}
    >
    </form>

    {#if form}
        <div class="w-full max-w-4xl mx-auto pt-4 md:pt-0">
            <TossupPlayer tossup={form as Tossup} {onNext} />
        </div>
    {:else}
        <p class="text-center text-muted-foreground">No tossups found.</p>
    {/if}
</div>