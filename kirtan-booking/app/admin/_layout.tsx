// Admin Layout — Protected routes — SSBBN Kirtan Panel
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="add-event" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
