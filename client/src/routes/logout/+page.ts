import { removeToken } from '$lib/api';
import { clearUser } from '$lib/auth';
import { goto } from '$app/navigation';

export function load() {
	removeToken();
	clearUser();
	goto('/');
	return {};
}

