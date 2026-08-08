import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  SettingsHeader,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/SettingsUI";
export default function DataToolsScreen() {
  const router = useRouter();
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SettingsHeader
        title="Import & Export"
        subtitle="Preview and validate data before changing local records."
        onBack={() => router.back()}
      />
      <SettingsSection title="CSV TOOLS">
        <SettingsRow
          icon="people-outline"
          label="Customers"
          description="Import, export, mapping and duplicate-phone policies"
          badge="READY"
          onPress={() => router.push("/settings/data/customers")}
        />
        <SettingsRow
          index={1}
          icon="cube-outline"
          label="Products"
          description="Import catalog, stock, category, unit, pricing and GST"
          badge="NEW"
          onPress={() => router.push("/settings/data/products")}
        />
        <SettingsRow
          index={2}
          icon="construct-outline"
          label="Services"
          description="Import services, pricing model, SAC and duration"
          badge="NEW"
          onPress={() => router.push("/settings/data/services")}
        />
      </SettingsSection>
      <SettingsSection title="EXPORTS">
        <SettingsRow
          icon="download-outline"
          label="Selected CSV Exports"
          description="Customers, products, services, expenses, payments, invoices and stock"
          badge="READY"
          onPress={() => router.push("/settings/data/exports")}
        />
      </SettingsSection>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({ content: { gap: 22 } });
