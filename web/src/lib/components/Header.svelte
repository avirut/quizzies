<script lang="ts">
	import SettingsDialog from '$lib/components/SettingsDialog.svelte';
	import FiltersDialog from '$lib/components/FiltersDialog.svelte'
</script>

<header class="bg-background sticky top-0 z-50 w-full border-b">
	<nav class="container flex h-12 max-w-screen-xl items-center">
		<div class="text-primary mr-12 text-xl font-bold">Quizzies</div>
		<div class="ml-auto flex items-center gap-2">
			<FiltersDialog />
			<SettingsDialog />
		</div>
	</nav>
</header>