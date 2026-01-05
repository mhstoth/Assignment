<script lang="ts">
	import { userApi } from '$lib/api';
	import { goto } from '$app/navigation';

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let success = $state(false);
	let loading = $state(false);

	function formatErrorMessage(err: unknown): string {
		if (err instanceof Error) {
			const message = err.message.toLowerCase();
			if (message.includes('failed to fetch') || message.includes('network')) {
				return 'Unable to connect. Please check your connection.';
			}
			if (message.includes('email') && message.includes('already')) {
				return 'This email is already registered.';
			}
			if (message.includes('validation') || message.includes('required')) {
				return 'Please fill in all fields correctly.';
			}
			if (message.includes('not found') || message.includes('404')) {
				return 'Service unavailable. Please try again later.';
			}
			return 'Unable to create account. Please try again.';
		}
		return 'Unable to create account. Please try again.';
	}

	async function handleSignup() {
		error = '';
		success = false;
		loading = true;
		try {
			await userApi.create({
				firstName,
				lastName,
				email,
				password,
				isAdmin: false,
			});
			success = true;
			setTimeout(() => {
				goto('/login');
			}, 2000);
		} catch (err) {
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
			<h1 class="auth-title">Create account</h1>
			<p class="auth-subtitle">Sign up to start managing your placemarks</p>
		</div>

		{#if success}
			<div class="success-message">Account created successfully. Redirecting...</div>
		{/if}

		{#if error}
			<div class="error-message">{error}</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleSignup(); }} class="auth-form">
			<div class="form-row">
				<div class="form-group form-group-half">
					<label for="firstName" class="form-label">First Name</label>
					<input
						id="firstName"
						class="form-input"
						type="text"
						bind:value={firstName}
						required
						placeholder="John"
						disabled={loading}
					/>
				</div>

				<div class="form-group form-group-half">
					<label for="lastName" class="form-label">Last Name</label>
					<input
						id="lastName"
						class="form-input"
						type="text"
						bind:value={lastName}
						required
						placeholder="Doe"
						disabled={loading}
					/>
				</div>
			</div>

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
				{loading ? 'Creating account...' : 'Sign up'}
			</button>
		</form>

		<div class="auth-footer">
			<p class="auth-link">
				Already have an account? <a href="/login">Sign in</a>
			</p>
		</div>
	</div>
</div>
