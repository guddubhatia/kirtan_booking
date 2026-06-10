// Admin Notifications Screen — SSBBN Kirtan Panel
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/ui/Header';
import NotificationForm from '../../components/admin/NotificationForm';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';

export default function AdminNotificationsScreen() {
  const { isAdmin, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/admin/login');
  }, [isAdmin, authLoading]);

  if (!isAdmin) return null;

  return (
    <View style={styles.container}>
      <Header title="Push Notifications" subtitle="Broadcast to all users" showBack />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={22} color={Colors.saffron} />
          <Text style={styles.infoText}>
            This will send a push notification to all users who have the app installed and have granted notification permissions.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Compose Notification</Text>
          <NotificationForm />
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>📌 Tips</Text>
          <TipItem text={'Keep the title short and meaningful (e.g. "Kirtan Reminder")'} />
          <TipItem text="Include date and time in the message for event reminders" />
          <TipItem text="Use respectful, devotional language for the sangat" />
          <TipItem text="Avoid sending multiple notifications on the same day" />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <View style={styles.tipItem}>
      <View style={styles.tipDot} />
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scroll: { flex: 1 },
  content: { padding: Spacing.base },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.saffronPale,
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: Colors.saffron,
  },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  formCard: { backgroundColor: Colors.cardBg, borderRadius: Radius.lg, padding: Spacing.base, marginBottom: Spacing.base },
  formTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.base },
  tipsCard: { backgroundColor: Colors.cardBg, borderRadius: Radius.lg, padding: Spacing.base },
  tipsTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.saffron, marginTop: 7 },
  tipText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});
