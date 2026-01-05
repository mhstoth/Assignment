<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();

	const hideNavRoutes = ['/dashboard', '/admin'];
	const shouldShowNav = $derived(!hideNavRoutes.includes($page.url.pathname));
</script>

<svelte:head>
	<title>discoverRegensburg</title>
</svelte:head>

<div class="app-container">
	{#if shouldShowNav}
		<Navigation />
	{/if}
	<main class="main-content">
		{@render children()}
	</main>
	{#if shouldShowNav}
		<footer class="footer">
			<div class="content has-text-centered">
				<p>
					<strong>discoverRegensburg</strong> - Discover the most beautiful places in Regensburg
				</p>
			</div>
		</footer>
	{/if}
</div>

<style>
	.app-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.footer {
		margin-top: auto;
	}
</style>
