import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { ScreenContainer } from "./ScreenContainer";
type Props = {
  description: string;
  emptyTitle: string;
  icon: ComponentProps<typeof EmptyState>["icon"];
  title: string;
};
export function PlaceholderScreen({
  description,
  emptyTitle,
  icon,
  title,
}: Props) {
  const p = useAppPalette();
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: p.text }]}>{title}</Text>
      </View>
      <Card>
        <EmptyState description={description} icon={icon} title={emptyTitle} />
      </Card>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  content: { gap: theme.spacing[5] },
  header: {
    minHeight: theme.layout.minimumTouchTarget,
    justifyContent: "center",
  },
  title: { ...theme.typography.screenTitle },
});
