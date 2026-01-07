<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { onMount, onDestroy } from 'svelte';
	import { getToken } from '$lib/api';

	let isLoggedIn = $state(false);
	let isAdmin = $state(false);

	function initializeClientState() {
		if (typeof window === 'undefined') return;
		
		authStore.init();
		
		const initialState = authStore.getSnapshot();
		let loggedIn = initialState.isLoggedIn;
		let admin = initialState.isAdmin;
		
		const token = getToken();
		if (!token && loggedIn) {
			loggedIn = false;
			admin = false;
			authStore.logout();
		} else if (token && !loggedIn) {
			authStore.init();
			const updatedState = authStore.getSnapshot();
			loggedIn = updatedState.isLoggedIn;
			admin = updatedState.isAdmin;
		}
		
		isLoggedIn = loggedIn;
		isAdmin = admin;
	}
	
	if (typeof window !== 'undefined') {
		initializeClientState();
	}

	let unsubscribe: (() => void) | null = null;
	let checkInterval: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		authStore.init();
		
		const currentState = authStore.getSnapshot();
		isLoggedIn = currentState.isLoggedIn;
		isAdmin = currentState.isAdmin;
		
		unsubscribe = authStore.subscribe((state) => {
			isLoggedIn = state.isLoggedIn;
			isAdmin = state.isAdmin;
		});
		
		checkInterval = setInterval(() => {
			const token = getToken();
			const currentState = authStore.getSnapshot();
			
			if (!token && currentState.isLoggedIn) {
				authStore.logout();
				isLoggedIn = false;
				isAdmin = false;
			}
			else if (isLoggedIn !== currentState.isLoggedIn || isAdmin !== currentState.isAdmin) {
				isLoggedIn = currentState.isLoggedIn;
				isAdmin = currentState.isAdmin;
			}
		}, 200);
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
		if (checkInterval) {
			clearInterval(checkInterval);
		}
	});
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
				{#if isLoggedIn}
					<a class="navbar-item" href="/dashboard">Dashboard</a>
					<a class="navbar-item" href="/map">Map</a>
					{#if isAdmin}
						<a class="navbar-item admin-link" href="/admin">Admin</a>
					{/if}
				{/if}
			</div>
			<div class="navbar-end">
				<div class="navbar-item">
					<div class="buttons">
						{#if isLoggedIn}
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

	.admin-link {
		color: #ff6b35 !important;
		font-weight: 600;
	}
</style>

