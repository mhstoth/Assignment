import { writable, get } from 'svelte/store';

export interface AuthState {
	isLoggedIn: boolean;
	isAdmin: boolean;
}

interface JWTPayload {
	id?: string;
	email?: string;
	isAdmin?: boolean;
	exp?: number;
	iat?: number;
}

/**
 * Validiert einen JWT Token und gibt das Payload zurück
 * @param token - Der JWT Token String
 * @returns Das dekodierte Payload oder null bei Fehler
 */
function validateToken(token: string): JWTPayload | null {
	try {
		// Prüfe JWT Format (muss 3 Teile haben: header.payload.signature)
		const parts = token.split('.');
		if (parts.length !== 3) {
			console.warn('[AuthStore] Invalid JWT format: token does not have 3 parts');
			return null;
		}

		// Dekodiere das Payload (Base64)
		const payload = JSON.parse(atob(parts[1])) as JWTPayload;

		// Prüfe Ablaufzeit
		if (payload.exp) {
			const expirationTime = payload.exp * 1000; // exp ist in Sekunden, Date.now() in Millisekunden
			if (expirationTime < Date.now()) {
				console.warn('[AuthStore] Token expired:', new Date(expirationTime).toISOString());
				return null;
			}
		}

		return payload;
	} catch (err) {
		console.warn('[AuthStore] Token validation failed:', err instanceof Error ? err.message : 'Unknown error');
		return null;
	}
}

/**
 * Entfernt alle Auth-relevanten Daten aus Local Storage und Session Storage
 * Wird beim Logout aufgerufen, um alle Auth-Daten vollständig zu bereinigen
 */
function clearAuthData(): void {
	if (typeof window !== 'undefined') {
		// Local Storage: Entferne alle Auth-relevanten Daten
		localStorage.removeItem('jwt_token');
		localStorage.removeItem('current_user');
		// Optional: Auch andere Auth-relevante Daten entfernen
		// localStorage.removeItem('admin_tab'); // Behalten für UX
		// localStorage.removeItem('last_category'); // Behalten für UX
		
		// Session Storage: Entferne alle Auth-relevanten Daten
		// (falls Session Storage verwendet wird)
		try {
			sessionStorage.removeItem('jwt_token');
			sessionStorage.removeItem('current_user');
			// Optional: Session Storage komplett leeren, falls gewünscht
			// sessionStorage.clear();
		} catch (err) {
			// Session Storage könnte in manchen Browsern/Kontexten nicht verfügbar sein
			console.warn('[AuthStore] Could not clear sessionStorage:', err);
		}
	}
}

function createAuthStore() {
	const store = writable<AuthState>({
		isLoggedIn: false,
		isAdmin: false
	});

	const { subscribe, set, update } = store;

	let storageListener: ((e: StorageEvent) => void) | null = null;

	/**
	 * Initialisiert den Store basierend auf Local Storage
	 * Sollte beim App-Start aufgerufen werden
	 */
	const init = () => {
		if (typeof window === 'undefined') {
			// SSR: Setze auf nicht-eingeloggt
			set({ isLoggedIn: false, isAdmin: false });
			return;
		}

		const token = localStorage.getItem('jwt_token');
		
		if (!token) {
			set({ isLoggedIn: false, isAdmin: false });
			return;
		}

		const payload = validateToken(token);
		
		if (!payload) {
			// Token ist ungültig oder abgelaufen
			clearAuthData();
			set({ isLoggedIn: false, isAdmin: false });
			return;
		}

		// Token ist gültig
		set({ 
			isLoggedIn: true, 
			isAdmin: payload.isAdmin === true 
		});
	};

	return {
		subscribe,
		
		/**
		 * Gibt den aktuellen State zurück (ohne Subscription)
		 */
		getSnapshot: (): AuthState => {
			return get(store);
		},

		/**
		 * Setzt den Login-Status
		 */
		login: (isAdmin: boolean = false) => {
			set({ isLoggedIn: true, isAdmin });
		},

		/**
		 * Setzt den Logout-Status und bereinigt Daten
		 */
		logout: () => {
			clearAuthData();
			set({ isLoggedIn: false, isAdmin: false });
		},

		/**
		 * Aktualisiert nur den Admin-Status
		 */
		setAdmin: (isAdmin: boolean) => {
			update(state => ({ ...state, isAdmin }));
		},

		/**
		 * Initialisiert den Store basierend auf Local Storage
		 */
		init,

		/**
		 * Aktiviert Cross-Tab Synchronisation
		 * Listener für Storage-Events (wenn Local Storage in anderem Tab geändert wird)
		 */
		enableCrossTabSync: () => {
			if (typeof window === 'undefined' || storageListener) {
				return;
			}

			storageListener = (e: StorageEvent) => {
				// Nur auf jwt_token Änderungen reagieren
				if (e.key === 'jwt_token' || e.key === null) {
					// null bedeutet, dass localStorage.clear() aufgerufen wurde
					// Re-initialisiere den Store
					init();
				}
			};

			window.addEventListener('storage', storageListener);
		},

		/**
		 * Deaktiviert Cross-Tab Synchronisation
		 */
		disableCrossTabSync: () => {
			if (storageListener && typeof window !== 'undefined') {
				window.removeEventListener('storage', storageListener);
				storageListener = null;
			}
		}
	};
}

export const authStore = createAuthStore();

// Automatische Initialisierung beim Import (nur im Browser)
if (typeof window !== 'undefined') {
	authStore.init();
	authStore.enableCrossTabSync();
}

