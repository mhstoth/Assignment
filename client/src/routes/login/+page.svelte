<script lang="ts">
	import { enhance } from '$app/forms';
	import { setToken } from '$lib/api';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';
	import { onMount } from 'svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	// React to form changes from server action
	$effect(() => {
		const form = $page.form;
		if (form?.success && form?.token) {
			setToken(form.token); // Sync to localStorage for Client-Side UX
			goto('/dashboard');
		}
		if (form?.error) {
			error = form.error;
			loading = false;
		}
		if (form?.email) {
			email = form.email;
		}
	});

	onMount(() => {
		// Check for OAuth error in URL
		const errorParam = $page.url.searchParams.get('error');
		if (errorParam) {
			const errorMessages: Record<string, string> = {
				oauth_failed: 'OAuth authentication failed. Please try again.',
				email_required: 'Email is required for authentication. Please ensure your OAuth account has an email address.',
				user_creation_failed: 'Failed to create user account. Please try again.',
				invalid_token: 'Invalid authentication token. Please try again.',
				no_token: 'No authentication token received. Please try again.',
			};
			error = errorMessages[errorParam] || 'Authentication failed. Please try again.';
		}
	});

	function handleOAuthLogin(provider: 'github' | 'google') {
		window.location.href = `${PUBLIC_API_BASE_URL}/api/auth/${provider}`;
	}
</script>

<div class="auth-container">
	<div class="auth-card">
		<div class="auth-header">
			<img src="/favicon.png" alt="Logo" class="auth-logo" />
			<h1 class="auth-title">Welcome back</h1>
			<p class="auth-subtitle">Sign in to manage your placemarks</p>
		</div>

		{#if error}
			<div class="error-message">{error}</div>
		{/if}

		<!-- OAuth Buttons -->
		<div class="oauth-section">
			<button
				type="button"
				class="oauth-button oauth-button-github"
				onclick={() => handleOAuthLogin('github')}
				disabled={loading}
			>
				<i class="fab fa-github"></i>
				Login with GitHub
			</button>
			<button
				type="button"
				class="oauth-button oauth-button-google"
				onclick={() => handleOAuthLogin('google')}
				disabled={loading}
			>
				<i class="fab fa-google"></i>
				Login with Google
			</button>
		</div>

		<div class="oauth-divider">
			<span>or</span>
		</div>

		<form
			method="POST"
			use:enhance={() => {
			loading = true;
			error = '';
			return async ({ result, update }) => {
				loading = false;
				
				if (result.type === 'success' && result.data) {
					const data = result.data as { success?: boolean; token?: string; error?: string; email?: string };
					if (data.success && data.token) {
						setToken(data.token);
						goto('/dashboard');
						return; // Don't call update() when redirecting
					} else if (data.error) {
						error = data.error;
						if (data.email) {
							email = data.email;
						}
					}
				} else if (result.type === 'failure') {
					const data = result.data as { error?: string; email?: string };
					if (data?.error) {
						error = data.error;
					}
					if (data?.email) {
						email = data.email;
					}
				}
				
				// Update form for non-redirect cases
				await update();
			};
		}}
			class="auth-form"
		>
			<div class="form-group">
				<label for="email" class="form-label">Email</label>
				<input
					id="email"
					name="email"
					class="form-input"
					type="email"
					bind:value={email}
					required
					placeholder="name@example.com"
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="password" class="form-label">Password</label>
				<input
					id="password"
					name="password"
					class="form-input"
					type="password"
					bind:value={password}
					required
					placeholder="Enter your password"
					disabled={loading}
				/>
			</div>

			<button class="button" type="submit" disabled={loading} style="width: 100%; margin-top: 0.5rem;">
				{loading ? 'Signing in...' : 'Sign in'}
			</button>
		</form>

		<div class="auth-footer">
			<p class="auth-link">
				Don't have an account? <a href="/signup">Sign up</a>
			</p>
		</div>
	</div>
</div>

<style>
	.oauth-section {
		display: flex;
		flex-direction: row;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.oauth-button {
		flex: 1;
		padding: 0.875rem 1rem;
		font-size: 0.76rem;
		font-weight: 500;
		border: 1px solid #d2d2d7;
		border-radius: 5px;
		background-color: #ffffff;
		color: #1d1d1f;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		box-sizing: border-box;
	}

	.oauth-button:hover:not(:disabled) {
		background-color: #f5f5f7;
		border-color: #ff6b35;
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.oauth-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.oauth-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.oauth-button i {
		font-size: 1.25rem;
	}

	.oauth-button-github:hover:not(:disabled) {
		border-color: #24292e;
		color: #24292e;
	}

	.oauth-button-google:hover:not(:disabled) {
		border-color: #4285f4;
		color: #4285f4;
	}

	.oauth-divider {
		display: flex;
		align-items: center;
		text-align: center;
		margin: 1.5rem 0;
	}

	.oauth-divider::before,
	.oauth-divider::after {
		content: '';
		flex: 1;
		border-bottom: 1px solid #e5e5e7;
	}

	.oauth-divider span {
		padding: 0 1rem;
		color: #86868b;
		font-size: 0.875rem;
	}

	@media (max-width: 480px) {
		.oauth-section {
			flex-direction: column;
		}
	}
</style>
