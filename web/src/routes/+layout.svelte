<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';

	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import FiltersDialog from '$lib/components/FiltersDialog.svelte'

	let { children } = $props();
</script>

<svelte:head>
	<title>quizzies!</title>
	<meta name="description" content="Quizzies" />
</svelte:head>

<div class="flex flex-col h-screen">
	<ModeWatcher />
	
    <header class="bg-background w-full h-12 border-b flex-none">
		<nav class="flex h-full items-center max-w-screen-xl md:w-1/2 mx-auto">
			<div class="text-primary text-xl font-bold mx-4">Quizzies</div>
			<div class="ml-auto flex gap-2 mx-4">
				<FiltersDialog />
				<SettingsDialog />
			</div>
		</nav>
	</header>

    <main class="flex-1 overflow-hidden">
		{@render children()}
    </main>

    <footer class="h-8 flex-none">
		<p class="hidden md:block text-center text-sm text-muted-foreground">
			Created by <a href="https://github.com/avirut" class="font-bold hover:underline">avirut</a>
			{' '}using{' '}
			<a href="https://www.qbreader.org/database/" class="font-bold hover:underline">QBReader</a> questions
		</p>
	</footer>
</div>