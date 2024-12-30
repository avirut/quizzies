<!-- FiltersDialog.svelte -->
<script lang="ts">
	import { Filter } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { filters, DIFFICULTIES, CATEGORIES } from '$lib/stores/filters';
	import { difficultyMap } from '$lib/types';

	function toggleDifficulty(difficulty: number) {
		filters.update(f => {
			if (f.difficulties.includes(difficulty)) {
				return {
					...f,
					difficulties: f.difficulties.filter(d => d !== difficulty)
				};
			} else {
				return {
					...f,
					difficulties: [...f.difficulties, difficulty].sort()
				};
			}
		});
	}

	function toggleCategory(category: string) {
		filters.update(f => {
			if (f.categories.includes(category)) {
				return {
					...f,
					categories: f.categories.filter(c => c !== category)
				};
			} else {
				return {
					...f,
					categories: [...f.categories, category].sort()
				};
			}
		});
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