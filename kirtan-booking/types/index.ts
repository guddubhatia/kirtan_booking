// Type definitions for SSBBN Kirtan Panel

export type EventType = 'kirtan' | 'temple_event' | 'unavailable';
export type EventStatus = 'confirmed' | 'tentative' | 'cancelled';

export interface KirtanEvent {
  id: string;
  title: string;
  eventType: EventType;
  date: string; // ISO 8601 YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  description: string;
  status: EventStatus;
  notes: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface AdminStats {
  totalKirtans: number;
  thisMonth: number;
  upcoming: number;
  announcements: number;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}
