import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const token = cookies.get('jwt_token');

	// Not logged in → Redirect (Server-Side!)
	if (!token) {
		throw redirect(303, '/login');
	}

	try {
		// Decode JWT payload (Node.js compatible - Buffer is available in server context)
		const base64Payload = token.split('.')[1];
		const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf-8'));
		
		if (!payload.id) {
			cookies.delete('jwt_token', { path: '/' });
			throw redirect(303, '/login');
		}

		// Verify token by fetching user data
		const userResponse = await fetch(`${PUBLIC_API_BASE_URL}/api/users/${payload.id}`, {
			headers: { Authorization: `Bearer ${token}` }
		});

		if (!userResponse.ok) {
			cookies.delete('jwt_token', { path: '/' });
			throw redirect(303, '/login');
		}

		// Load placemarks server-side (faster initial load)
		const placemarksResponse = await fetch(`${PUBLIC_API_BASE_URL}/api/placemarks`, {
			headers: { Authorization: `Bearer ${token}` }
		});

		if (!placemarksResponse.ok) {
			// Token invalid → Delete cookie & redirect
			cookies.delete('jwt_token', { path: '/' });
			throw redirect(303, '/login');
		}

		const placemarks = await placemarksResponse.json();

		return {
			placemarks,
			token // Token also to client for further requests
		};
	} catch (err) {
		// If it's a redirect, re-throw it
		if (err instanceof Response && err.status >= 300 && err.status < 400) {
			throw err;
		}
		// Otherwise, redirect to login
		cookies.delete('jwt_token', { path: '/' });
		throw redirect(303, '/login');
	}
};


