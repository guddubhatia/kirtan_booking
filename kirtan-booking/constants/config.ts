// App Configuration — SSBBN Kirtan Panel

export const Config = {
  // Google Sheets
  SPREADSHEET_ID: process.env.EXPO_PUBLIC_SPREADSHEET_ID || '',
  SHEETS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_SHEETS_API_KEY || '',
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',

  // Sheet names
  EVENTS_SHEET: 'Events',
  ANNOUNCEMENTS_SHEET: 'Announcements',
  PUSH_TOKENS_SHEET: 'PushTokens',

  // Firebase
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',

  // Expo Push
  EXPO_PUSH_URL: 'https://exp.host/--/api/v2/push/send',

  // App
  APP_NAME: 'SSBBN Kirtan Panel',
  ADMIN_APP_NAME: 'SSBBN Kirtan Booking Admin Panel',
  TEMPLE_NAME: 'SSBBN Temple',

  // Cache duration in ms
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};
