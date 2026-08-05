import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { legalDocuments } from "@/constants/legal";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";

export default function LegalDocumentRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const palette = useAppPalette();
  const document = legalDocuments.find((item) => item.slug === slug);
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
        <Text style={[styles.headerTitle, { color: palette.text }]}>
          InvoiceFine
        </Text>
      </View>
      {document ? (
        <View
          style={[
            styles.document,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.title, { color: palette.text }]}>
            {document.title}
          </Text>
          <Text style={[styles.updated, { color: palette.muted }]}>
            Effective 5 August 2026
          </Text>
          <Text style={[styles.body, { color: palette.text }]}>
            {document.content}
          </Text>
        </View>
      ) : (
        <EmptyState
          title="Document not found"
          description="Return to Legal & data and try again."
          icon="document-outline"
        />
      )}
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
  headerTitle: { ...theme.typography.sectionTitle },
  document: { padding: 20, borderWidth: 1, borderRadius: 22 },
  title: { ...theme.typography.screenTitle },
  updated: { ...theme.typography.caption, marginTop: 8 },
  body: { ...theme.typography.body, marginTop: 22 },
});
