import type { PageServerLoad } from './$types';

/**
 * Server-Side Load Function für die Startseite
 * Prüft den Auth-Status über Cookies (für SSR)
 */
export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('jwt_token');
	
	// Prüfe ob Token vorhanden und gültig ist
	let isAuthenticated = false;
	let isAdmin = false;

	if (token) {
		try {
			// Validiere Token-Format (Client-Side wird vollständige Validierung gemacht)
			const parts = token.split('.');
			if (parts.length === 3) {
				const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
				
				// Prüfe Ablaufzeit
				if (payload.exp && payload.exp * 1000 > Date.now()) {
					isAuthenticated = true;
					isAdmin = payload.isAdmin === true;
				}
			}
		} catch {
			// Token ist ungültig - ignoriere Fehler, bleibt false
		}
	}

	return {
		isAuthenticated,
		isAdmin
	};
};

