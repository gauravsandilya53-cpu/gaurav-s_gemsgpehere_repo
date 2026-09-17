/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Premium Design System — GemSphere Books 2.0
 */

// ─── COLOR PALETTES ──────────────────────────────────────────────────────────

export const LightPalette = {
  // Brand
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  accent: '#F59E0B',
  accentLight: '#FCD34D',

  // Semantic
  success: '#10B981',
  successLight: '#6EE7B7',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FDE68A',
  warningBg: '#FFFBEB',
  error: '#EF4444',
  errorLight: '#FCA5A5',
  errorBg: '#FEF2F2',
  info: '#3B82F6',
  infoBg: '#EFF6FF',

  // Backgrounds
  background: '#F0F4FF',
  backgroundAlt: '#E8EDF8',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFBFF',
  card: '#FFFFFF',
  cardBorder: 'rgba(79, 99, 255, 0.1)',

  // Text
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textDisabled: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#4F63FF',
  divider: '#F1F5F9',

  // Overlays
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayLight: 'rgba(15, 23, 42, 0.2)',
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
};

export const DarkPalette = {
  // Brand
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  secondary: '#A78BFA',
  secondaryLight: '#C4B5FD',
  accent: '#FCD34D',
  accentLight: '#FDE68A',

  // Semantic
  success: '#34D399',
  successLight: '#6EE7B7',
  successBg: 'rgba(16, 185, 129, 0.15)',
  warning: '#FCD34D',
  warningLight: '#FDE68A',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  error: '#F87171',
  errorLight: '#FCA5A5',
  errorBg: 'rgba(239, 68, 68, 0.15)',
  info: '#60A5FA',
  infoBg: 'rgba(59, 130, 246, 0.15)',

  // Backgrounds
  background: '#0D1117',
  backgroundAlt: '#0A0F1A',
  surface: '#161B22',
  surfaceElevated: '#1C2333',
  card: '#1C2333',
  cardBorder: 'rgba(109, 127, 255, 0.15)',

  // Text
  text: '#F0F6FC',
  textSecondary: '#C9D1D9',
  textMuted: '#8B949E',
  textDisabled: '#484F58',
  textInverse: '#0D1117',

  // Borders
  border: '#30363D',
  borderLight: '#21262D',
  borderFocus: '#6D7FFF',
  divider: '#21262D',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  glass: 'rgba(22, 27, 34, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
};

// ─── GRADIENTS ────────────────────────────────────────────────────────────────

export const Gradients = {
  primary: ['#6366F1', '#8B5CF6'] as const,
  primaryReverse: ['#8B5CF6', '#6366F1'] as const,
  success: ['#10B981', '#059669'] as const,
  warning: ['#F59E0B', '#D97706'] as const,
  error: ['#EF4444', '#DC2626'] as const,
  revenue: ['#6366F1', '#06B6D4'] as const,
  profit: ['#10B981', '#3B82F6'] as const,
  expense: ['#F59E0B', '#EF4444'] as const,
  premium: ['#6366F1', '#8B5CF6', '#EC4899'] as const,
  gold: ['#F59E0B', '#FBBF24', '#FCD34D'] as const,
  dark: ['#1C2333', '#161B22'] as const,
  hero: ['#0D1117', '#161B22', '#1C2333'] as const,
};

// ─── TYPOGRAPHY ───────────────────────────────────────────────────────────────

export const Typography = {
  // Display
  display: {
    fontSize: 40,
    fontWeight: '800' as const,
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 20,
  },
  bodySemibold: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  captionMedium: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
  },
  mono: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 20,
    fontVariant: ['tabular-nums'] as const,
  },
};

// ─── SPACING ─────────────────────────────────────────────────────────────────

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 56,
};

// ─── BORDER RADIUS ───────────────────────────────────────────────────────────

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

// ─── SHADOWS ─────────────────────────────────────────────────────────────────

export const Shadows = {
  none: {},
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 16,
  },
  primary: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  success: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  error: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

// ─── ANIMATION ───────────────────────────────────────────────────────────────

export const Animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: {
    damping: 18,
    stiffness: 200,
    mass: 0.8,
  },
  springBouncy: {
    damping: 12,
    stiffness: 180,
    mass: 0.6,
  },
};

// ─── ICON SIZES ──────────────────────────────────────────────────────────────

export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── LAYOUT ──────────────────────────────────────────────────────────────────

export const Layout = {
  screenPadding: 20,
  cardPadding: 16,
  headerHeight: 56,
  tabBarHeight: 72,
  fabSize: 56,
};

// ─── COMPOSITE THEME EXPORT ──────────────────────────────────────────────────

export const LightTheme = {
  dark: false,
  Palette: LightPalette,
  Typography,
  Spacing,
  Radius,
  Shadows,
  Animation,
  IconSize,
  Layout,
  Gradients,
};

export const DarkTheme = {
  dark: true,
  Palette: DarkPalette,
  Typography,
  Spacing,
  Radius,
  Shadows,
  Animation,
  IconSize,
  Layout,
  Gradients,
};

// Legacy compat — screens that import { Theme } still work
export const Palette = LightPalette;
export const Theme = LightTheme;
