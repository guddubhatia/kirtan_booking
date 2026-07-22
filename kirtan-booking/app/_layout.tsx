// Root Layout — SSBBN Kirtan Panel
// DB init runs in background — UI renders immediately, no blocking spinner
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from '../services/database';
import { useEventStore } from '../store/eventStore';
import { useNotifications } from '../hooks/useNotifications';

export default function RootLayout() {
  const fetchEvents = useEventStore(s => s.fetchEvents);
  const fetchAnnouncements = useEventStore(s => s.fetchAnnouncements);

  // Register this device for push notifications (announcements + kirtan
  // reminders) and save its Expo push token to Firestore. Runs once on launch
  // for every user (client + admin); prompts for the notification permission.
  useNotifications();

  useEffect(() => {
    // Init DB then load data — all non-blocking in background
    initDatabase()
      .then(() => {
        fetchEvents();
        fetchAnnouncements();
      })
      .catch(() => { /* DB init failed silently — app still renders */ });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="event/[id]"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen name="admin" />
      </Stack>
    </SafeAreaProvider>
  );
}
