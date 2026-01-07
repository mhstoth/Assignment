import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const token = cookies.get('jwt_token');

	if (!token) {
		throw redirect(303, '/login');
	}

	try {
		const base64Payload = token.split('.')[1];
		const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf-8'));
		
		if (!payload.id) {
			cookies.delete('jwt_token', { path: '/' });
			throw redirect(303, '/login');
		}

		const userResponse = await fetch(`${PUBLIC_API_BASE_URL}/api/users/${payload.id}`, {
			headers: { Authorization: `Bearer ${token}` }
		});

		if (!userResponse.ok) {
			cookies.delete('jwt_token', { path: '/' });
			throw redirect(303, '/login');
		}

		const placemarksResponse = await fetch(`${PUBLIC_API_BASE_URL}/api/placemarks`, {
			headers: { Authorization: `Bearer ${token}` }
		});

		if (!placemarksResponse.ok) {
			cookies.delete('jwt_token', { path: '/' });
			throw redirect(303, '/login');
		}

		const placemarks = await placemarksResponse.json();

		return {
			placemarks,
			token 
		};
	} catch (err) {
		if (err instanceof Response && err.status >= 300 && err.status < 400) {
			throw err;
		}
		cookies.delete('jwt_token', { path: '/' });
		throw redirect(303, '/login');
	}
};


