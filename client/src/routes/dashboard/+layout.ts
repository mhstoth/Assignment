import { isAuthenticated } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

export function load() {
	if (!isAuthenticated()) {
		throw redirect(302, '/login');
	}
}

