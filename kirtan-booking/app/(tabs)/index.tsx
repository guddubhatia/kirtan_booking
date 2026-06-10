// Home Screen — Calendar + Upcoming Kirtans — SSBBN Kirtan Panel
import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Animated, Modal, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEventStore } from '../../store/eventStore';
import KirtanCalendar from '../../components/calendar/KirtanCalendar';
import EventCard from '../../components/cards/EventCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import TempleLogoPlaceholder from '../../components/ui/TempleLogoPlaceholder';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { KirtanEvent } from '../../types';
import { getUpcomingEvents, formatDisplayDate } from '../../utils/dateUtils';
import { toISODate } from '../../utils/dateUtils';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { events, isLoading, fetchEvents } = useEventStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(toISODate(new Date()));
  const [selectedDateEvents, setSelectedDateEvents] = useState<KirtanEvent[]>([]);
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const upcoming = getUpcomingEvents(events, 5);

  const onRefresh = useCallback(async () => {
    await fetchEvents();
  }, []);

  const handleDayPress = (date: string, dayEvents: KirtanEvent[]) => {
    setSelectedDate(date);
    setSelectedDateEvents(dayEvents);
    if (dayEvents.length > 0) {
      setDayModalVisible(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60 }).start();
    }
  };

  const closeModal = () => {
    Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }).start(() => {
      setDayModalVisible(false);
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Saffron Header */}
      <LinearGradient
        colors={[Colors.saffronLight, Colors.saffron, Colors.saffronDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TempleLogoPlaceholder size="sm" showName={false} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>SSBBN Kirtan Panel</Text>
            <Text style={styles.headerSub}>🙏 Jai Babe Di</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/admin/login')} style={styles.adminBtn} hitSlop={8}>
            <Ionicons name="shield-checkmark-outline" size={22} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Colors.saffron} />}
      >
        {/* Calendar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kirtan Calendar</Text>
          {isLoading && events.length === 0
            ? <LoadingSpinner message="Loading calendar..." />
            : <KirtanCalendar events={events} onDayPress={handleDayPress} selectedDate={selectedDate} />
          }
        </View>

        {/* Upcoming Kirtans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Kirtans</Text>
          {upcoming.length === 0
            ? <EmptyState icon="calendar-outline" message="No upcoming kirtans scheduled.\nPull down to refresh." />
            : upcoming.map(event => <EventCard key={event.id} event={event} />)
          }
        </View>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>

      {/* Day Events Modal */}
      <Modal visible={dayModalVisible} transparent animationType="none" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={closeModal} activeOpacity={1} />
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalDate}>{selectedDate ? formatDisplayDate(selectedDate) : ''}</Text>
            <Text style={styles.modalSubtitle}>{selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}</Text>

            <FlatList
              data={selectedDateEvents}
              keyExtractor={e => e.id}
              renderItem={({ item }) => <EventCard event={item} />}
              contentContainerStyle={styles.modalList}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity onPress={closeModal} style={styles.modalClose}>
              <Ionicons name="close-circle" size={28} color={Colors.textMuted} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function EmptyState({ icon, message }: { icon: keyof typeof Ionicons.glyphMap; message: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={48} color={Colors.borderLight} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingBottom: Spacing.lg },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: Colors.white },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  adminBtn: { padding: Spacing.xs },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.base },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    paddingLeft: Spacing.xs,
  },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: Colors.overlay },
  modalSheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl,
    maxHeight: '80%',
    ...Shadow.lg,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.base,
  },
  modalDate: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  modalSubtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.base },
  modalList: { paddingBottom: Spacing.xxl },
  modalClose: { position: 'absolute', top: Spacing.base, right: Spacing.base },
  // Empty
  emptyState: { alignItems: 'center', padding: Spacing.xxxl },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.md, lineHeight: 24 },
});
