<script lang="ts">
	import { page } from '$app/stores';
</script>

<header>
	<nav>
		<div class="logo">Quizzies</div>
		<ul>
			<li aria-current={$page.url.pathname.startsWith('/singleplayer') ? 'page' : undefined}>
				<a href="/singleplayer">Singleplayer</a>
			</li>
			<li aria-current={$page.url.pathname.startsWith('/multiplayer') ? 'page' : undefined}>
				<a href="/multiplayer">Multiplayer</a>
			</li>
		</ul>
	</nav>
</header>

<style>
	header {
		background-color: #fff;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
		padding: 0 2rem;
	}

	nav {
		display: flex;
		align-items: center;
		height: 48px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.logo {
		font-size: 1.25rem;
		font-weight: bold;
		color: var(--color-theme-1);
		margin-right: 3rem;
	}

	ul {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		margin-right: 2rem;
	}

	nav a {
		color: #333;
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.2s ease;
	}

	a:hover {
		color: var(--color-theme-1);
	}

	[aria-current='page'] a {
		color: var(--color-theme-1);
		font-weight: 500;
	}
</style>