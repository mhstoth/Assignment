import { getToken, getCachedUser, setCachedUser, clearCachedUser, removeToken } from './api';
import { goto } from '$app/navigation';
import { userApi, type User } from './api';

let currentUser: User | null = null;

export function isAuthenticated(): boolean {
	return getToken() !== null;
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

export function isAdmin(): boolean {
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

export function logout(): void {
	clearUser();
	removeToken();
	goto('/');
}

