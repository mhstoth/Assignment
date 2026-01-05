<script lang="ts">
	import { userApi, setToken } from '$lib/api';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	function formatErrorMessage(err: unknown): string {
		if (err instanceof Error) {
			const message = err.message.toLowerCase();
			if (message.includes('failed to fetch') || message.includes('network')) {
				return 'Unable to connect. Please check your connection.';
			}
			if (message.includes('unauthorized') || message.includes('401')) {
				return 'Invalid email or password.';
			}
			if (message.includes('not found') || message.includes('404')) {
				return 'Service unavailable. Please try again later.';
			}
			return 'Unable to sign in. Please try again.';
		}
		return 'Unable to sign in. Please try again.';
	}

	async function handleLogin() {
		error = '';
		loading = true;
		try {
			const response = await userApi.authenticate({ email, password });
			if (response && response.success && response.token) {
				setToken(response.token);
				goto('/dashboard');
			} else {
				error = 'Invalid response from server.';
			}
		} catch (err) {
			console.error('Login error:', err);
			error = formatErrorMessage(err);
		} finally {
			loading = false;
		}
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

		<form onsubmit={(e) => { e.preventDefault(); handleLogin(); }} class="auth-form">
			<div class="form-group">
				<label for="email" class="form-label">Email</label>
				<input
					id="email"
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
