// API Service — SSBBN Kirtan Panel
// All data operations go through the shared backend REST API.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KirtanEvent, Announcement, EventType, EventStatus } from '../types';

const TOKEN_KEY = 'kirtan_admin_token';

export function getBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_BACKEND_URL;
  // Empty string = relative URL (web served from same origin as backend)
  if (!url) return '';
  return url.replace(/\/$/, '');
}

export function isBackendConfigured(): boolean {
  // On web with no explicit backend URL, assume same-origin — backend is configured
  if (typeof window !== 'undefined') return true;
  return !!process.env.EXPO_PUBLIC_BACKEND_URL;
}

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getStoredToken(): Promise<string | null> {
  return getToken();
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> || {}) },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────
export interface AdminUser {
  email: string;
  role: string;
  token: string;
}

export async function apiLogin(email: string, password: string): Promise<AdminUser> {
  const data = await request<AdminUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await saveToken(data.token);
  return data;
}

export async function apiLogout(): Promise<void> {
  await clearToken();
}

// ── Events ────────────────────────────────────────────────────────
interface EventRow {
  id: string; title: string; event_type: string; date: string;
  time: string; location: string; description: string;
  status: string; notes: string; created_at: string;
}

function rowToEvent(r: EventRow): KirtanEvent {
  return {
    id: r.id, title: r.title, eventType: r.event_type as EventType,
    date: r.date, time: r.time, location: r.location,
    description: r.description, status: r.status as EventStatus,
    notes: r.notes, createdAt: r.created_at,
  };
}

export async function getEvents(): Promise<KirtanEvent[]> {
  const rows = await request<EventRow[]>('/api/events');
  return rows.map(rowToEvent);
}

export async function getEventById(id: string): Promise<KirtanEvent | null> {
  try {
    const row = await request<EventRow>(`/api/events/${id}`);
    return rowToEvent(row);
  } catch {
    return null;
  }
}

export async function addEvent(event: Omit<KirtanEvent, 'id' | 'createdAt'>): Promise<KirtanEvent> {
  const row = await request<EventRow>('/api/events', {
    method: 'POST',
    body: JSON.stringify({
      title: event.title,
      event_type: event.eventType,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      status: event.status,
      notes: event.notes,
    }),
  });
  return rowToEvent(row);
}

export async function updateEvent(id: string, updates: Partial<KirtanEvent>): Promise<void> {
  const body: Record<string, string> = {};
  if (updates.title !== undefined)       body.title        = updates.title;
  if (updates.eventType !== undefined)   body.event_type   = updates.eventType;
  if (updates.date !== undefined)        body.date         = updates.date;
  if (updates.time !== undefined)        body.time         = updates.time;
  if (updates.location !== undefined)    body.location     = updates.location;
  if (updates.description !== undefined) body.description  = updates.description;
  if (updates.status !== undefined)      body.status       = updates.status;
  if (updates.notes !== undefined)       body.notes        = updates.notes;
  await request(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function deleteEvent(id: string): Promise<void> {
  await request(`/api/events/${id}`, { method: 'DELETE' });
}

// ── Announcements ─────────────────────────────────────────────────
interface AnnRow { id: string; title: string; body: string; created_at: string; }

function rowToAnn(r: AnnRow): Announcement {
  return { id: r.id, title: r.title, body: r.body, createdAt: r.created_at };
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const rows = await request<AnnRow[]>('/api/announcements');
  return rows.map(rowToAnn);
}

export async function addAnnouncement(ann: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
  const row = await request<AnnRow>('/api/announcements', {
    method: 'POST',
    body: JSON.stringify(ann),
  });
  return rowToAnn(row);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await request(`/api/announcements/${id}`, { method: 'DELETE' });
}

// ── Push Tokens ───────────────────────────────────────────────────
export async function savePushToken(token: string): Promise<void> {
  try {
    await request('/api/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  } catch { /* best-effort */ }
}

export async function getPushTokens(): Promise<string[]> {
  try {
    return await request<string[]>('/api/notifications/tokens');
  } catch {
    return [];
  }
}

// ── Init (no-op — backend handles schema) ────────────────────────
export async function initDatabase(): Promise<void> {}
