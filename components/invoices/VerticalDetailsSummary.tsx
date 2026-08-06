import { StyleSheet, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
import { verticalDetailEntries, workflowTitle } from "@/lib/vertical-details";
import type { VerticalInvoiceDetails } from "@/types/vertical-workflow";
export function VerticalDetailsSummary({
  details,
}: {
  details: VerticalInvoiceDetails | null;
}) {
  const p = useAppPalette();
  if (!details) return null;
  const rows = verticalDetailEntries(details);
  if (!rows.length) return null;
  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: p.text }]}>
        {workflowTitle(details.workflow)}
      </Text>
      {rows.map((row) => (
        <View
          key={row.label}
          style={[styles.row, { borderBottomColor: p.border }]}
        >
          <Text style={[styles.label, { color: p.muted }]}>{row.label}</Text>
          <Text style={[styles.value, { color: p.text }]}>{row.value}</Text>
        </View>
      ))}
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { gap: 4 },
  title: { ...theme.typography.sectionTitle, marginBottom: 6 },
  row: {
    minHeight: 46,
    paddingVertical: 8,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
  },
  label: { width: 120, ...theme.typography.secondary },
  value: { flex: 1, ...theme.typography.secondary, fontWeight: "600" },
});
