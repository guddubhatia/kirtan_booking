// NotificationForm — Admin — SSBBN Kirtan Panel
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import Button from '../ui/Button';
import { sendBroadcastNotification } from '../../services/notifications';
import { getPushTokens } from '../../services/database';

export default function NotificationForm() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Required', 'Please fill in both title and message.');
      return;
    }
    setIsSending(true);
    try {
      const tokens = await getPushTokens();
      await sendBroadcastNotification(tokens, title, body);
      Alert.alert('Sent! 🙏', 'Notification sent to all registered users.');
      setTitle('');
      setBody('');
    } catch {
      Alert.alert('Error', 'Failed to send notification. Check backend configuration.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Notification Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Sunday Kirtan Reminder"
          placeholderTextColor={Colors.textMuted}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Message *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={body}
          onChangeText={setBody}
          placeholder="Write your message to the sangat..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      <Button title="📢 Send to All Users" onPress={handleSend} isLoading={isSending} size="lg" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.base },
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
  textArea: { minHeight: 100, paddingTop: 12 },
});
