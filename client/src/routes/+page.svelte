<script lang="ts">
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/auth';
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Verwende SSR-Daten als initial State, dann client-seitig reaktiv
	let isLoggedIn = $state(false);

	// Initialize from SSR data
	$effect(() => {
		isLoggedIn = data.isAuthenticated ?? false;
	});

	onMount(() => {
		// Synchronisiere mit authStore nach Hydration
		const unsubscribe = authStore.subscribe((state) => {
			isLoggedIn = state.isLoggedIn;
		});

		// Initialisiere authStore (falls noch nicht geschehen)
		authStore.init();

		return unsubscribe;
	});

	function goToLogin() {
		goto('/login');
	}

	function goToSignup() {
		goto('/signup');
	}

	function goToDashboard() {
		goto('/dashboard');
	}
</script>

<div class="home-container">
	<div class="hero-section">
		<div class="hero-content">
			<div class="logo-container">
				<img src="/favicon.png" alt="discoverRegensburg logo" class="hero-logo" />
			</div>
			<h1 class="hero-title">Welcome to discoverRegensburg</h1>
			<p class="hero-subtitle">Discover the most beautiful places in Regensburg</p>
			<div class="hero-buttons">
				{#if isLoggedIn}
					<button class="button primary-button" onclick={goToDashboard}>Go to Dashboard</button>
				{:else}
					<button class="button primary-button" onclick={goToLogin}>Sign In</button>
					<button class="button secondary-button" onclick={goToSignup}>Create Account</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.home-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100%;
		padding: 0;
		background: linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f5f5f7 100%);
		position: relative;
		overflow: hidden;
	}

	.home-container::before {
		content: '';
		position: absolute;
		top: -50%;
		right: -20%;
		width: 600px;
		height: 600px;
		background: radial-gradient(circle, rgba(255, 107, 53, 0.05) 0%, transparent 70%);
		border-radius: 50%;
		pointer-events: none;
	}

	.hero-section {
		width: 100%;
		max-width: 800px;
		padding: 4rem 2rem;
		text-align: center;
		position: relative;
		z-index: 1;
	}

	.hero-content {
		animation: fadeInUp 0.6s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.logo-container {
		margin-bottom: 2rem;
		animation: scaleIn 0.8s ease-out;
	}

	@keyframes scaleIn {
		from {
			transform: scale(0.9);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.hero-logo {
		width: 80px;
		height: 80px;
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
	}

	.hero-title {
		font-size: 3.5rem;
		font-weight: 700;
		color: #1d1d1f;
		margin: 0 0 1rem 0;
		letter-spacing: -1px;
		line-height: 1.1;
	}

	.hero-subtitle {
		font-size: 1.5rem;
		font-weight: 400;
		color: #86868b;
		margin: 0 0 3rem 0;
		letter-spacing: -0.3px;
	}

	.hero-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		width: 100%;
	}

	.primary-button,
	.secondary-button {
		padding: 0.875rem 2rem;
		font-size: 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	@media (max-width: 768px) {
		.hero-section {
			padding: 3rem 1.5rem;
		}

		.hero-title {
			font-size: 2.5rem;
		}

		.hero-subtitle {
			font-size: 1.25rem;
		}

		.hero-logo {
			width: 64px;
			height: 64px;
		}

		.hero-buttons {
			flex-direction: column;
		}

		.primary-button,
		.secondary-button {
			width: 100%;
		}
	}

	@media (max-width: 480px) {
		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1.125rem;
		}
	}
</style>
