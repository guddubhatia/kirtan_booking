// NotificationForm — Admin — SSBBN Kirtan Panel
// Posts an announcement: saves it to Firestore (shows in the Announcements tab).
// The push to every device is sent SERVER-SIDE by the `pushAnnouncementOnCreate`
// Cloud Function (Firestore onCreate trigger), so it reaches users even when the
// app is closed and works from the web admin too (no CORS limit). This form only
// needs to save.
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import Button from '../ui/Button';
import { useEventStore } from '../../store/eventStore';

type Feedback = { type: 'success' | 'error'; msg: string } | null;

export default function NotificationForm() {
  const addAnnouncement = useEventStore(s => s.addAnnouncement);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setFeedback({ type: 'error', msg: 'Please fill in both the title and the message.' });
      return;
    }
    setIsSending(true);
    setFeedback(null);
    try {
      await addAnnouncement({ title: title.trim(), body: body.trim() });
      setFeedback({
        type: 'success',
        msg: 'Announcement posted 🙏 The sangat will be notified.',
      });
      setTitle('');
      setBody('');
    } catch {
      setFeedback({ type: 'error', msg: 'Could not post the announcement. Check your connection and try again.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      {feedback && (
        <View style={[styles.banner, feedback.type === 'success' ? styles.bannerOk : styles.bannerErr]}>
          <Ionicons
            name={feedback.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
            size={18}
            color={feedback.type === 'success' ? Colors.kirtan : '#C62828'}
          />
          <Text style={[styles.bannerText, { color: feedback.type === 'success' ? Colors.kirtan : '#C62828' }]}>
            {feedback.msg}
          </Text>
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Announcement Title *</Text>
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
      <Button title="📢 Post & Notify All" onPress={handleSend} isLoading={isSending} size="lg" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.base },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.base,
  },
  bannerOk: { backgroundColor: Colors.kirtanLight },
  bannerErr: { backgroundColor: '#FDECEA' },
  bannerText: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.medium, lineHeight: 20 },
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
