// Admin Add/Edit Event Screen — SSBBN Kirtan Panel
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useEventStore } from '../../store/eventStore';
import EventForm from '../../components/admin/EventForm';
import Header from '../../components/ui/Header';
import { Colors, Spacing } from '../../constants/theme';
import { KirtanEvent } from '../../types';

export default function AddEventScreen() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const { events, addEvent, updateEvent } = useEventStore();
  const [existingEvent, setExistingEvent] = useState<KirtanEvent | undefined>();
  const isEditing = !!id;

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/admin/login');
  }, [isAdmin, authLoading]);

  useEffect(() => {
    if (id) {
      const found = events.find(e => e.id === id);
      setExistingEvent(found);
    }
  }, [id, events]);

  const handleSave = async (data: Omit<KirtanEvent, 'id' | 'createdAt'>) => {
    if (isEditing && id) {
      await updateEvent(id, data);
      Alert.alert('Updated!', 'Event has been updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      await addEvent(data);
      Alert.alert('Added!', 'Event has been added to the calendar.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isEditing ? 'Edit Event' : 'Add New Event'}
        subtitle={isEditing ? 'Update event details' : 'Create a kirtan event'}
        showBack
      />

      <View style={styles.form}>
        <EventForm
          initial={existingEvent || (date ? { date } : undefined)}
          onSave={handleSave}
          onCancel={() => router.back()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  form: { flex: 1, padding: Spacing.base },
});
