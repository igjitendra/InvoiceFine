import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  SettingsHeader,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/SettingsUI";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getPremiumOnboardingSettings } from "@/db/repositories/onboarding-settings";
import type { PremiumOnboardingSettings } from "@/types/onboarding";

export default function BusinessSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<PremiumOnboardingSettings | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    void getPremiumOnboardingSettings()
      .then((value) => {
        if (!active) return;
        setSettings(value);
        setFailed(!value);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingState label="Loading business settings…" />;
  if (failed || !settings) {
    return (
      <ScreenContainer scroll={false}>
        <EmptyState
          title="Business profile unavailable"
          description="Complete business setup before editing these settings."
          icon="business-outline"
          actionLabel="Open setup"
          onAction={() => router.push("/onboarding")}
        />
      </ScreenContainer>
    );
  }

  const gstSummary = settings.taxEnabled
    ? `${settings.gstType === "composition" ? "Composition" : "Regular"}${settings.gstin ? ` · ${settings.gstin}` : ""}`
    : "Unregistered";

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SettingsHeader
        title="Business"
        subtitle="Review business identity, GST and invoice branding."
        onBack={() => router.back()}
      />
      <SettingsSection title="PROFILE">
        <SettingsRow
          icon="storefront-outline"
          label={settings.businessName || "Business Profile"}
          description={`${settings.businessCategory} · ${settings.businessType}`}
          value={settings.phone}
        />
        <SettingsRow
          index={1}
          icon="location-outline"
          label="Address"
          description={settings.address || "Not added"}
          value={settings.pincode || undefined}
        />
      </SettingsSection>
      <SettingsSection title="GST & TAX">
        <SettingsRow
          icon="receipt-outline"
          label="GST Registration"
          description={gstSummary}
          value={settings.stateCode || undefined}
        />
        <SettingsRow
          index={1}
          icon="id-card-outline"
          label="PAN"
          description={settings.pan || "Not added"}
        />
      </SettingsSection>
      <SettingsSection title="BRANDING & NUMBERING">
        <SettingsRow
          icon="image-outline"
          label="Logo"
          description={settings.logoUri ? "Configured" : "Not added"}
        />
        <SettingsRow
          index={1}
          icon="create-outline"
          label="Signature"
          description={settings.signatureUri ? "Configured" : "Not added"}
        />
        <SettingsRow
          index={2}
          icon="qr-code-outline"
          label="Payment QR"
          description={settings.paymentQrUri ? "Configured" : "Not added"}
        />
        <SettingsRow
          index={3}
          icon="pricetag-outline"
          label="Prefixes"
          description={`Invoice ${settings.invoicePrefix} · Estimate ${settings.estimatePrefix} · Quotation ${settings.quotationPrefix}`}
        />
      </SettingsSection>
      <View style={styles.action}>
        <Button
          label="Edit Complete Business Profile"
          onPress={() => router.push("/onboarding")}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 22 },
  action: { marginTop: 2 },
});
