import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { authStore } from './stores/auth';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'current_user';
const LAST_CATEGORY_KEY = 'last_category';
const ADMIN_TAB_KEY = 'admin_tab';

export interface User {
	_id?: string;
	firstName: string;
	lastName: string;
	email: string;
	password?: string;
	isAdmin?: boolean;
	__v?: number;
}

export interface UserCredentials {
	email: string;
	password: string;
}

export interface AuthResponse {
	success: boolean;
	token: string;
}

export interface Placemark {
	_id?: string;
	title: string;
	latitude: number;
	longitude: number;
	category: string;
	description: string;
	images?: string[];
	userid?: string;
	createdAt?: string;
	__v?: number;
}

/**
 * Validiert einen JWT Token
 * @param token - Der JWT Token String
 * @returns true wenn Token gültig ist, false sonst
 */
function isValidToken(token: string): boolean {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) {
			return false;
		}

		const payload = JSON.parse(atob(parts[1]));
		
		// Prüfe Ablaufzeit
		if (payload.exp && payload.exp * 1000 < Date.now()) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
}

/**
 * Gibt den aktuellen JWT Token zurück (falls vorhanden und gültig)
 * Entfernt automatisch abgelaufene oder ungültige Tokens
 * @returns Der gültige Token oder null
 */
export function getToken(): string | null {
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem(TOKEN_KEY);
		if (token) {
			if (isValidToken(token)) {
				return token;
			} else {
				// Token ist ungültig oder abgelaufen - entferne ihn
				localStorage.removeItem(TOKEN_KEY);
				localStorage.removeItem(USER_KEY);
				// Synchronisiere mit authStore
				authStore.logout();
				return null;
			}
		}
	}
	return null;
}

/**
 * Speichert einen JWT Token im Local Storage und aktualisiert den authStore
 * @param token - Der JWT Token String
 * @throws Error wenn Token ungültig ist
 */
export function setToken(token: string): void {
	if (typeof window !== 'undefined') {
		// Validiere Token bevor er gespeichert wird
		if (!isValidToken(token)) {
			throw new Error('Invalid or expired token');
		}

		localStorage.setItem(TOKEN_KEY, token);
		
		try {
			const parts = token.split('.');
			const payload = JSON.parse(atob(parts[1]));
			authStore.login(payload.isAdmin === true);
		} catch (err) {
			console.error('[API] Failed to parse token payload:', err);
			authStore.login(false);
		}
	}
}

export function getCachedUser(): User | null {
	if (typeof window !== 'undefined') {
		const userJson = localStorage.getItem(USER_KEY);
		if (userJson) {
			try {
				return JSON.parse(userJson);
			} catch {
				return null;
			}
		}
	}
	return null;
}

export function setCachedUser(user: User): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(USER_KEY, JSON.stringify(user));
	}
}

export function clearCachedUser(): void {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(USER_KEY);
	}
}

export function getLastCategory(): string {
	if (typeof window !== 'undefined') {
		return localStorage.getItem(LAST_CATEGORY_KEY) || 'Sightseeing';
	}
	return 'Sightseeing';
}

export function setLastCategory(category: string): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(LAST_CATEGORY_KEY, category);
	}
}

export function getAdminTab(): 'users' | 'analytics' {
	if (typeof window !== 'undefined') {
		const tab = localStorage.getItem(ADMIN_TAB_KEY);
		if (tab === 'analytics') return 'analytics';
	}
	return 'users';
}

export function setAdminTab(tab: 'users' | 'analytics'): void {
	if (typeof window !== 'undefined') {
		localStorage.setItem(ADMIN_TAB_KEY, tab);
	}
}

/**
 * Entfernt den Token aus Local Storage und Session Storage
 * Aktualisiert den authStore
 * Wird beim Logout verwendet
 */
/**
 * Entfernt ALLE Auth-Daten aus Local Storage und Session Storage
 * Wird beim vollständigen Logout verwendet
 */
export function clearAllAuthData(): void {
	if (typeof window !== 'undefined') {
		// Local Storage: Entferne alle Auth-relevanten Daten
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
		
		// Session Storage: Entferne alle Auth-relevanten Daten
		try {
			sessionStorage.removeItem(TOKEN_KEY);
			sessionStorage.removeItem(USER_KEY);
			// Optional: Session Storage komplett leeren
			sessionStorage.clear();
		} catch (err) {
			console.warn('[API] Could not clear sessionStorage:', err);
		}
	}
}

/**
 * Entfernt den Token aus Local Storage und Session Storage
 * Aktualisiert den authStore
 * Wird beim Logout verwendet
 */
