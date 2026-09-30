/**
 * Design Tokens — Golden Starter V2 (Mobile)
 * Clean theme tokens for mobile apps built on Expo & React Native.
 */

export const APP_COLORS = {
  // Brand / Primary
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryContainer: "#DBEAFE",
  onPrimary: "#FFFFFF",

  // Surfaces & Neutrals
  background: "#F8FAFC",
  surfaceCard: "#FFFFFF",
  slateDark: "#0F172A",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  borderLight: "#E2E8F0",
  borderSlate: "#CBD5E1",

  // Feedback states
  alertRed: "#DC2626",
  alertBg: "#FEE2E2",
  alertBorder: "#DC2626",

  warningAmber: "#D97706",
  warningBg: "#FEF3C7",
  warningBorder: "#D97706",

  successGreen: "#10B981",
  successBg: "#ECFDF5",
  successBorder: "#10B981",

  infoBlue: "#0284C7",
  infoBg: "#E0F2FE",
  infoBorder: "#0284C7",

  // Overlay
  backdrop: "rgba(15, 23, 42, 0.6)",
} as const;

export const APP_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  minTouchTarget: 48,
} as const;

export const APP_RADII = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Backward-compatibility aliases for theme
export const CLINICAL_COLORS = APP_COLORS;
export const CLINICAL_SPACING = APP_SPACING;
export const CLINICAL_RADII = APP_RADII;
