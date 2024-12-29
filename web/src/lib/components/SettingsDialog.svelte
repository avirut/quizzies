<script lang="ts">
	import { Settings } from 'lucide-svelte';
	import { setMode } from 'mode-watcher';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';

	import { settings } from '$lib/stores/settings';

	const themes = [
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' },
		{ value: 'system', label: 'System' }
	];

	const triggerContent = $derived(
		themes.find((t) => t.value === $settings.theme)?.label ?? 'Select theme'
	);
</script>

<Dialog.Root>
	<Dialog.Trigger class="hover:bg-accent flex h-10 w-10 items-center justify-center rounded-md">
		<Settings class="h-[1.2rem] w-[1.2rem]" />
		<span class="sr-only">Settings</span>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Settings</Dialog.Title>
		</Dialog.Header>
		<div class="space-y-6 py-6">
			<div class="flex items-center justify-between">
				<Label for="show-text" class="text-right">Show question text</Label>
				<Switch
					id="show-text"
					checked={$settings.showText}
					onCheckedChange={(checked) => settings.update((s) => ({ ...s, showText: checked }))}
				/>
			</div>

			<div class="flex items-center justify-between">
				<Label for="sound-enabled" class="text-right">Play question audio</Label>
				<Switch
					id="sound-enabled"
					checked={$settings.soundEnabled}
					onCheckedChange={(checked) => settings.update((s) => ({ ...s, soundEnabled: checked }))}
				/>
			</div>

			<div class="flex items-center justify-between">
				<Label for="theme-select" class="text-right">Theme</Label>
				<Select.Root
					type="single"
					value={$settings.theme}
					onValueChange={(value) => {
						setMode(value as 'dark' | 'light' | 'system');
						settings.update((s) => ({ ...s, theme: value }));
					}}
				>
					<Select.Trigger class="w-[180px]">
						{triggerContent}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each themes as theme}
								<Select.Item value={theme.value} label={theme.label}>
									{theme.label}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
