import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";

const entries = [
  {
    icon: "business-outline" as const,
    label: strings.pdf.profileTitle,
    description: strings.ux.profileDescription,
    path: "/onboarding" as const,
  },
  {
    icon: "wallet-outline" as const,
    label: strings.expenses.title,
    description: strings.ux.expensesDescription,
    path: "/expenses" as const,
  },
  {
    icon: "shield-checkmark-outline" as const,
    label: "Legal & data",
    description: strings.ux.legalDescription,
    path: "/legal" as const,
  },
];

export default function MoreScreen() {
  const router = useRouter();
  const palette = useAppPalette();

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>
          {strings.tabs.more}
        </Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          {strings.ux.moreSubtitle}
        </Text>
      </View>

      <Text style={[styles.sectionLabel, { color: palette.muted }]}>
        {strings.ux.moreSection}
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        {entries.map((item, index) => (
          <Pressable
            key={item.path}
            accessibilityRole="button"
            onPress={() => router.push(item.path)}
            style={({ pressed }) => [
              styles.row,
              index > 0 && {
                borderTopColor: palette.border,
                borderTopWidth: 1,
              },
              pressed && { backgroundColor: palette.surfaceVariant },
            ]}
          >
            <View
              style={[styles.icon, { backgroundColor: palette.primarySoft }]}
            >
              <Ionicons name={item.icon} size={23} color={palette.primary} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.label, { color: palette.text }]}>
                {item.label}
              </Text>
              <Text style={[styles.rowDescription, { color: palette.muted }]}>
                {item.description}
              </Text>
            </View>
            <View
              style={[
                styles.chevron,
                { backgroundColor: palette.surfaceVariant },
              ]}
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={palette.muted}
              />
            </View>
          </Pressable>
        ))}
      </View>

      <View style={[styles.identity, { backgroundColor: palette.primarySoft }]}>
        <View
          style={[styles.identityMark, { backgroundColor: palette.primary }]}
        >
          <Ionicons
            name="receipt-outline"
            size={21}
            color={palette.textOnPrimary}
          />
        </View>
        <View style={styles.identityCopy}>
          <Text style={[styles.identityTitle, { color: palette.text }]}>
            {strings.ux.brand}
          </Text>
          <Text style={[styles.identityCaption, { color: palette.muted }]}>
            {strings.ux.tagline}
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  header: { gap: 4, marginBottom: 8 },
  title: { ...theme.typography.screenTitle },
  subtitle: { ...theme.typography.secondary },
  sectionLabel: { ...theme.typography.eyebrow, marginTop: 2 },
  card: { borderWidth: 1, borderRadius: 22, overflow: "hidden" },
  row: {
    minHeight: 92,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: { flex: 1, gap: 3 },
  label: { ...theme.typography.body, fontWeight: "700" },
  rowDescription: { ...theme.typography.caption },
  chevron: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  identity: {
    marginTop: 4,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
  },
  identityMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  identityCopy: { flex: 1 },
  identityTitle: { ...theme.typography.label, fontWeight: "700" },
  identityCaption: { ...theme.typography.caption, marginTop: 2 },
});
