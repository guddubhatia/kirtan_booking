// services/notifications.ts — SSBBN Kirtan Panel (Production)
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { savePushToken } from './database';
import { Config } from '../constants/config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) return null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9933',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    await savePushToken(token);
    return token;
  } catch {
    return null;
  }
}

export async function sendLocalNotification(title: string, body: string): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  } catch { /* ignore */ }
}

// Serverless broadcast: post the messages straight to Expo's push service.
// (No backend needed — Firebase has no always-on server.) The admin app reads
// all registered tokens from Firestore and sends here.
// NOTE: Expo's endpoint is reachable from the native admin app. From a browser
// it may be blocked by CORS, so broadcast from the Android admin build.
export async function sendBroadcastNotification(
  tokens: string[], title: string, body: string
): Promise<void> {
  if (tokens.length === 0) return;

  const messages = tokens.map(token => ({
    to: token, sound: 'default', title, body,
    data: { type: 'announcement' },
  }));

  // Expo accepts up to 100 messages per request — send in chunks.
  for (let i = 0; i < messages.length; i += 100) {
    try {
      await fetch(Config.EXPO_PUSH_URL, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(messages.slice(i, i + 100)),
      });
    } catch { /* best-effort — continue with remaining chunks */ }
  }
}
