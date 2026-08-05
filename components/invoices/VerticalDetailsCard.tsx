import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
import { fieldsForWorkflow, workflowTitle } from "@/lib/vertical-details";
import type {
  VerticalDetailKey,
  VerticalInvoiceDetails,
} from "@/types/vertical-workflow";
export function VerticalDetailsCard({
  details,
  onChange,
}: {
  details: VerticalInvoiceDetails;
  onChange: (key: VerticalDetailKey, value: string) => void;
}) {
  const p = useAppPalette(),
    fields = fieldsForWorkflow(details.workflow);
  if (!fields.length) return null;
  return (
    <Card style={styles.card}>
      <View>
        <Text style={[styles.title, { color: p.text }]}>
          {workflowTitle(details.workflow)}
        </Text>
        <Text style={[styles.caption, { color: p.muted }]}>
          Saved with the draft, final invoice and PDF.
        </Text>
      </View>
      {fields.map((field) => (
        <Input
          key={field.key}
          label={field.label}
          value={details[field.key]}
          onChangeText={(value) => onChange(field.key, value)}
          multiline={field.multiline}
          keyboardType={field.keyboard ?? "default"}
        />
      ))}
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { gap: 16 },
  title: { ...theme.typography.sectionTitle },
  caption: { ...theme.typography.caption, marginTop: 3 },
});
