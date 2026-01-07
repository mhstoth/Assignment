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
function validateToken(token: string): JWTPayload | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) {
			console.warn('[AuthStore] Invalid JWT format: token does not have 3 parts');
			return null;
		}

		const payload = JSON.parse(atob(parts[1])) as JWTPayload;

		if (payload.exp) {
			const expirationTime = payload.exp * 1000;
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

function clearAuthData(): void {
	if (typeof window !== 'undefined') {
		localStorage.removeItem('jwt_token');
		localStorage.removeItem('current_user');
		try {
			sessionStorage.removeItem('jwt_token');
			sessionStorage.removeItem('current_user');
		} catch (err) {
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
			clearAuthData();
			set({ isLoggedIn: false, isAdmin: false });
			return;
		}
		set({ 
			isLoggedIn: true, 
			isAdmin: payload.isAdmin === true 
		});
	};

	return {
		subscribe,

		getSnapshot: (): AuthState => {
			return get(store);
		},

		login: (isAdmin: boolean = false) => {
			set({ isLoggedIn: true, isAdmin });
		},

		logout: () => {
			clearAuthData();
			set({ isLoggedIn: false, isAdmin: false });
		},

		setAdmin: (isAdmin: boolean) => {
			update(state => ({ ...state, isAdmin }));
		},

		init,

		enableCrossTabSync: () => {
			if (typeof window === 'undefined' || storageListener) {
				return;
			}

			storageListener = (e: StorageEvent) => {
				if (e.key === 'jwt_token' || e.key === null) {
					init();
				}
			};

			window.addEventListener('storage', storageListener);
		},

		disableCrossTabSync: () => {
			if (storageListener && typeof window !== 'undefined') {
				window.removeEventListener('storage', storageListener);
				storageListener = null;
			}
		}
	};
}

export const authStore = createAuthStore();

if (typeof window !== 'undefined') {
	authStore.init();
	authStore.enableCrossTabSync();
}

