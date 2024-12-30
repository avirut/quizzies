<script lang="ts">
	import { Filter } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { filters, DIFFICULTIES, CATEGORIES } from '$lib/stores/filters';
	import { difficultyMap } from '$lib/types';

	function toggleDifficulty(difficulty: number) {
		const newDifficulties = $filters.difficulties.includes(difficulty)
			? $filters.difficulties.filter((d) => d !== difficulty)
			: [...$filters.difficulties, difficulty].sort();

		filters.updateFilters(newDifficulties, $filters.categories);
	}

	function toggleCategory(category: string) {
		const newCategories = $filters.categories.includes(category)
			? $filters.categories.filter((c) => c !== category)
			: [...$filters.categories, category].sort();

		filters.updateFilters($filters.difficulties, newCategories);
	}
</script>

<Dialog.Root>
	<Dialog.Trigger class="hover:bg-accent flex h-10 w-10 items-center justify-center rounded-md">
		<Filter class="h-[1.2rem] w-[1.2rem]" />
		<span class="sr-only">Filters</span>
	</Dialog.Trigger>
	<Dialog.Content class="max-h-[80vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Filters</Dialog.Title>
			<p class="text-muted-foreground mt-2 text-sm">
				{#if $filters.availableTossups === null}
					Loading...
				{:else if typeof $filters.availableTossups === 'number'}
					{$filters.availableTossups.toLocaleString()} tossups available
				{:else}
					Error loading count
				{/if}
			</p>
		</Dialog.Header>
		<div class="space-y-6">
			<div class="space-y-4">
				<Label class="text-sm font-semibold">Difficulty</Label>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each DIFFICULTIES as difficulty}
						<div class="flex items-center space-x-2">
							<Checkbox
								id={`difficulty-${difficulty}`}
								checked={$filters.difficulties.includes(difficulty)}
								onCheckedChange={() => toggleDifficulty(difficulty)}
							/>
							<Label for={`difficulty-${difficulty}`} class="text-sm">
								{difficultyMap[difficulty]}
							</Label>
						</div>
					{/each}
				</div>
			</div>

			<Separator />

			<div class="space-y-4">
				<Label class="text-sm font-semibold">Categories</Label>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each CATEGORIES as category}
						<div class="flex items-center space-x-2">
							<Checkbox
								id={`category-${category}`}
								checked={$filters.categories.includes(category)}
								onCheckedChange={() => toggleCategory(category)}
							/>
							<Label for={`category-${category}`} class="text-sm">
								{category}
							</Label>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
