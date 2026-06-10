// useAuth hook — SSBBN Kirtan Panel
// Supports both real backend JWT auth and demo mode preview
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signIn, signOut, sendPasswordReset, isFirebaseConfigured } from '../services/auth';
import { useAdminAuthStore } from '../store/adminStore';

export function useAuth() {
  const [backendUser, setBackendUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isDemoMode, demoUser, enterDemoMode, exitDemoMode } = useAdminAuthStore();
  const firebaseReady = isFirebaseConfigured();

  // Combined "is logged in" — either real backend user or demo mode
  const isAdmin = !!backendUser || isDemoMode;
  const userEmail = backendUser?.email ?? demoUser?.email ?? null;
  const displayName = (backendUser as any)?.displayName ?? demoUser?.displayName ?? null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((u) => {
      setBackendUser(u as User | null);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  // If demo mode is active, mark loading as done immediately
  useEffect(() => {
    if (isDemoMode) setIsLoading(false);
  }, [isDemoMode]);

  const login = async (email: string, password: string) => {
    if (!firebaseReady) {
      const msg = 'Backend is not configured. Set EXPO_PUBLIC_BACKEND_URL in .env';
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

  const loginDemo = () => {
    enterDemoMode();
  };

  const logout = async () => {
    if (isDemoMode) {
      exitDemoMode();
      return;
    }
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
    loginDemo,
    logout,
    resetPassword,
    isAdmin,
    isDemoMode,
    firebaseReady,
  };
}

