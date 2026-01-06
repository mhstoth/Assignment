import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	// Delete cookie (Server-Side)
	cookies.delete('jwt_token', { path: '/' });

	// Return empty object - don't redirect here
	// The client-side onMount will clear localStorage and then redirect
	return {};
};

