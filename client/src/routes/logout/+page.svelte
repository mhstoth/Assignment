<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { removeToken, clearCachedUser, clearAllAuthData } from '$lib/api';
	import { clearUser } from '$lib/auth';
	import { authStore } from '$lib/stores/auth';

	onMount(() => {
		clearAllAuthData();
		clearCachedUser(); 
		clearUser();
		
		authStore.logout(); 
		removeToken();
		
		authStore.init();
		
		setTimeout(() => {
			authStore.init();
			goto('/');
		}, 150);
	});
</script>

<p>Logging out...</p>

