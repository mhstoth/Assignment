import { getToken, getCachedUser, setCachedUser, clearCachedUser, removeToken } from './api';
import { goto } from '$app/navigation';
import { userApi, type User } from './api';
import { authStore } from './stores/auth';
import { get } from 'svelte/store';

let currentUser: User | null = null;

/**
 * Prüft ob der Benutzer authentifiziert ist
 * Synchronisiert mit authStore für Konsistenz
 * @returns true wenn authentifiziert, false sonst
 */
export function isAuthenticated(): boolean {
	// Verwende authStore als Single Source of Truth
	const state = authStore.getSnapshot();
	if (state.isLoggedIn) {
		// Doppelte Validierung: Prüfe auch Token direkt
		return getToken() !== null;
	}
	return false;
}

export function requireAuth(): void {
	if (!isAuthenticated()) {
		goto('/login');
	}
}

export async function getCurrentUser(): Promise<User | null> {
	if (!isAuthenticated()) {
		return null;
	}
	
	if (currentUser) {
		return currentUser;
	}
	
	const cachedUser = getCachedUser();
	if (cachedUser) {
		currentUser = cachedUser;
		return currentUser;
	}
	
	try {
		const token = getToken();
		if (!token) return null;
		
		const payload = JSON.parse(atob(token.split('.')[1]));
		if (payload.id) {
			currentUser = await userApi.findOne(payload.id);
			if (currentUser) {
				setCachedUser(currentUser);
			}
			return currentUser;
		}
	} catch (err) {
		console.error('Error fetching current user:', err);
	}
	return null;
}

/**
 * Prüft ob der Benutzer Admin-Rechte hat
 * Synchronisiert mit authStore für Konsistenz
 * @returns true wenn Admin, false sonst
 */
export function isAdmin(): boolean {
	// Verwende authStore als primäre Quelle
	const state = authStore.getSnapshot();
	if (state.isAdmin) {
		return true;
	}
	
	// Fallback: Prüfe auch cached User
	if (currentUser?.isAdmin === true) return true;
	const cachedUser = getCachedUser();
	return cachedUser?.isAdmin === true;
}

export async function checkAdminStatus(): Promise<boolean> {
	const user = await getCurrentUser();
	return user?.isAdmin === true;
}

export function clearUser(): void {
	currentUser = null;
	clearCachedUser();
}

/**
 * Loggt den Benutzer aus
 * Bereinigt alle Auth-Daten und navigiert zur Startseite
 */
export function logout(): void {
	clearUser();
	removeToken(); // Entfernt Token und aktualisiert authStore
	goto('/');
}

