// Event Detail Screen — SSBBN Kirtan Panel
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEventStore } from '../../store/eventStore';
import { KirtanEvent, EventType } from '../../types';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { formatDisplayDate, formatTime } from '../../utils/dateUtils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const TYPE_CONFIG: Record<EventType, { label: string; color: string; bg: string; icon: string; gradient: [string, string] }> = {
  kirtan: { label: 'Kirtan', color: Colors.kirtan, bg: Colors.kirtanLight, icon: 'musical-notes', gradient: ['#43A047', '#2E7D32'] },
  temple_event: { label: 'Kirtan', color: Colors.kirtan, bg: Colors.kirtanLight, icon: 'musical-notes', gradient: ['#43A047', '#2E7D32'] },
  unavailable: { label: 'Unavailable', color: Colors.unavailable, bg: Colors.unavailableLight, icon: 'close-circle', gradient: ['#E53935', '#C62828'] },
};

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: Colors.kirtan },
  tentative: { label: 'Tentative', color: Colors.templeEvent },
  cancelled: { label: 'Cancelled', color: Colors.unavailable },
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const events = useEventStore(s => s.events);
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState<KirtanEvent | null>(null);

  useEffect(() => {
    const found = events.find(e => e.id === id);
    if (found) setEvent(found);
  }, [id, events]);

  if (!event) return <LoadingSpinner message="Loading event..." overlay />;

  const type = TYPE_CONFIG[event.eventType];
  const status = STATUS_CONFIG[event.status];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Hero header */}
      <LinearGradient
        colors={type.gradient}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <View style={styles.typeRow}>
            <View style={styles.typeBadge}>
              <Ionicons name={type.icon as any} size={14} color={Colors.white} />
              <Text style={styles.typeBadgeText}>{type.label}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.statusText}>{status.label}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{event.title}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Cards */}
        <View style={styles.infoGrid}>
          {event.date && <InfoChip icon="calendar" label="Date" value={formatDisplayDate(event.date)} />}
          {event.time && <InfoChip icon="time" label="Time" value={formatTime(event.time)} />}
          {event.location && <InfoChip icon="location" label="Location" value={event.location} fullWidth />}
        </View>

        {/* Description */}
        {event.description ? (
          <Section title="About this Event">
            <Text style={styles.bodyText}>{event.description}</Text>
          </Section>
        ) : null}

        {/* Notes */}
        {event.notes ? (
          <Section title="Notes">
            <View style={styles.notesBox}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.saffron} style={{ marginTop: 2 }} />
              <Text style={styles.notesText}>{event.notes}</Text>
            </View>
          </Section>
        ) : null}

        {/* Unavailable note */}
        {event.eventType === 'unavailable' && (
          <View style={styles.unavailableBox}>
            <Ionicons name="warning" size={20} color={Colors.unavailable} />
            <Text style={styles.unavailableText}>Temple is not available on this date.</Text>
          </View>
        )}

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

function InfoChip({ icon, label, value, fullWidth }: { icon: any; label: string; value: string; fullWidth?: boolean }) {
  return (
    <View style={[styles.chip, fullWidth && styles.chipFull]}>
      <View style={styles.chipIcon}>
        <Ionicons name={icon} size={16} color={Colors.saffron} />
      </View>
      <View>
        <Text style={styles.chipLabel}>{label}</Text>
        <Text style={styles.chipValue}>{value}</Text>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  hero: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  heroContent: { gap: Spacing.sm },
  typeRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  typeBadgeText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.white, lineHeight: 36 },
  scroll: { flex: 1 },
  content: { padding: Spacing.base },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flex: 1,
    minWidth: '45%',
    ...Shadow.sm,
  },
  chipFull: { flex: 0, width: '100%' },
  chipIcon: { width: 32, height: 32, borderRadius: Radius.sm, backgroundColor: Colors.saffronPale, alignItems: 'center', justifyContent: 'center' },
  chipLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  chipValue: { fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.semibold, marginTop: 2 },
  section: { backgroundColor: Colors.cardBg, borderRadius: Radius.lg, padding: Spacing.base, marginBottom: Spacing.base, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  bodyText: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 24 },
  notesBox: { flexDirection: 'row', gap: Spacing.sm },
  notesText: { flex: 1, fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22 },
  unavailableBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.unavailableLight,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: Colors.unavailable,
  },
  unavailableText: { flex: 1, fontSize: FontSize.base, color: Colors.unavailable, fontWeight: FontWeight.medium },
});
