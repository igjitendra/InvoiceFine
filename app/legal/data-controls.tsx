import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";

import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";

export default function DataControlsRoute() {
  const router = useRouter();
  const palette = useAppPalette();

  function comingSoon() {
    Alert.alert(
      "Backup & Restore — Coming Soon",
      "The unfinished backup controls are disabled in this release. Your local data was not changed.",
    );
  }

  function deletionLocked() {
    Alert.alert(
      "Deletion is safety-locked",
      "Delete Local Data will be enabled only after backup and recovery are physically verified on Android. Your current data was not changed.",
    );
  }

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
            Your local data
          </Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            Data safety controls for InvoiceFine.
          </Text>
        </View>
      </View>

      <View style={[styles.notice, { backgroundColor: palette.primarySoft }]}>
        <Ionicons
          name="shield-checkmark-outline"
          size={22}
          color={palette.primary}
        />
        <Text style={[styles.noticeText, { color: palette.text }]}>
          Your business data stays in the local InvoiceFine database. No
          destructive data action is enabled in this release.
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[styles.icon, { backgroundColor: palette.surfaceVariant }]}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={22}
              color={palette.primary}
            />
          </View>
          <View style={styles.cardCopy}>
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              Backup & Restore
            </Text>
            <Text
              style={[
                styles.badge,
                {
                  color: palette.primarySoftText,
                  backgroundColor: palette.primarySoft,
                },
              ]}
            >
              COMING SOON
            </Text>
          </View>
        </View>
        <Text style={[styles.cardBody, { color: palette.muted }]}>
          Native JSON file export, picker import and verified recovery will
          arrive in a later version. The previous error-producing preview
          controls are hidden.
        </Text>
        <Button
          label="Backup unavailable in this release"
          variant="secondary"
          disabled
          onPress={comingSoon}
        />
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[styles.icon, { backgroundColor: palette.surfaceVariant }]}
          >
            <Ionicons name="trash-outline" size={22} color={palette.danger} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              Delete Local Data
            </Text>
          </View>
        </View>
        <Text style={[styles.cardBody, { color: palette.muted }]}>
          Deletion remains disabled until backup and recovery pass
          physical-device tests.
        </Text>
        <Button
          label="Deletion safety details"
          variant="danger"
          onPress={deletionLocked}
        />
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
  notice: {
    padding: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  noticeText: { flex: 1, ...theme.typography.secondary },
  card: { padding: 18, borderWidth: 1, borderRadius: 22, gap: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCopy: { flex: 1, alignItems: "flex-start", gap: 6 },
  cardTitle: { ...theme.typography.sectionTitle },
  cardBody: { ...theme.typography.secondary },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    ...theme.typography.caption,
    fontWeight: "700",
  },
});
