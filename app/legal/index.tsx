import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { legalDocuments } from "@/constants/legal";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";

export default function LegalHub() {
  const router = useRouter();
  const palette = useAppPalette();
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
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
            Legal & data
          </Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            Policies, licenses and local-data controls
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        {legalDocuments.map((document, index) => (
          <Pressable
            key={document.slug}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/legal/[slug]",
                params: { slug: document.slug },
              })
            }
            style={[
              styles.row,
              index > 0 && {
                borderTopColor: palette.border,
                borderTopWidth: 1,
              },
            ]}
          >
            <View
              style={[styles.icon, { backgroundColor: palette.primarySoft }]}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={palette.primary}
              />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.label, { color: palette.text }]}>
                {document.title}
              </Text>
              <Text style={[styles.summary, { color: palette.muted }]}>
                {document.summary}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color={palette.muted} />
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  back: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: { flex: 1 },
  title: { fontSize: 30, lineHeight: 37, fontWeight: "700" },
  subtitle: { ...theme.typography.secondary },
  card: { borderWidth: 1, borderRadius: 22, overflow: "hidden" },
  row: {
    minHeight: 78,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1 },
  label: { ...theme.typography.label, fontWeight: "700" },
  summary: { ...theme.typography.caption, marginTop: 2 },
});
