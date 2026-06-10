// Admin Auth Store — Demo mode support — SSBBN Kirtan Panel
// Used when Firebase is not configured, allowing preview of admin features
import { create } from 'zustand';

interface AdminAuthState {
  isDemoMode: boolean;
  demoUser: { email: string; displayName: string } | null;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  isDemoMode: false,
  demoUser: null,

  enterDemoMode: () =>
    set({
      isDemoMode: true,
      demoUser: { email: 'demo@ssbbn.org', displayName: 'Demo Admin' },
    }),

  exitDemoMode: () =>
    set({ isDemoMode: false, demoUser: null }),
}));
