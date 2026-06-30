// Auth Service — SSBBN Kirtan Panel
// Firebase Authentication (email/password) for the admin panel.
// Public viewers are never signed in — they read public data anonymously.
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

function toUser(u: FirebaseUser | null): User | null {
  if (!u) return null;
  return { uid: u.uid, email: u.email, displayName: u.displayName };
}

// Map Firebase's raw error codes to friendly, sangat-appropriate messages.
function friendly(err: any): Error {
  const code: string = err?.code || '';
  const map: Record<string, string> = {
    'auth/invalid-email': 'That email address looks invalid.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/wrong-password': 'Invalid email or password.',
    'auth/user-not-found': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again in a few minutes.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
    'auth/user-disabled': 'This account has been disabled.',
  };
  return new Error(map[code] || err?.message || 'Something went wrong. Please try again.');
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    return toUser(cred.user)!;
  } catch (err) {
    throw friendly(err);
  }
}

export async function signOut(): Promise<void> {
  await fbSignOut(getFirebaseAuth());
}

// Subscribe to auth state. Returns an unsubscribe function.
export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured()) {
    callback(null);
    return () => {};
  }
  return fbOnAuthStateChanged(getFirebaseAuth(), (u) => callback(toUser(u)));
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isFirebaseConfigured()) return null;
  return toUser(getFirebaseAuth().currentUser);
}

// Kept under this name because hooks/useAuth.ts consumes it; now reports whether
// Firebase (the whole backend) is configured.
export { isFirebaseConfigured };

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
  } catch (err) {
    throw friendly(err);
  }
}
