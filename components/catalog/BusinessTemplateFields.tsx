import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
import {
  fieldsForTemplate,
  type BusinessTemplate,
} from "@/lib/business-template-engine";
import type { CatalogItemType } from "@/types/catalog";

type Props = {
  template: BusinessTemplate;
  itemType: CatalogItemType;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
};
export function BusinessTemplateFields({
  template,
  itemType,
  value,
  onChange,
}: Props) {
  const p = useAppPalette(),
    fields = fieldsForTemplate(template, itemType);
  if (!fields.length) return null;
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: p.primarySoft }]}>
          <Ionicons
            name={template.icon as "business-outline"}
            size={20}
            color={p.primary}
          />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: p.text }]}>{template.name}</Text>
          <Text style={[styles.subtitle, { color: p.muted }]}>
            Business-specific details
          </Text>
        </View>
      </View>
      {fields.map((field) => (
        <Input
          key={field.key}
          label={field.label}
          value={value[field.key] ?? ""}
          onChangeText={(text) => onChange({ ...value, [field.key]: text })}
          multiline={field.type === "multiline"}
          numberOfLines={field.type === "multiline" ? 3 : 1}
        />
      ))}
    </Card>
  );
}
const styles = StyleSheet.create({
  card: { gap: theme.spacing[4], borderRadius: 22 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1 },
  title: { ...theme.typography.sectionTitle },
  subtitle: { ...theme.typography.secondary, marginTop: 2 },
});
