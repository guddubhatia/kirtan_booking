// SSBBN Kirtan Panel — Design System

export const Colors = {
  // Backgrounds
  cream: '#FDF6E3',
  warmWhite: '#FFFEF9',
  creamDark: '#F5EDD6',

  // Brand / Saffron
  saffron: '#E8791A',
  saffronLight: '#F4A855',
  saffronPale: '#FEF3E2',
  saffronDark: '#C4621A',

  // Gold accents
  gold: '#C9A84C',
  goldAccent: '#E8C84A',
  goldLight: '#F8E8A0',

  // Text
  text: '#2D1B0E',
  textSecondary: '#5C3D2E',
  textMuted: '#9B7B6A',
  textLight: '#C4A882',

  // Event type colors
  kirtan: '#2E7D32',     // Rich green
  kirtanLight: '#E8F5E9',
  templeEvent: '#F57F17',  // Amber
  templeEventLight: '#FFF8E1',
  unavailable: '#C62828',  // Deep red
  unavailableLight: '#FFEBEE',

  // UI
  white: '#FFFFFF',
  border: '#E8D5B8',
  borderLight: '#F2E8D8',
  shadow: 'rgba(45, 27, 14, 0.10)',
  shadowMedium: 'rgba(45, 27, 14, 0.18)',

  // Overlays
  overlay: 'rgba(45, 27, 14, 0.5)',
  cardBg: '#FFFDF7',

  // Status
  success: '#2E7D32',
  warning: '#F57F17',
  error: '#C62828',
  info: '#1565C0',
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 36,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};
