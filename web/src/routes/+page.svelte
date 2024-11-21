<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/singleplayer');
	}) 
</script>

<svelte:head>
	<title>Quizzies</title>
	<meta name="description" content="Quizzies" />
</svelte:head>
