import type { TextStyle } from 'react-native';

const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

export const theme = {
  colors: {
    background: '#F6F7F9',
    surface: '#FFFFFF',
    primary: '#2563EB',
    primaryPressed: '#1D4ED8',
    primarySoft: '#EFF6FF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textOnPrimary: '#FFFFFF',
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',
    positive: '#15803D',
    warning: '#B45309',
    danger: '#DC2626',
    dangerPressed: '#B91C1C',
    disabled: '#9CA3AF',
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 24,
    6: 32,
    7: 48,
  },
  typography: {
    eyebrow: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: fontWeights.bold,
      letterSpacing: 0.8,
    },
    screenTitle: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: fontWeights.bold,
    },
    sectionTitle: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: fontWeights.semibold,
    },
    cardValue: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: fontWeights.bold,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: fontWeights.regular,
    },
    secondary: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: fontWeights.regular,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: fontWeights.regular,
    },
    button: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: fontWeights.semibold,
    },
    label: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: fontWeights.medium,
    },
    tabLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: fontWeights.medium,
    },
  },
  radii: {
    small: 8,
    card: 12,
  },
  layout: {
    screenHorizontalPadding: 16,
    cardPadding: 16,
    inputHeight: 48,
    buttonHeight: 48,
    minimumTouchTarget: 44,
    headerHeight: 56,
    tabBarHeight: 64,
    borderWidth: 1,
    contentMaxWidth: 720,
  },
} as const;
