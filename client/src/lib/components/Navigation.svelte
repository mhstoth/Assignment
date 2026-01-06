<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { onMount, onDestroy } from 'svelte';
	import { getToken } from '$lib/api';

	// Initial State für SSR (wird beim Hydration aktualisiert)
	let isLoggedIn = $state(false);
	let isAdmin = $state(false);

	// Initialisiere State sofort (auch für SSR)
	// Prüfe direkt Local Storage, um sicherzustellen, dass wir den korrekten State haben
	if (typeof window !== 'undefined') {
		// Stelle sicher, dass authStore initialisiert ist
		authStore.init();
		
		// Hole den aktuellen State vom Store
		const initialState = authStore.getSnapshot();
		isLoggedIn = initialState.isLoggedIn;
		isAdmin = initialState.isAdmin;
		
		// Zusätzliche Validierung: Prüfe direkt, ob Token vorhanden ist
		// Falls Store und Token nicht übereinstimmen, korrigiere den State
		const token = getToken();
		if (!token && isLoggedIn) {
			// Token fehlt, aber Store sagt eingeloggt -> korrigiere
			isLoggedIn = false;
			isAdmin = false;
			authStore.logout();
		} else if (token && !isLoggedIn) {
			// Token vorhanden, aber Store sagt nicht eingeloggt -> re-initialisiere
			authStore.init();
			const updatedState = authStore.getSnapshot();
			isLoggedIn = updatedState.isLoggedIn;
			isAdmin = updatedState.isAdmin;
		}
	}

	let unsubscribe: (() => void) | null = null;
	let checkInterval: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		// Stelle sicher, dass der Store beim Mount nochmal initialisiert wird
		authStore.init();
		
		// Aktualisiere State mit aktuellen Werten
		const currentState = authStore.getSnapshot();
		isLoggedIn = currentState.isLoggedIn;
		isAdmin = currentState.isAdmin;
		
		// Abonniere den Store für reaktive Updates
		unsubscribe = authStore.subscribe((state) => {
			isLoggedIn = state.isLoggedIn;
			isAdmin = state.isAdmin;
		});
		
		// Zusätzliche Sicherheit: Prüfe alle 200ms, ob sich der State geändert hat
		// Dies stellt sicher, dass die Navigation auch bei manuellen Local Storage Änderungen reagiert
		checkInterval = setInterval(() => {
			// Prüfe direkt Local Storage
			const token = getToken();
			const currentState = authStore.getSnapshot();
			
			// Synchronisiere: Wenn Token fehlt, aber Store sagt eingeloggt -> korrigiere
			if (!token && currentState.isLoggedIn) {
				authStore.logout();
				isLoggedIn = false;
				isAdmin = false;
			}
			// Synchronisiere: Wenn State sich geändert hat, aktualisiere lokale Variablen
			else if (isLoggedIn !== currentState.isLoggedIn || isAdmin !== currentState.isAdmin) {
				isLoggedIn = currentState.isLoggedIn;
				isAdmin = currentState.isAdmin;
			}
		}, 200);
	});

	onDestroy(() => {
		// Cleanup: Entferne Subscription und Interval
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

