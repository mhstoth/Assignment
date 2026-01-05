import { isAuthenticated } from '$lib/auth';
import { getToken, userApi } from '$lib/api';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

export async function load() {
	if (!isAuthenticated()) {
		throw redirect(302, '/login');
	}

	try {
		const token = getToken();
		if (!token) {
			throw redirect(302, '/login');
		}

		const payload = JSON.parse(atob(token.split('.')[1]));
		if (payload.id) {
			const user = await userApi.findOne(payload.id);
			if (!user.isAdmin) {
				throw redirect(302, '/dashboard');
			}
		}
	} catch (err) {
		throw redirect(302, '/dashboard');
	}
}

