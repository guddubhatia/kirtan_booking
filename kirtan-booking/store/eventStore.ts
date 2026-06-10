// Event Store — Zustand — SSBBN Kirtan Panel
// Uses local SQLite database (expo-sqlite) — no internet required
import { create } from 'zustand';
import { KirtanEvent, Announcement } from '../types';
import {
  getEvents,
  getAnnouncements,
  addEvent,
  updateEvent,
  deleteEvent,
  addAnnouncement,
} from '../services/database';

interface EventState {
  events: KirtanEvent[];
  announcements: Announcement[];
  isLoading: boolean;
  error: string | null;

  fetchEvents: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  addEvent: (event: Omit<KirtanEvent, 'id' | 'createdAt'>) => Promise<KirtanEvent>;
  updateEvent: (id: string, updates: Partial<KirtanEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  getEventsForDate: (date: string) => KirtanEvent[];
  clearError: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  announcements: [],
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const events = await getEvents();
      set({ events, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load events', isLoading: false });
    }
  },

  fetchAnnouncements: async () => {
    try {
      const announcements = await getAnnouncements();
      set({ announcements });
    } catch {
      /* announcements load silently failed — no data shown */
    }
  },

  addEvent: async (eventData) => {
    const newEvent = await addEvent(eventData);
    set(state => ({ events: [...state.events, newEvent].sort((a, b) => a.date.localeCompare(b.date)) }));
    return newEvent;
  },

  updateEvent: async (id, updates) => {
    await updateEvent(id, updates);
    set(state => ({
      events: state.events.map(e => e.id === id ? { ...e, ...updates } : e),
    }));
  },

  deleteEvent: async (id) => {
    await deleteEvent(id);
    set(state => ({ events: state.events.filter(e => e.id !== id) }));
  },

  addAnnouncement: async (annData) => {
    const { addAnnouncement: dbAddAnn } = await import('../services/database');
    const newAnn = await dbAddAnn(annData);
    set(state => ({ announcements: [newAnn, ...state.announcements] }));
  },

  deleteAnnouncement: async (id) => {
    const { deleteAnnouncement: dbDelAnn } = await import('../services/database');
    await dbDelAnn(id);
    set(state => ({ announcements: state.announcements.filter(a => a.id !== id) }));
  },

  getEventsForDate: (date: string) => {
    return get().events.filter(e => e.date === date);
  },

  clearError: () => set({ error: null }),
}));
