// EventCard — SSBBN Kirtan Panel
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { KirtanEvent } from '../../types';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { formatDisplayDate, formatTime, formatRelativeDate } from '../../utils/dateUtils';

interface EventCardProps {
  event: KirtanEvent;
  compact?: boolean;
}

const TYPE_CONFIG = {
  kirtan: { color: Colors.kirtan, bg: Colors.kirtanLight, icon: 'musical-notes' as const, label: 'Kirtan' },
  temple_event: { color: Colors.kirtan, bg: Colors.kirtanLight, icon: 'musical-notes' as const, label: 'Kirtan' },
  unavailable: { color: Colors.unavailable, bg: Colors.unavailableLight, icon: 'close-circle' as const, label: 'Unavailable' },
};

const STATUS_CONFIG = {
  confirmed: { color: Colors.kirtan, label: 'Confirmed' },
  tentative: { color: Colors.templeEvent, label: 'Tentative' },
  cancelled: { color: Colors.unavailable, label: 'Cancelled' },
};

export default function EventCard({ event, compact = false }: EventCardProps) {
  const type = TYPE_CONFIG[event.eventType];
  const status = STATUS_CONFIG[event.status];

  const handlePress = () => router.push(`/event/${event.id}`);

  if (compact) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={[styles.compact, { borderLeftColor: type.color }]}>
        <View style={[styles.compactDot, { backgroundColor: type.color }]} />
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{event.title}</Text>
          <Text style={styles.compactMeta}>
            {formatRelativeDate(event.date)}{event.time ? ` · ${formatTime(event.time)}` : ''}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.88} style={styles.card}>
      {/* Type indicator strip */}
      <View style={[styles.strip, { backgroundColor: type.color }]} />

      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={[styles.typeBadge, { backgroundColor: type.bg }]}>
            <Ionicons name={type.icon} size={12} color={type.color} />
            <Text style={[styles.typeBadgeText, { color: type.color }]}>{type.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>

        {/* Meta info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={Colors.saffron} />
            <Text style={styles.metaText}>{formatDisplayDate(event.date)}</Text>
          </View>
          {event.time ? (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.saffron} />
              <Text style={styles.metaText}>{formatTime(event.time)}</Text>
            </View>
          ) : null}
        </View>

        {event.location ? (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={Colors.saffron} />
            <Text style={styles.metaText} numberOfLines={1}>{event.location}</Text>
          </View>
        ) : null}

        {event.description ? (
          <Text style={styles.description} numberOfLines={2}>{event.description}</Text>
        ) : null}

        <View style={styles.footer}>
          <Text style={[styles.footerLink, { color: type.color }]}>View Details →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  strip: { width: 5 },
  body: { flex: 1, padding: Spacing.base },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  typeBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm, lineHeight: 24 },
  metaRow: { flexDirection: 'row', gap: Spacing.base, flexWrap: 'wrap', marginBottom: Spacing.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  metaText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  description: { fontSize: FontSize.sm, color: Colors.textMuted, lineHeight: 19, marginTop: Spacing.xs },
  footer: { marginTop: Spacing.sm },
  footerLink: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  // Compact
  compact: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  compactDot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing.sm },
  compactContent: { flex: 1 },
  compactTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  compactMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
});
