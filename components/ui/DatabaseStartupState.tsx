import { StyleSheet, Text, View } from "react-native";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
import type { DatabaseInitializationStatus } from "@/types/database";
import { Button } from "./Button";
import { LoadingState } from "./LoadingState";
import { ScreenContainer } from "./ScreenContainer";
type Props = {
  onRetry: () => void;
  status: Exclude<DatabaseInitializationStatus, "ready">;
};
export function DatabaseStartupState({ onRetry, status }: Props) {
  const p = useAppPalette();
  if (status === "loading")
    return (
      <ScreenContainer scroll={false} contentContainerStyle={styles.centered}>
        <LoadingState label={strings.startup.loadingTitle} />
        <Text style={[styles.description, { color: p.muted }]}>
          {strings.startup.loadingDescription}
        </Text>
      </ScreenContainer>
    );
  return (
    <ScreenContainer scroll={false} contentContainerStyle={styles.centered}>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: p.text }]}>
          {strings.startup.errorTitle}
        </Text>
        <Text style={[styles.description, { color: p.muted }]}>
          {strings.startup.errorDescription}
        </Text>
      </View>
      <Button label={strings.common.retry} onPress={onRetry} />
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[4],
  },
  copy: { maxWidth: 360, alignItems: "center", gap: theme.spacing[2] },
  title: { textAlign: "center", ...theme.typography.sectionTitle },
  description: {
    maxWidth: 360,
    textAlign: "center",
    ...theme.typography.secondary,
  },
});
