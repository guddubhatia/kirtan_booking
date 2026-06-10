// KirtanCalendar — Full Monthly Calendar — SSBBN Kirtan Panel
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KirtanEvent } from '../../types';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import {
  MONTH_NAMES, DAY_NAMES, getDaysInMonth, getFirstDayOfMonth,
  toISODate, groupEventsByDate, isToday,
} from '../../utils/dateUtils';

interface KirtanCalendarProps {
  events: KirtanEvent[];
  onDayPress: (date: string, events: KirtanEvent[]) => void;
  selectedDate?: string | null;
}

export default function KirtanCalendar({ events, onDayPress, selectedDate }: KirtanCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  // useRef ensures the Animated.Value persists across re-renders — fixes invisible calendar on first load
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const eventMap = groupEventsByDate(events);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [year, month]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // 0=Sun

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete grid rows
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={Colors.saffron} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); }}>
          <Text style={styles.monthTitle}>{MONTH_NAMES[month - 1]} {year}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn} hitSlop={10}>
          <Ionicons name="chevron-forward" size={22} color={Colors.saffron} />
        </TouchableOpacity>
      </View>

      {/* Day of week headers */}
      <View style={styles.weekRow}>
        {DAY_NAMES.map(d => (
          <View key={d} style={styles.weekCell}>
            <Text style={[styles.weekLabel, d === 'Sun' && styles.weekLabelSun]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <Animated.View style={{ opacity: fadeAnim }}>
        {chunk(cells, 7).map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((day, di) => {
              if (!day) return <View key={di} style={styles.dayCell} />;

              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = eventMap[dateStr] || [];
              const isSelected = selectedDate === dateStr;
              const isTodayDate = isToday(dateStr);
              const isSun = (firstDay + (day - 1)) % 7 === 0;

              // Dominant event type for background
              const hasKirtan = dayEvents.some(e => e.eventType === 'kirtan');
              const hasTemple = dayEvents.some(e => e.eventType === 'temple_event');
              const hasUnavailable = dayEvents.some(e => e.eventType === 'unavailable');

              return (
                <TouchableOpacity
                  key={di}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  onPress={() => onDayPress(dateStr, dayEvents)}
                  activeOpacity={0.75}
                >
                  {/* Today ring */}
                  {isTodayDate && !isSelected && (
                    <View style={styles.todayRing} />
                  )}

                  <Text style={[
                    styles.dayText,
                    isSun && styles.dayTextSun,
                    isTodayDate && styles.dayTextToday,
                    isSelected && styles.dayTextSelected,
                  ]}>
                    {day}
                  </Text>

                  {/* Event dots */}
                  {dayEvents.length > 0 && (
                    <View style={styles.dotsRow}>
                      {hasKirtan && <View style={[styles.dot, { backgroundColor: Colors.kirtan }]} />}
                      {hasTemple && <View style={[styles.dot, { backgroundColor: Colors.templeEvent }]} />}
                      {hasUnavailable && <View style={[styles.dot, { backgroundColor: Colors.unavailable }]} />}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </Animated.View>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color={Colors.kirtan} label="Kirtan" />
        <LegendItem color={Colors.unavailable} label="Unavailable" />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    ...Shadow.md,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  navBtn: { padding: Spacing.xs },
  monthTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  weekRow: { flexDirection: 'row' },
  weekCell: { flex: 1, alignItems: 'center', paddingBottom: Spacing.xs },
  weekLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted, letterSpacing: 0.5 },
  weekLabelSun: { color: Colors.saffron },
  dayCell: {
    flex: 1,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    marginVertical: 2,
    marginHorizontal: 1,
    position: 'relative',
  },
  dayCellSelected: {
    backgroundColor: Colors.saffron,
  },
  todayRing: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: Colors.saffron,
  },
  dayText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  dayTextSun: { color: Colors.saffronDark },
  dayTextToday: { color: Colors.saffron, fontWeight: FontWeight.bold },
  dayTextSelected: { color: Colors.white, fontWeight: FontWeight.bold },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
    position: 'absolute',
    bottom: 4,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.base,
    marginTop: Spacing.base,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
});
