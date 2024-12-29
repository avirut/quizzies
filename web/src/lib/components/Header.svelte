<script lang="ts">
	import { page } from '$app/stores';
	import { User, Settings } from 'lucide-svelte';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import SettingsDialog from './SettingsDialog.svelte';
</script>

<header class="bg-background sticky top-0 z-50 w-full border-b">
	<nav class="container flex h-12 max-w-screen-xl items-center">
		<div class="text-primary mr-12 text-xl font-bold">Quizzies</div>

		<!-- Desktop Navigation -->
		<ul class="hidden gap-8 md:flex">
			<li>
				<a
					href="/singleplayer"
					class="text-muted-foreground hover:text-primary text-sm transition-colors"
					class:active={$page.url.pathname.startsWith('/singleplayer')}
				>
					Singleplayer
				</a>
			</li>
			<li>
				<a
					href="/multiplayer"
					class="text-muted-foreground hover:text-primary text-sm transition-colors"
					class:active={$page.url.pathname.startsWith('/multiplayer')}
				>
					Multiplayer
				</a>
			</li>
		</ul>

		<div class="ml-auto flex items-center gap-2">
			<!-- Mobile Menu -->
			<div class="md:hidden">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class="hover:bg-accent flex h-10 w-10 items-center justify-center rounded-md"
					>
						<User class="h-[1.2rem] w-[1.2rem]" />
						<span class="sr-only">Navigation menu</span>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Item>
							<a
								href="/singleplayer"
								class="block w-full"
								class:active={$page.url.pathname.startsWith('/singleplayer')}
							>
								Singleplayer
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<a
								href="/multiplayer"
								class="block w-full"
								class:active={$page.url.pathname.startsWith('/multiplayer')}
							>
								Multiplayer
							</a>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<SettingsDialog />
		</div>
	</nav>
</header>

<style lang="postcss">
	.active {
		@apply text-primary font-semibold;
	}
</style>