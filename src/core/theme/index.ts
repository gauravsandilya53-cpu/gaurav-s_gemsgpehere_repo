/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
export const Palette = {
  primary: '#2563EB',
  secondary: '#64748B',
  accent: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#475569',
  border: '#E2E8F0',
};

export const Typography = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Palette.text,
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Palette.text,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    color: Palette.text,
  },
  caption: {
    fontSize: 12,
    color: Palette.textMuted,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Theme = {
  Palette,
  Typography,
  Spacing,
};




