import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const token = url.searchParams.get('token');
	const errorParam = url.searchParams.get('error');

	if (errorParam) {
		throw redirect(303, `/login?error=${encodeURIComponent(errorParam)}`);
	}

	if (token) {
		cookies.set('jwt_token', token, {
			path: '/',
			httpOnly: false, 
			secure: false, 
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 
		});

		return { token };
	} else {
		throw redirect(303, '/login?error=no_token');
	}
};

