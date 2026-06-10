// AnnouncementCard — SSBBN Kirtan Panel
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Announcement } from '../../types';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { formatTimestamp } from '../../utils/dateUtils';

interface AnnouncementCardProps {
  announcement: Announcement;
}

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name="megaphone" size={20} color={Colors.saffron} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{announcement.title}</Text>
        <Text style={styles.body}>{announcement.body}</Text>
        <Text style={styles.date}>{formatTimestamp(announcement.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.saffron,
    ...Shadow.sm,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.saffronPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  content: { flex: 1 },
  title: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 4 },
  body: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  date: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.sm },
});
