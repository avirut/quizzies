<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<svelte:head>
	<title>quizzies!</title>
	<meta name="description" content="Quizzies" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<ModeWatcher />
	<Header />

	<main class="flex flex-1 flex-col p-4 mx-auto w-full max-w-4xl box-border">
		{@render children()}
	</main>

	<footer class="flex flex-col items-center justify-center p-3">
		<p class="hidden md:block text-center text-sm text-muted-foreground">
			Created by <a href="https://github.com/avirut" class="font-bold hover:underline">avirut</a>
			{' '}using{' '}
			<a href="https://www.qbreader.org/database/" class="font-bold hover:underline">QBReader</a> questions
		</p>
	</footer>
</div>