import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('jwt_token');
	
	let isAuthenticated = false;
	let isAdmin = false;

	if (token) {
		try {
			const parts = token.split('.');
			if (parts.length === 3) {
				const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
				
				if (payload.exp && payload.exp * 1000 > Date.now()) {
					isAuthenticated = true;
					isAdmin = payload.isAdmin === true;
				}
			}
		} catch (err) {
			// ignore malformed tokens but keep user unauthenticated
			console.warn('Invalid JWT token received in cookies', err);
		}
	}

	return {
		isAuthenticated,
		isAdmin
	};
};

