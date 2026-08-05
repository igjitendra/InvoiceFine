import { Alert, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";

export default function DataControlsRoute() {
  const palette = useAppPalette();
  const explain = () =>
    Alert.alert(
      "Safety work required",
      "This control will be enabled only with verified export, restore, integrity checks, and destructive confirmation. Your current data was not changed.",
    );
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: palette.text }]}>
        Your local data
      </Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>
        InvoiceFine keeps business records on this device. Destructive controls
        remain locked until the backup and restore workflow is verified.
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.text }]}>
          Export My Data
        </Text>
        <Text style={[styles.cardBody, { color: palette.muted }]}>
          Create a portable, integrity-checked business backup.
        </Text>
        <Button
          label="Export safety details"
          variant="secondary"
          onPress={explain}
        />
      </View>
      <View
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: palette.text }]}>
          Delete Local Data
        </Text>
        <Text style={[styles.cardBody, { color: palette.muted }]}>
          Permanently remove local business records only after explicit
          confirmation.
        </Text>
        <Button
          label="Deletion safety details"
          variant="danger"
          onPress={explain}
        />
      </View>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  content: { gap: 18 },
  title: { ...theme.typography.screenTitle },
  subtitle: { ...theme.typography.body },
  card: { padding: 18, borderWidth: 1, borderRadius: 22, gap: 12 },
  cardTitle: { ...theme.typography.sectionTitle },
  cardBody: { ...theme.typography.secondary },
});
