// Data layer — SSBBN Kirtan Panel
// Events, announcements and push tokens all live in Cloud Firestore.
// Public reads (events/announcements) are allowed by the security rules;
// writes require an authenticated admin (see firestore.rules).
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebase';
import { KirtanEvent, Announcement, EventType, EventStatus } from '../types';

const EVENTS = 'events';
const ANNOUNCEMENTS = 'announcements';
const PUSH_TOKENS = 'pushTokens';

const nowIso = () => new Date().toISOString();

// ── Events ────────────────────────────────────────────────────────
function toEvent(id: string, d: any): KirtanEvent {
  return {
    id,
    title: d.title ?? '',
    eventType: (d.eventType ?? 'kirtan') as EventType,
    date: d.date ?? '',
    time: d.time ?? '',
    location: d.location ?? '',
    description: d.description ?? '',
    status: (d.status ?? 'confirmed') as EventStatus,
    notes: d.notes ?? '',
    createdAt: d.createdAt ?? '',
  };
}

export async function getEvents(): Promise<KirtanEvent[]> {
  const snap = await getDocs(collection(getDb(), EVENTS));
  const events = snap.docs.map((docSnap) => toEvent(docSnap.id, docSnap.data()));
  // Sort client-side (date asc, then time asc) so no composite index is required.
  return events.sort((a, b) =>
    a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)
  );
}

export async function getEventById(id: string): Promise<KirtanEvent | null> {
  try {
    const snap = await getDoc(doc(getDb(), EVENTS, id));
    return snap.exists() ? toEvent(snap.id, snap.data()) : null;
  } catch {
    return null;
  }
}

export async function addEvent(
  event: Omit<KirtanEvent, 'id' | 'createdAt'>
): Promise<KirtanEvent> {
  const ref = doc(collection(getDb(), EVENTS)); // auto-generated id
  const record = {
    title: event.title,
    eventType: event.eventType,
    date: event.date,
    time: event.time || '',
    location: event.location || '',
    description: event.description || '',
    status: event.status || 'confirmed',
    notes: event.notes || '',
    createdAt: nowIso(),
  };
  await setDoc(ref, record);
  return { id: ref.id, ...record };
}

export async function updateEvent(id: string, updates: Partial<KirtanEvent>): Promise<void> {
  const patch: Record<string, any> = {};
  const fields: (keyof KirtanEvent)[] = [
    'title', 'eventType', 'date', 'time', 'location', 'description', 'status', 'notes',
  ];
  for (const f of fields) {
    if (updates[f] !== undefined) patch[f] = updates[f];
  }
  if (Object.keys(patch).length > 0) {
    await updateDoc(doc(getDb(), EVENTS, id), patch);
  }
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), EVENTS, id));
}

// ── Announcements ─────────────────────────────────────────────────
function toAnn(id: string, d: any): Announcement {
  return { id, title: d.title ?? '', body: d.body ?? '', createdAt: d.createdAt ?? '' };
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const snap = await getDocs(collection(getDb(), ANNOUNCEMENTS));
  return snap.docs
    .map((docSnap) => toAnn(docSnap.id, docSnap.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // newest first
}

export async function addAnnouncement(
  ann: Omit<Announcement, 'id' | 'createdAt'>
): Promise<Announcement> {
  const ref = doc(collection(getDb(), ANNOUNCEMENTS));
  const record = { title: ann.title, body: ann.body || '', createdAt: nowIso() };
  await setDoc(ref, record);
  return { id: ref.id, ...record };
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), ANNOUNCEMENTS, id));
}

// ── Push tokens ───────────────────────────────────────────────────
export async function savePushToken(token: string): Promise<void> {
  try {
    // Token as the document id → re-registration overwrites instead of duplicating.
    await setDoc(doc(getDb(), PUSH_TOKENS, token), { token, createdAt: nowIso() });
  } catch {
    /* best-effort */
  }
}

export async function getPushTokens(): Promise<string[]> {
  try {
    const snap = await getDocs(collection(getDb(), PUSH_TOKENS));
    return snap.docs.map((d) => (d.data() as any).token).filter(Boolean);
  } catch {
    return [];
  }
}

// ── Init (no-op — Firestore needs no schema/migration) ────────────
export async function initDatabase(): Promise<void> {}

export { isFirebaseConfigured };
