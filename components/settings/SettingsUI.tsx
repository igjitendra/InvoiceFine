import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText as Text } from "@/components/ui/AppText";
import { theme } from "@/constants/theme";
import { useAppearance } from "@/hooks/useAppearance";
import { useAppPalette } from "@/hooks/useAppPalette";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function SettingsHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack?: () => void;
}) {
  const palette = useAppPalette();
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={[
            styles.back,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={palette.text} />
        </Pressable>
      ) : null}
      <View style={styles.headerCopy}>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const palette = useAppPalette();
  return (
    <View style={styles.section}>
      <View style={styles.sectionCopy}>
        <Text style={[styles.sectionTitle, { color: palette.muted }]}>
          {title}
        </Text>
        {description ? (
          <Text style={[styles.sectionDescription, { color: palette.muted }]}>
            {description}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function SettingsRow({
  icon,
  label,
  description,
  value,
  badge,
  onPress,
  index = 0,
  disabled = false,
  danger = false,
  trailing,
}: {
  icon: IconName;
  label: string;
  description?: string;
  value?: string;
  badge?: string;
  onPress?: () => void;
  index?: number;
  disabled?: boolean;
  danger?: boolean;
  trailing?: ReactNode;
}) {
  const palette = useAppPalette();
  const { compactMode } = useAppearance();
  const active = Boolean(onPress) && !disabled;
  return (
    <Pressable
      accessibilityRole={active ? "button" : undefined}
      accessibilityState={{ disabled }}
      disabled={!active}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        compactMode && styles.compactRow,
        index > 0 && { borderTopWidth: 1, borderTopColor: palette.border },
        pressed && active && { backgroundColor: palette.surfaceVariant },
        disabled && styles.disabled,
      ]}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor: danger
              ? palette.dark
                ? "#402326"
                : "#FDE8E9"
              : palette.primarySoft,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={danger ? palette.danger : palette.primary}
        />
      </View>
      <View style={styles.rowCopy}>
        <View style={styles.labelLine}>
          <Text
            style={[
              styles.label,
              { color: danger ? palette.danger : palette.text },
            ]}
          >
            {label}
          </Text>
          {badge ? (
            <Text
              style={[
                styles.badge,
                {
                  color: palette.primarySoftText,
                  backgroundColor: palette.primarySoft,
                },
              ]}
            >
              {badge}
            </Text>
          ) : null}
        </View>
        {description ? (
          <Text style={[styles.description, { color: palette.muted }]}>
            {description}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text
          numberOfLines={1}
          style={[styles.value, { color: palette.muted }]}
        >
          {value}
        </Text>
      ) : null}
      {trailing ??
        (active ? (
          <Ionicons name="chevron-forward" size={19} color={palette.muted} />
        ) : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  back: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: { flex: 1, gap: 4 },
  title: { ...theme.typography.screenTitle },
  subtitle: { ...theme.typography.secondary },
  section: { gap: 8 },
  sectionCopy: { gap: 2 },
  sectionTitle: { ...theme.typography.eyebrow },
  sectionDescription: { ...theme.typography.caption },
  card: { borderWidth: 1, borderRadius: 22, overflow: "hidden" },
  row: {
    minHeight: 82,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  compactRow: { minHeight: 68, paddingVertical: 9 },
  disabled: { opacity: 0.58 },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: { flex: 1, gap: 2 },
  labelLine: { flexDirection: "row", alignItems: "center", gap: 7 },
  label: { ...theme.typography.label, fontWeight: "700" },
  description: { ...theme.typography.caption },
  value: { maxWidth: 92, ...theme.typography.caption, textAlign: "right" },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 99,
    ...theme.typography.caption,
    fontWeight: "700",
  },
});
