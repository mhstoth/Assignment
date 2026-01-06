import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const token = url.searchParams.get('token');
	const errorParam = url.searchParams.get('error');

	if (errorParam) {
		throw redirect(303, `/login?error=${encodeURIComponent(errorParam)}`);
	}

	if (token) {
		// Set cookie for SSR (same config as login)
		cookies.set('jwt_token', token, {
			path: '/',
			httpOnly: false, // Client can read (for localStorage sync)
			secure: false, // For localhost (in production: true)
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 // 24 hours
		});

		return { token };
	} else {
		throw redirect(303, '/login?error=no_token');
	}
};

