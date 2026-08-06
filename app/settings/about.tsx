import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Alert, StyleSheet } from "react-native";

import {
  SettingsHeader,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/SettingsUI";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

const supportEmail = "jitendraeditiz@gmail.com";

export default function AboutSettingsScreen() {
  const router = useRouter();

  async function contactSupport() {
    const url = `mailto:${supportEmail}?subject=InvoiceFine%20Support`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Email unavailable", `Contact ${supportEmail}`);
    }
  }

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SettingsHeader
        title="About"
        subtitle="InvoiceFine information, policies and support."
        onBack={() => router.back()}
      />
      <SettingsSection title="APP">
        <SettingsRow
          icon="receipt-outline"
          label="InvoiceFine"
          description="Pocket ERP for Indian Small Business"
          value="1.0.0"
        />
        <SettingsRow
          index={1}
          icon="time-outline"
          label="Version & Changelog"
          description="Review the current release foundation"
          onPress={() =>
            router.push({
              pathname: "/legal/[slug]",
              params: { slug: "changelog" },
            })
          }
        />
      </SettingsSection>
      <SettingsSection title="LEGAL">
        <SettingsRow
          icon="shield-checkmark-outline"
          label="Privacy Policy"
          description="How local business data is handled"
          onPress={() =>
            router.push({
              pathname: "/legal/[slug]",
              params: { slug: "privacy" },
            })
          }
        />
        <SettingsRow
          index={1}
          icon="document-text-outline"
          label="Terms & Conditions"
          description="Rules and responsibilities for using InvoiceFine"
          onPress={() =>
            router.push({
              pathname: "/legal/[slug]",
              params: { slug: "terms" },
            })
          }
        />
        <SettingsRow
          index={2}
          icon="library-outline"
          label="Licenses & Policies"
          description="All legal and data documents"
          onPress={() => router.push("/legal")}
        />
      </SettingsSection>
      <SettingsSection title="SUPPORT">
        <SettingsRow
          icon="mail-outline"
          label="Contact Support"
          description={supportEmail}
          onPress={() => void contactSupport()}
        />
      </SettingsSection>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ content: { gap: 22 } });
