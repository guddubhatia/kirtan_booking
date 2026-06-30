// Firebase initialization — SSBBN Kirtan Panel
// Single source of truth for the Firebase App, Auth and Firestore instances.
// Works on web (Expo web export → Firebase Hosting) and native (Expo Android/iOS).
import { Platform } from 'react-native';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
import * as firebaseAuth from 'firebase/auth';
import {
  Firestore,
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/config';

const firebaseConfig = {
  apiKey: Config.FIREBASE_API_KEY,
  authDomain: Config.FIREBASE_AUTH_DOMAIN,
  projectId: Config.FIREBASE_PROJECT_ID,
  storageBucket: Config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID,
  appId: Config.FIREBASE_APP_ID,
};

// "Configured" = the build was given real Firebase credentials. The web API key
// is NOT a secret — access is enforced by Firestore security rules + Auth.
const configured =
  !!firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your_firebase_api_key_here' &&
  !!firebaseConfig.projectId;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (configured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  // Auth — native needs AsyncStorage persistence so the admin stays signed in
  // across app restarts; web uses the default (IndexedDB/localStorage).
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    // getReactNativePersistence exists at runtime but is missing from some
    // @types/firebase versions — resolve it loosely and fall back gracefully.
    const getRNPersistence = (firebaseAuth as any).getReactNativePersistence;
    try {
      auth = getRNPersistence
        ? initializeAuth(app, { persistence: getRNPersistence(AsyncStorage) })
        : getAuth(app);
    } catch {
      // initializeAuth throws if it already ran this session (fast refresh) — reuse it.
      auth = getAuth(app);
    }
  }

  // Firestore — force long polling on native to avoid React Native streaming
  // connectivity issues; web uses the default transport.
  try {
    db =
      Platform.OS === 'web'
        ? getFirestore(app)
        : initializeFirestore(app, { experimentalForceLongPolling: true });
  } catch {
    db = getFirestore(app);
  }
} else if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.info('[Firebase] Not configured — set EXPO_PUBLIC_FIREBASE_* in .env to enable.');
}

export function isFirebaseConfigured(): boolean {
  return configured && !!app;
}

export function getDb(): Firestore {
  if (!db) {
    throw new Error('Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_* in .env.');
  }
  return db;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_* in .env.');
  }
  return auth;
}

export { app, auth, db };
export default app;
