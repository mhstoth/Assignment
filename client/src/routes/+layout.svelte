<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>discoverRegensburg</title>
</svelte:head>

<div class="app-container">
	<Navigation />
	<main class="main-content">
		{@render children()}
	</main>
	<footer class="footer">
		<div class="content has-text-centered">
			<p>
				<strong>discoverRegensburg</strong> - Discover the most beautiful places in Regensburg
			</p>
		</div>
	</footer>
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
