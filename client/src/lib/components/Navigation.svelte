<script lang="ts">
	import { isAuthenticated } from '$lib/auth';
</script>

<nav class="navbar" aria-label="main navigation">
	<div class="container">
		<div class="navbar-brand">
			<a class="navbar-item" href="/">
				<img src="/favicon.png" alt="discoverRegensburg logo" style="max-height: 2.5rem; margin-right: 0.5rem;" />
				<strong>discoverRegensburg</strong>
			</a>
		</div>
		<div class="navbar-menu">
			<div class="navbar-start">
				{#if isAuthenticated()}
					<a class="navbar-item" href="/dashboard">Dashboard</a>
					<a class="navbar-item" href="/map">Map</a>
				{/if}
			</div>
			<div class="navbar-end">
				<div class="navbar-item">
					<div class="buttons">
						{#if isAuthenticated()}
							<a class="button" href="/logout">Logout</a>
						{:else}
							<a class="button" href="/login">Login</a>
							<a class="button" href="/signup">Sign Up</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</nav>

<style>
	.navbar {
		background-color: #ffffff;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
</style>

