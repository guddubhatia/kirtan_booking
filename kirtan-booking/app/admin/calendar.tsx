// Admin Calendar Management — SSBBN Kirtan Panel
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useEventStore } from '../../store/eventStore';
import KirtanCalendar from '../../components/calendar/KirtanCalendar';
import Header from '../../components/ui/Header';
import EventCard from '../../components/cards/EventCard';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { KirtanEvent } from '../../types';
import { toISODate, formatDisplayDate } from '../../utils/dateUtils';

export default function AdminCalendarScreen() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { events, deleteEvent, fetchEvents, isLoading } = useEventStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(toISODate(new Date()));
  const [selectedDateEvents, setSelectedDateEvents] = useState<KirtanEvent[]>([]);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/admin/login');
  }, [isAdmin, authLoading]);

  if (!isAdmin) return null;

  const handleDayPress = (date: string, dayEvents: KirtanEvent[]) => {
    setSelectedDate(date);
    setSelectedDateEvents(dayEvents);
  };

  const handleDelete = (event: KirtanEvent) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await deleteEvent(event.id);
            setSelectedDateEvents(prev => prev.filter(e => e.id !== event.id));
          },
        },
      ],
    );
  };

  const handleEdit = (event: KirtanEvent) => {
    router.push({ pathname: '/admin/add-event', params: { id: event.id } });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Calendar Management"
        showBack
        rightAction={{ icon: 'add-circle', onPress: () => router.push('/admin/add-event') }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchEvents} tintColor={Colors.saffron} />}
      >
        <KirtanCalendar events={events} onDayPress={handleDayPress} selectedDate={selectedDate} />

        <View style={styles.selectedSection}>
          <Text style={styles.selectedDate}>
            {selectedDate ? formatDisplayDate(selectedDate) : 'Tap a date to see events'}
          </Text>

          {selectedDateEvents.length === 0 ? (
            <View style={styles.emptyDay}>
              <Ionicons name="calendar-outline" size={32} color={Colors.borderLight} />
              <Text style={styles.emptyDayText}>No events on this day</Text>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/admin/add-event', params: { date: selectedDate || '' } })}
                style={styles.addDayBtn}
              >
                <Ionicons name="add" size={16} color={Colors.saffron} />
                <Text style={styles.addDayText}>Add Event for this Day</Text>
              </TouchableOpacity>
            </View>
          ) : (
            selectedDateEvents.map(event => (
              <View key={event.id} style={styles.eventRow}>
                <View style={styles.eventCardWrapper}>
                  <EventCard event={event} />
                </View>
                <View style={styles.eventActions}>
                  <TouchableOpacity onPress={() => handleEdit(event)} style={[styles.actionBtn, styles.editBtn]}>
                    <Ionicons name="pencil" size={16} color={Colors.saffron} />
                    <Text style={[styles.actionText, { color: Colors.saffron }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(event)} style={[styles.actionBtn, styles.deleteBtn]}>
                    <Ionicons name="trash" size={16} color={Colors.unavailable} />
                    <Text style={[styles.actionText, { color: Colors.unavailable }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/admin/add-event')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scroll: { flex: 1 },
  content: { padding: Spacing.base },
  selectedSection: { marginTop: Spacing.xl },
  selectedDate: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  emptyDay: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.sm },
  emptyDayText: { fontSize: FontSize.base, color: Colors.textMuted },
  addDayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.saffron,
    marginTop: Spacing.xs,
  },
  addDayText: { fontSize: FontSize.sm, color: Colors.saffron, fontWeight: FontWeight.semibold },
  eventRow: { marginBottom: Spacing.sm },
  eventCardWrapper: {},
  eventActions: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-end', marginTop: -Spacing.sm, marginBottom: Spacing.sm },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  editBtn: { backgroundColor: Colors.saffronPale },
  deleteBtn: { backgroundColor: Colors.unavailableLight },
  actionText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  fab: {
    position: 'absolute', bottom: Spacing.xl, right: Spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.saffron,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.saffron,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
