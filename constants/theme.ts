import { Appearance, type TextStyle } from "react-native";

import { createAppPalette } from "@/constants/palette";

const weights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const satisfies Record<string, TextStyle["fontWeight"]>;

const runtime = createAppPalette(Appearance.getColorScheme() === "dark");

export const theme = {
  colors: {
    background: runtime.background,
    surface: runtime.surface,
    surfaceVariant: runtime.surfaceVariant,
    primary: runtime.primary,
    primaryPressed: runtime.primaryPressed,
    primarySoft: runtime.primarySoft,
    textPrimary: runtime.text,
    textSecondary: runtime.muted,
    textOnPrimary: runtime.textOnPrimary,
    border: runtime.border,
    borderStrong: runtime.borderStrong,
    positive: runtime.positive,
    warning: runtime.warning,
    danger: runtime.danger,
    dangerPressed: runtime.dangerPressed,
    disabled: runtime.disabled,
  },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48 },
  typography: {
    eyebrow: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: weights.bold,
      letterSpacing: 0.8,
    },
    screenTitle: { fontSize: 34, lineHeight: 42, fontWeight: weights.bold },
    sectionTitle: {
      fontSize: 20,
      lineHeight: 26,
      fontWeight: weights.semibold,
    },
    cardValue: { fontSize: 28, lineHeight: 34, fontWeight: weights.bold },
    body: { fontSize: 17, lineHeight: 25, fontWeight: weights.regular },
    secondary: { fontSize: 15, lineHeight: 21, fontWeight: weights.regular },
    caption: { fontSize: 13, lineHeight: 18, fontWeight: weights.regular },
    button: { fontSize: 17, lineHeight: 22, fontWeight: weights.semibold },
    label: { fontSize: 15, lineHeight: 21, fontWeight: weights.medium },
    tabLabel: { fontSize: 12, lineHeight: 16, fontWeight: weights.semibold },
  },
  radii: { small: 14, card: 20 },
  layout: {
    screenHorizontalPadding: 16,
    cardPadding: 16,
    inputHeight: 54,
    buttonHeight: 52,
    minimumTouchTarget: 44,
    headerHeight: 72,
    tabBarHeight: 66,
    borderWidth: 1,
    contentMaxWidth: 720,
  },
} as const;
