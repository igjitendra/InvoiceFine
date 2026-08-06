import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

import {
  SettingsHeader,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/SettingsUI";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function SettingsHomeScreen() {
  const router = useRouter();
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SettingsHeader
        title="Settings"
        subtitle="Business, invoices, appearance, data and app preferences."
        onBack={() => router.back()}
      />

      <SettingsSection title="BUSINESS">
        <SettingsRow
          icon="business-outline"
          label="Business Profile"
          description="Identity, GST, prefixes, logo, signature and QR code"
          onPress={() => router.push("/settings/business")}
        />
      </SettingsSection>

      <SettingsSection title="APPEARANCE">
        <SettingsRow
          icon="color-palette-outline"
          label="Theme & Display"
          description="System, light, dark, font size and compact layout"
          onPress={() => router.push("/settings/appearance")}
        />
      </SettingsSection>

      <SettingsSection title="INVOICE">
        <SettingsRow
          icon="document-text-outline"
          label="Invoice Defaults"
          description="Page size, due days, numbering and future document options"
          onPress={() => router.push("/settings/invoice")}
        />
      </SettingsSection>

      <SettingsSection title="DATA">
        <SettingsRow
          icon="swap-horizontal-outline"
          label="Import & Export"
          description="CSV tools will be delivered in the dedicated data phases"
          badge="CSV"
          onPress={() => router.push("/settings/data/customers")}
        />
        <SettingsRow
          index={1}
          icon="shield-checkmark-outline"
          label="Backup, Restore & Delete"
          description="Safety-locked until encrypted recovery is verified"
          badge="LOCKED"
          onPress={() => router.push("/legal/data-controls")}
        />
      </SettingsSection>

      <SettingsSection title="NOTIFICATIONS">
        <SettingsRow
          icon="notifications-outline"
          label="Notification Preferences"
          description="Due payment, low stock, summaries and service reminders"
          onPress={() => router.push("/settings/notifications")}
        />
      </SettingsSection>

      <SettingsSection title="ABOUT">
        <SettingsRow
          icon="information-circle-outline"
          label="About InvoiceFine"
          description="Privacy, terms, version, changelog and support"
          onPress={() => router.push("/settings/about")}
        />
      </SettingsSection>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ content: { gap: 22 } });