export function removeToken(): void {
	if (typeof window !== 'undefined') {
		// Entferne alle Auth-Daten
		clearAllAuthData();
		
		// Aktualisiere authStore (dies ruft auch clearAuthData() auf)
		authStore.logout();
	}
}

async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const token = getToken();
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>),
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(`${PUBLIC_API_BASE_URL}${endpoint}`, {
		...options,
		headers,
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: response.statusText }));
		throw new Error(error.message || `HTTP error! status: ${response.status}`);
	}

	if (response.status === 204) {
		return null as T;
	}

	return response.json();
}

export const userApi = {
	async authenticate(credentials: UserCredentials): Promise<AuthResponse> {
		try {
			const response = await fetch(`${PUBLIC_API_BASE_URL}/api/users/authenticate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(credentials),
			});

			if (!response.ok) {
				let errorMessage = `HTTP error! status: ${response.status}`;
				try {
					const errorData = await response.json();
					errorMessage =
						errorData.message ||
						errorData.error ||
						(errorData.output && errorData.output.payload && errorData.output.payload.message) ||
						errorMessage;
				} catch {
					errorMessage = response.statusText || errorMessage;
				}
				throw new Error(errorMessage);
			}

			const data = await response.json();
			return data;
		} catch (err) {
			if (err instanceof TypeError && err.message.includes('fetch')) {
				throw new Error('Failed to fetch - check if the server is running');
			}
			throw err;
		}
	},

	async create(user: Omit<User, '_id' | '__v'>): Promise<User> {
		return apiRequest<User>('/api/users', {
			method: 'POST',
			body: JSON.stringify(user),
		});
	},

	async findAll(): Promise<User[]> {
		return apiRequest<User[]>('/api/users');
	},

	async findOne(id: string): Promise<User> {
		return apiRequest<User>(`/api/users/${id}`);
	},

	async update(id: string, user: Partial<User>): Promise<User> {
		return apiRequest<User>(`/api/users/${id}`, {
			method: 'PUT',
			body: JSON.stringify(user),
		});
	},

	async delete(id: string): Promise<void> {
		await apiRequest<void>(`/api/users/${id}`, {
			method: 'DELETE',
		});
	},

	async deleteAll(): Promise<void> {
		await apiRequest<void>('/api/users', {
			method: 'DELETE',
		});
	},
};

export const placemarkApi = {
	async findAll(): Promise<Placemark[]> {
		return apiRequest<Placemark[]>('/api/placemarks');
	},

	async findAllForAdmin(): Promise<Placemark[]> {
		return apiRequest<Placemark[]>('/api/placemarks/admin/all');
	},

	async findOne(id: string): Promise<Placemark> {
		return apiRequest<Placemark>(`/api/placemarks/${id}`);
	},

	async create(placemark: Omit<Placemark, '_id' | '__v' | 'userid'>): Promise<Placemark> {
		return apiRequest<Placemark>('/api/placemarks', {
			method: 'POST',
			body: JSON.stringify(placemark),
		});
	},

	async update(id: string, placemark: Partial<Placemark>): Promise<Placemark> {
		return apiRequest<Placemark>(`/api/placemarks/${id}`, {
			method: 'PUT',
			body: JSON.stringify(placemark),
		});
	},

	async delete(id: string): Promise<void> {
		await apiRequest<void>(`/api/placemarks/${id}`, {
			method: 'DELETE',
		});
	},

	async deleteAllUserPlacemarks(): Promise<void> {
		await apiRequest<void>('/api/placemarks/user', {
			method: 'DELETE',
		});
	},

	async deleteAll(): Promise<void> {
		await apiRequest<void>('/api/placemarks', {
			method: 'DELETE',
		});
	},

	async uploadImages(id: string, files: File[]): Promise<Placemark> {
		const token = getToken();
		const formData = new FormData();
		
		files.forEach((file) => {
			formData.append('imagefiles', file);
		});

		const headers: Record<string, string> = {};
		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const response = await fetch(`${PUBLIC_API_BASE_URL}/api/placemarks/${id}/uploadimages`, {
			method: 'POST',
			headers,
			body: formData,
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: response.statusText }));
			throw new Error(error.message || `HTTP error! status: ${response.status}`);
		}

		return response.json();
	},

	async deleteImage(id: string, imageUrl: string): Promise<Placemark> {
		const encodedUrl = encodeURIComponent(imageUrl);
		return apiRequest<Placemark>(`/api/placemarks/${id}/images/${encodedUrl}`, {
			method: 'DELETE',
		});
	},
};

