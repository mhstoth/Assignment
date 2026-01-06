<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { removeToken, clearCachedUser, clearAllAuthData } from '$lib/api';
	import { clearUser } from '$lib/auth';
	import { authStore } from '$lib/stores/auth';

	onMount(() => {
		// 1. Bereinige ALLE Auth-Daten (Local Storage + Session Storage)
		clearAllAuthData(); // Entfernt alles aus Local Storage und Session Storage
		clearCachedUser(); // Zusätzliche Bereinigung
		clearUser(); // Bereinige in-memory User
		
		// 2. Aktualisiere authStore
		authStore.logout(); // Setzt Store auf logged-out
		removeToken(); // Ruft auch authStore.logout() auf (doppelte Sicherheit)
		
		// 3. Stelle sicher, dass der Store neu initialisiert wird
		authStore.init();
		
		// 4. Navigiere zur Startseite nach kurzer Verzögerung
		// (gibt dem Browser Zeit, Local Storage zu aktualisieren)
		setTimeout(() => {
			// Nochmal prüfen und sicherstellen, dass alles geleert ist
			authStore.init();
			goto('/');
		}, 150);
	});
</script>

<p>Logging out...</p>

