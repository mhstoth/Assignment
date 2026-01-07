import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

export const actions: Actions = {
	default: async ({ cookies, request, fetch }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';

		if (!email || !password) {
			return fail(400, { email, error: 'Email and password are required' });
		}

		try {
			const response = await fetch(`${PUBLIC_API_BASE_URL}/api/users/authenticate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				return fail(401, { 
					email, 
					error: errorData.message || 'Invalid email or password' 
				});
			}

			const data = await response.json();

			if (!data.success || !data.token) {
				return fail(401, { email, error: 'Invalid response from server' });
			}

			cookies.set('jwt_token', data.token, {
				path: '/',
				httpOnly: false, 
				secure: false, 
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 
			});

			return { success: true, token: data.token };
		} catch (err) {
			console.error('Login server action error:', err);
			return fail(500, { email, error: 'Server error. Please try again.' });
		}
	}
};

