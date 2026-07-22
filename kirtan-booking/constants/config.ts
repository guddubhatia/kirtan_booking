// App Configuration — SSBBN Kirtan Panel
// Firebase is the backend (Auth + Firestore). The web API key is not a secret —
// access is enforced by Firestore security rules + Firebase Auth.
//
// These are the public `ssbbn-kirtan` web-app values. They double as HARD-CODED
// FALLBACK DEFAULTS below because `eas update --environment <env>` bundles in a
// sanitised environment and inlines ONLY EAS server-side env vars — it ignores
// the local `.env` file AND shell exports. An OTA published before those server
// vars existed shipped an EMPTY Firebase config, which broke auth + data on the
// installed apps. Keeping the values here as a `||` fallback makes Firebase init
// immune to that class of build/OTA env-inlining gap. The same values are already
// committed in `eas.json` (build profiles), so this exposes nothing new.
const FIREBASE_DEFAULTS = {
  apiKey: 'AIzaSyAry6mJfFTn32Xb6UxPaAFaaLZu8_mPIe4',
  authDomain: 'ssbbn-kirtan.firebaseapp.com',
  projectId: 'ssbbn-kirtan',
  storageBucket: 'ssbbn-kirtan.firebasestorage.app',
  messagingSenderId: '123257539428',
  appId: '1:123257539428:web:2beeea0518d0f6cf3f0871',
};

export const Config = {
  // Firebase — env vars (inlined at build time) override the public defaults.
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || FIREBASE_DEFAULTS.apiKey,
  FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || FIREBASE_DEFAULTS.authDomain,
  FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || FIREBASE_DEFAULTS.projectId,
  FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || FIREBASE_DEFAULTS.storageBucket,
  FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || FIREBASE_DEFAULTS.messagingSenderId,
  FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || FIREBASE_DEFAULTS.appId,

  // Expo Push (broadcast endpoint)
  EXPO_PUSH_URL: 'https://exp.host/--/api/v2/push/send',

  // App
  APP_NAME: 'SSBBN Kirtan Panel',
  ADMIN_APP_NAME: 'SSBBN Kirtan Booking Admin Panel',
  TEMPLE_NAME: 'SSBBN Temple',

  // Cache duration in ms
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};
