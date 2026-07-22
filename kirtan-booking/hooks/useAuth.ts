// useAuth hook — SSBBN Kirtan Panel
// Firebase Authentication (email/password) for the admin panel.
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signIn, signOut, sendPasswordReset, isFirebaseConfigured } from '../services/auth';

export function useAuth() {
  const [backendUser, setBackendUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firebaseReady = isFirebaseConfigured();

  const isAdmin = !!backendUser;
  const userEmail = backendUser?.email ?? null;
  const displayName = (backendUser as any)?.displayName ?? null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((u) => {
      setBackendUser(u as User | null);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    if (!firebaseReady) {
      const msg = 'Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_* values in .env';
      setError(msg);
      throw new Error(msg);
    }
    setError(null);
    setIsLoading(true);
    try {
      const user = await signIn(email, password);
      setBackendUser(user as User);
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut();
    setBackendUser(null);
  };

  const resetPassword = async (email: string) => {
    if (!firebaseReady) throw new Error('Firebase is not configured.');
    setError(null);
    try {
      await sendPasswordReset(email);
    } catch (err: any) {
      const msg = err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    user: backendUser,
    userEmail,
    displayName,
    isLoading,
    error,
    login,
    logout,
    resetPassword,
    isAdmin,
    firebaseReady,
  };
}
