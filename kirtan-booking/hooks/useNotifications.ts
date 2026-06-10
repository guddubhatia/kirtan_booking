// useNotifications hook — SSBBN Kirtan Panel (Production)
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../services/notifications';

export function useNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync().then(t => setToken(t || null));

    // Listen for incoming notifications (silent in production)
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

    // Listen for notification taps (silent in production)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { token };
}
