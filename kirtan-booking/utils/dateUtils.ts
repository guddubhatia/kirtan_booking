// Date utility functions — SSBBN Kirtan Panel
import { KirtanEvent } from '../types';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(isoStr: string): Date {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDisplayDate(isoStr: string): string {
  if (!isoStr) return '';
  const d = parseISODate(isoStr);
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(isoStr: string): string {
  if (!isoStr) return '';
  const d = parseISODate(isoStr);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay(); // 0=Sun
}

export function isToday(isoStr: string): boolean {
  return isoStr === toISODate(new Date());
}

export function isFuture(isoStr: string): boolean {
  return isoStr > toISODate(new Date());
}

export function isPast(isoStr: string): boolean {
  return isoStr < toISODate(new Date());
}

export function groupEventsByDate(events: KirtanEvent[]): Record<string, KirtanEvent[]> {
  return events.reduce((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {} as Record<string, KirtanEvent[]>);
}

export function getUpcomingEvents(events: KirtanEvent[], limit = 5): KirtanEvent[] {
  const today = toISODate(new Date());
  return events
    .filter(e => e.date >= today && e.eventType !== 'unavailable')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export function formatRelativeDate(isoStr: string): string {
  const today = toISODate(new Date());
  if (isoStr === today) return 'Today';
  const tomorrow = toISODate(new Date(Date.now() + 86400000));
  if (isoStr === tomorrow) return 'Tomorrow';
  return formatShortDate(isoStr);
}

export function formatTimestamp(isoTimestamp: string): string {
  if (!isoTimestamp) return '';
  const d = new Date(isoTimestamp);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}
