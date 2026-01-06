<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { setToken } from '$lib/api';
	import { authStore } from '$lib/stores/auth';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let error = $state('');
	let loading = $state(true);

	onMount(() => {
		if (data.token) {
			try {
				// Store token in localStorage (for Client-Side UX)
				setToken(data.token);

				// Update auth store
				const payload = JSON.parse(atob(data.token.split('.')[1]));
				authStore.login(payload.isAdmin === true);

				// Redirect to dashboard
				goto('/dashboard');
			} catch (err) {
				console.error('Token processing error:', err);
				error = 'Invalid token';
				loading = false;
				setTimeout(() => {
					goto('/login?error=invalid_token');
				}, 2000);
			}
		} else {
			error = 'No token provided';
			loading = false;
			setTimeout(() => {
				goto('/login?error=no_token');
			}, 2000);
		}
	});
</script>

<div class="auth-container">
	<div class="auth-card">
		<div class="auth-header">
			<img src="/favicon.png" alt="Logo" class="auth-logo" />
			<h1 class="auth-title">Authenticating...</h1>
		</div>

		{#if loading}
			<div class="loading-spinner">
				<div class="spinner"></div>
				<p>Please wait while we sign you in...</p>
			</div>
		{:else if error}
			<div class="error-message">
				<p>Authentication failed: {error}</p>
				<p>Redirecting to login...</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 2rem;
		background: linear-gradient(to bottom, #fafafa 0%, #ffffff 100%);
	}

	.auth-card {
		background: #ffffff;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		padding: 3rem;
		width: 100%;
		max-width: 400px;
		text-align: center;
	}

	.auth-header {
		margin-bottom: 2rem;
	}

	.auth-logo {
		width: 64px;
		height: 64px;
		margin-bottom: 1rem;
	}

	.auth-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1d1d1f;
		margin: 0;
	}

	.loading-spinner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f5f5f7;
		border-top-color: #ff6b35;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-spinner p {
		color: #86868b;
		font-size: 0.875rem;
		margin: 0;
	}

	.error-message {
		color: #c53030;
		font-size: 0.875rem;
	}

	.error-message p {
		margin: 0.5rem 0;
	}
</style>

