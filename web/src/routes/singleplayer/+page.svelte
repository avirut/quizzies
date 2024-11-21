<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import TossupPlayer from '$lib/components/TossupPlayer.svelte';
	import type { Tossup } from '$lib/types';
    import { difficultyMap } from '$lib/types';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	let { form }: { form: ActionData } = $props();

	onMount(() => {
		(document.getElementById('tossupForm') as HTMLFormElement)?.requestSubmit();
	});

	function onNext() {
		(document.getElementById('tossupForm') as HTMLFormElement)?.requestSubmit();
	}
</script>

<div class="container">
	<form id="tossupForm" method="POST" action="?/getTossup" use:enhance>
        <!-- <select name="difficulties" multiple>
            {#each Object.entries(difficultyMap).sort(([a], [b]) => Number(a) - Number(b)) as [key, value]}
                <option value={key}>{value}</option>
            {/each}
        </select> -->
    </form>
	{#if form}
		<TossupPlayer tossup={(form as Tossup)} {onNext} />
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
