// Admin Dashboard — SSBBN Kirtan Panel
import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useEventStore } from '../../store/eventStore';
import StatCard from '../../components/cards/StatCard';
import EventCard from '../../components/cards/EventCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { getUpcomingEvents } from '../../utils/dateUtils';

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { userEmail, logout, isLoading: authLoading, isAdmin, isDemoMode } = useAuth();
  const { events, announcements, fetchEvents, fetchAnnouncements } = useEventStore();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/admin/login');
    }
  }, [isAdmin, authLoading]);

  useEffect(() => {
    fetchEvents();
    fetchAnnouncements();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      isDemoMode ? 'Exit Demo Mode' : 'Sign Out',
      isDemoMode ? 'Exit the demo and return to the app?' : 'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isDemoMode ? 'Exit Demo' : 'Sign Out',
          style: 'destructive',
          onPress: async () => { await logout(); router.replace('/(tabs)'); },
        },
      ],
    );
  };

  if (authLoading) return <LoadingSpinner message="Verifying credentials..." overlay />;
  if (!isAdmin) return null;

  const today = new Date();
  const thisMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const kirtans = events.filter(e => e.eventType === 'kirtan');
  const thisMonthKirtans = kirtans.filter(e => e.date.startsWith(thisMonthStr));
  const upcoming = getUpcomingEvents(events, 5);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={[Colors.saffronLight, Colors.saffron, Colors.saffronDark]} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.adminLabel}>🙏 Admin Panel</Text>
            <Text style={styles.welcomeText}>Jai Babe Di</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name={isDemoMode ? 'exit-outline' : 'log-out-outline'} size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.emailRow}>
          <Text style={styles.emailText}>{userEmail}</Text>
          {isDemoMode && (
            <View style={styles.demoPill}>
              <Text style={styles.demoPillText}>DEMO</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <View style={styles.demoBanner}>
            <Ionicons name="information-circle" size={18} color={Colors.templeEvent} />
            <Text style={styles.demoBannerText}>
              Demo Mode — Data is saved locally on this device using SQLite. Add Firebase credentials to enable cloud sync.
            </Text>
          </View>
        )}

        {/* Stats */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsRow}>
          <StatCard label="Total Kirtans" value={kirtans.length} icon="musical-notes" />
          <StatCard label="This Month" value={thisMonthKirtans.length} icon="calendar" gradient={[Colors.gold, Colors.saffronDark]} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Upcoming" value={upcoming.length} icon="timer" gradient={['#1565C0', '#0D47A1']} />
          <StatCard label="Announcements" value={announcements.length} icon="megaphone" gradient={['#6A1B9A', '#4A148C']} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton icon="add-circle" label="Add Event" color={Colors.saffron} onPress={() => router.push('/admin/add-event')} />
          <ActionButton icon="calendar" label="Manage Calendar" color={Colors.kirtan} onPress={() => router.push('/admin/calendar')} />
          <ActionButton icon="megaphone" label="Send Notification" color={Colors.gold} onPress={() => router.push('/admin/notifications')} />
        </View>

        {/* Upcoming Events */}
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {upcoming.length === 0
          ? <Text style={styles.emptyText}>No upcoming events scheduled.</Text>
          : upcoming.map(e => <EventCard key={e.id} event={e} compact />)
        }

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

function ActionButton({ icon, label, color, onPress }: { icon: any; label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.actionBtn} activeOpacity={0.85}>
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: Spacing.md },
  adminLabel: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.white },
  welcomeText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  logoutBtn: { padding: Spacing.xs, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.md },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
  emailText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)' },
  demoPill: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  demoPillText: { fontSize: 9, fontWeight: FontWeight.extrabold, color: Colors.white, letterSpacing: 0.5 },
  scroll: { flex: 1 },
  content: { padding: Spacing.base },
  demoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.templeEventLight, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.base,
    borderLeftWidth: 3, borderLeftColor: Colors.templeEvent,
  },
  demoBannerText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md, marginTop: Spacing.md },
  statsRow: { flexDirection: 'row', marginBottom: Spacing.xs },
  actionsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  actionBtn: { flex: 1, backgroundColor: Colors.cardBg, borderRadius: Radius.lg, padding: Spacing.base, alignItems: 'center', gap: Spacing.sm, ...Shadow.sm },
  actionIcon: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.text, textAlign: 'center' },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center', padding: Spacing.xl },
});
