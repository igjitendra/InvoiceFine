import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Switch, View } from "react-native";

import { AppText as Text } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppearance } from "@/hooks/useAppearance";
import { useAppPalette } from "@/hooks/useAppPalette";
import type {
  CatalogViewPreference,
  FontSizePreference,
  ThemePreference,
} from "@/types/appearance";

const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: "phone-portrait-outline" | "sunny-outline" | "moon-outline";
}> = [
  {
    value: "system",
    label: strings.appearance.system,
    description: strings.appearance.systemDescription,
    icon: "phone-portrait-outline",
  },
  {
    value: "light",
    label: strings.appearance.light,
    description: strings.appearance.lightDescription,
    icon: "sunny-outline",
  },
  {
    value: "dark",
    label: strings.appearance.dark,
    description: strings.appearance.darkDescription,
    icon: "moon-outline",
  },
];

const fontOptions: Array<{
  value: FontSizePreference;
  label: string;
}> = [
  { value: "small", label: strings.appearance.small },
  { value: "medium", label: strings.appearance.medium },
  { value: "large", label: strings.appearance.large },
];

const viewOptions: Array<{
  value: CatalogViewPreference;
  label: string;
  icon: "grid-outline" | "list-outline";
}> = [
  {
    value: "card",
    label: strings.appearance.cardView,
    icon: "grid-outline",
  },
  {
    value: "list",
    label: strings.appearance.listView,
    icon: "list-outline",
  },
];

export default function AppearanceSettingsScreen() {
  const router = useRouter();
  const palette = useAppPalette();
  const appearance = useAppearance();

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={strings.common.back}
          onPress={() => router.back()}
          style={[
            styles.back,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={palette.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: palette.text }]}>
            {strings.appearance.title}
          </Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            {strings.appearance.subtitle}
          </Text>
        </View>
      </View>

      <SectionTitle
        title={strings.appearance.theme}
        description={strings.appearance.themeDescription}
      />
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        {themeOptions.map((option, index) => {
          const selected = appearance.theme === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => appearance.setTheme(option.value)}
              style={({ pressed }) => [
                styles.optionRow,
                index > 0 && {
                  borderTopColor: palette.border,
                  borderTopWidth: 1,
                },
                pressed && { backgroundColor: palette.surfaceVariant },
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  {
                    backgroundColor: selected
                      ? palette.primarySoft
                      : palette.surfaceVariant,
                  },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={21}
                  color={selected ? palette.primary : palette.muted}
                />
              </View>
              <View style={styles.optionCopy}>
                <Text style={[styles.optionLabel, { color: palette.text }]}>
                  {option.label}
                </Text>
                <Text
                  style={[styles.optionDescription, { color: palette.muted }]}
                >
                  {option.description}
                </Text>
              </View>
              <Ionicons
                name={selected ? "radio-button-on" : "radio-button-off"}
                size={23}
                color={selected ? palette.primary : palette.muted}
              />
            </Pressable>
          );
        })}
      </View>

      <SectionTitle title={strings.appearance.fontSize} />
      <SegmentedControl
        options={fontOptions}
        selected={appearance.fontSize}
        onSelect={appearance.setFontSize}
      />

      <SectionTitle title={strings.appearance.catalogView} />
      <View style={styles.viewOptions}>
        {viewOptions.map((option) => {
          const selected = appearance.catalogView === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => appearance.setCatalogView(option.value)}
              style={[
                styles.viewOption,
                {
                  backgroundColor: selected
                    ? palette.primarySoft
                    : palette.surface,
                  borderColor: selected ? palette.primary : palette.border,
                },
              ]}
            >
              <Ionicons
                name={option.icon}
                size={22}
                color={selected ? palette.primary : palette.muted}
              />
              <Text
                style={[
                  styles.viewLabel,
                  { color: selected ? palette.primary : palette.text },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.switchRow,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.optionCopy}>
          <Text style={[styles.optionLabel, { color: palette.text }]}>
            {strings.appearance.compactMode}
          </Text>
          <Text style={[styles.optionDescription, { color: palette.muted }]}>
            {strings.appearance.compactDescription}
          </Text>
        </View>
        <Switch
          accessibilityLabel={strings.appearance.compactMode}
          value={appearance.compactMode}
          onValueChange={appearance.setCompactMode}
          trackColor={{
            false: palette.borderStrong,
            true: palette.primarySoftText,
          }}
          thumbColor={
            appearance.compactMode ? palette.primary : palette.surface
          }
        />
      </View>

      <Text style={[styles.sectionLabel, { color: palette.muted }]}>
        {strings.appearance.preview}
      </Text>
      <View
        style={[
          styles.preview,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
            padding: appearance.compactMode ? 12 : 18,
          },
        ]}
      >
        <View
          style={[styles.previewMark, { backgroundColor: palette.primarySoft }]}
        >
          <Ionicons name="sparkles" size={22} color={palette.primary} />
        </View>
        <View style={styles.previewCopy}>
          <Text style={[styles.previewTitle, { color: palette.text }]}>
            {strings.appearance.previewTitle}
          </Text>
          <Text style={[styles.previewDescription, { color: palette.muted }]}>
            {strings.appearance.previewDescription}
          </Text>
        </View>
      </View>
      <Text style={[styles.storage, { color: palette.muted }]}>
        {strings.appearance.storageDescription}
      </Text>
    </ScreenContainer>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const palette = useAppPalette();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionLabel, { color: palette.muted }]}>
        {title}
      </Text>
      {description ? (
        <Text style={[styles.sectionDescription, { color: palette.muted }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

function SegmentedControl<Option extends string>({
  options,
  selected,
  onSelect,
}: {
  options: Array<{ value: Option; label: string }>;
  selected: Option;
  onSelect: (value: Option) => void;
}) {
  const palette = useAppPalette();
  return (
    <View
      style={[
        styles.segmented,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      {options.map((option) => {
        const active = selected === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(option.value)}
            style={[
              styles.segment,
              active && { backgroundColor: palette.primary },
            ]}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: active ? palette.textOnPrimary : palette.muted },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  headerCopy: { flex: 1, gap: 4 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...theme.typography.screenTitle },
  subtitle: { ...theme.typography.secondary },
  sectionHeader: { gap: 3, marginTop: 8 },
  sectionLabel: { ...theme.typography.eyebrow },
  sectionDescription: { ...theme.typography.caption },
  card: { borderWidth: 1, borderRadius: 20, overflow: "hidden" },
  optionRow: {
    minHeight: 78,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCopy: { flex: 1, gap: 2 },
  optionLabel: { ...theme.typography.label, fontWeight: "700" },
  optionDescription: { ...theme.typography.caption },
  segmented: {
    minHeight: 50,
    padding: 4,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
  },
  segment: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentLabel: { ...theme.typography.label, fontWeight: "700" },
  viewOptions: { flexDirection: "row", gap: 10 },
  viewOption: {
    flex: 1,
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  viewLabel: { ...theme.typography.label, fontWeight: "700" },
  switchRow: {
    minHeight: 78,
    padding: 14,
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  preview: {
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  previewMark: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  previewCopy: { flex: 1, gap: 3 },
  previewTitle: { ...theme.typography.sectionTitle },
  previewDescription: { ...theme.typography.secondary },
  storage: { ...theme.typography.caption, textAlign: "center" },
});
