// Firebase initialization — SSBBN Kirtan Panel
// Gracefully handles missing configuration (public users don't need Firebase)
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Config } from '../constants/config';

const isConfigured =
  !!Config.FIREBASE_API_KEY &&
  Config.FIREBASE_API_KEY !== 'your_firebase_api_key_here';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isConfigured) {
  try {
    const firebaseConfig = {
      apiKey: Config.FIREBASE_API_KEY,
      authDomain: Config.FIREBASE_AUTH_DOMAIN,
      projectId: Config.FIREBASE_PROJECT_ID,
      storageBucket: Config.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID,
      appId: Config.FIREBASE_APP_ID,
    };
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (err) {
    console.warn('[Firebase] Initialization failed. Admin features will be disabled.', err);
    app = null;
    auth = null;
  }
} else {
  console.info('[Firebase] No API key configured. Admin features disabled. Add credentials to .env to enable.');
}

export { auth };
export default app;
