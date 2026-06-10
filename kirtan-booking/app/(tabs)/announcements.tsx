// Announcements Screen — SSBBN Kirtan Panel
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEventStore } from '../../store/eventStore';
import AnnouncementCard from '../../components/cards/AnnouncementCard';
import Header from '../../components/ui/Header';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Colors, FontSize, Spacing } from '../../constants/theme';

export default function AnnouncementsScreen() {
  const { announcements, isLoading, fetchAnnouncements } = useEventStore();

  const onRefresh = useCallback(async () => {
    await fetchAnnouncements();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Announcements" subtitle="Temple News & Updates" />

      {announcements.length === 0 && isLoading ? (
        <LoadingSpinner message="Loading announcements..." />
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <AnnouncementCard announcement={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Colors.saffron} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="megaphone-outline" size={52} color={Colors.borderLight} />
              <Text style={styles.emptyText}>No announcements yet.</Text>
              <Text style={styles.emptySubtext}>Pull down to refresh.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  list: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted, marginTop: Spacing.base, fontWeight: '600' },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textLight, marginTop: Spacing.xs },
});
