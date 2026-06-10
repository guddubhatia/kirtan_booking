// EventForm — Admin — SSBBN Kirtan Panel
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KirtanEvent, EventType, EventStatus } from '../../types';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import Button from '../ui/Button';

interface EventFormProps {
  initial?: Partial<KirtanEvent>;
  onSave: (data: Omit<KirtanEvent, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'kirtan', label: 'Kirtan', color: Colors.kirtan },
  { value: 'unavailable', label: 'Unavailable', color: Colors.unavailable },
];

const STATUSES: { value: EventStatus; label: string }[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'tentative', label: 'Tentative' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function EventForm({ initial, onSave, onCancel }: EventFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [eventType, setEventType] = useState<EventType>(initial?.eventType || 'kirtan');
  const [date, setDate] = useState(initial?.date || '');
  const [time, setTime] = useState(initial?.time || '');
  const [location, setLocation] = useState(initial?.location || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [status, setStatus] = useState<EventStatus>(initial?.status || 'confirmed');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    if (!title.trim()) { Alert.alert('Validation', 'Please enter a title.'); return false; }
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) { Alert.alert('Validation', 'Date must be in YYYY-MM-DD format.'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await onSave({ title, eventType, date, time, location, description, status, notes });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save event.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Field label="Event Title *">
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Evening Kirtan Sabha" placeholderTextColor={Colors.textMuted} />
      </Field>

      <Field label="Event Type *">
        <View style={styles.optionRow}>
          {EVENT_TYPES.map(t => (
            <TouchableOpacity
              key={t.value}
              style={[styles.optionBtn, eventType === t.value && { backgroundColor: t.color, borderColor: t.color }]}
              onPress={() => setEventType(t.value)}
            >
              <Text style={[styles.optionText, eventType === t.value && { color: Colors.white }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Date * (YYYY-MM-DD)">
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2024-12-25" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={10} />
      </Field>

      <Field label="Time (HH:MM, 24h)">
        <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="18:30" placeholderTextColor={Colors.textMuted} keyboardType="numeric" maxLength={5} />
      </Field>

      <Field label="Location">
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Main Hall" placeholderTextColor={Colors.textMuted} />
      </Field>

      <Field label="Status">
        <View style={styles.optionRow}>
          {STATUSES.map(s => (
            <TouchableOpacity
              key={s.value}
              style={[styles.optionBtn, status === s.value && styles.optionBtnActive]}
              onPress={() => setStatus(s.value)}
            >
              <Text style={[styles.optionText, status === s.value && styles.optionTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Description">
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Describe the event..." placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} textAlignVertical="top" />
      </Field>

      <Field label="Notes">
        <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Any additional notes..." placeholderTextColor={Colors.textMuted} multiline numberOfLines={2} textAlignVertical="top" />
      </Field>

      <View style={styles.actions}>
        <Button title="Cancel" onPress={onCancel} variant="outline" style={{ flex: 1, marginRight: Spacing.sm }} />
        <Button title="Save Event" onPress={handleSave} isLoading={isSaving} style={{ flex: 2 }} />
      </View>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  field: { marginBottom: Spacing.base },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.xs },
  input: {
    backgroundColor: Colors.warmWhite,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  textArea: { minHeight: 80, paddingTop: 12 },
  optionRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  optionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.warmWhite,
  },
  optionBtnActive: { backgroundColor: Colors.saffron, borderColor: Colors.saffron },
  optionText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  optionTextActive: { color: Colors.white },
  actions: { flexDirection: 'row', marginTop: Spacing.xl, marginBottom: Spacing.xxxl },
});
