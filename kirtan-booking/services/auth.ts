// Auth Service — SSBBN Kirtan Panel
// Uses the backend JWT API instead of Firebase.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiLogin, apiLogout, getStoredToken, isBackendConfigured } from './api';

export type { AdminUser as User } from './api';

const STORED_EMAIL_KEY = 'kirtan_admin_email';

export async function signIn(email: string, password: string) {
  const user = await apiLogin(email, password);
  await AsyncStorage.setItem(STORED_EMAIL_KEY, user.email);
  return user;
}

export async function signOut(): Promise<void> {
  await apiLogout();
  await AsyncStorage.removeItem(STORED_EMAIL_KEY);
}

export function onAuthStateChanged(callback: (user: { email: string } | null) => void): () => void {
  let cancelled = false;
  (async () => {
    const token = await getStoredToken();
    const email = await AsyncStorage.getItem(STORED_EMAIL_KEY);
    if (!cancelled) {
      callback(token && email ? { email } : null);
    }
  })();
  return () => { cancelled = true; };
}

export async function getCurrentUser(): Promise<{ email: string } | null> {
  const token = await getStoredToken();
  const email = await AsyncStorage.getItem(STORED_EMAIL_KEY);
  return token && email ? { email } : null;
}

export function isFirebaseConfigured(): boolean {
  return isBackendConfigured();
}

export async function sendPasswordReset(_email: string): Promise<void> {
  throw new Error('Password reset is managed by the server admin. Contact your administrator.');
}
