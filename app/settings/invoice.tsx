import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import {
  SettingsHeader,
  SettingsRow,
  SettingsSection,
} from "@/components/settings/SettingsUI";
import { AppText as Text } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  getInvoiceSettings,
  saveInvoiceSettings,
} from "@/db/repositories/app-settings";
import { useAppPalette } from "@/hooks/useAppPalette";
import type { InvoicePageSize } from "@/types/business";

const dueOptions = [0, 7, 15, 30] as const;

export default function InvoiceSettingsScreen() {
  const router = useRouter();
  const palette = useAppPalette();
  const [invoicePrefix, setInvoicePrefix] = useState("INV");
  const [pageSize, setPageSize] = useState<InvoicePageSize>("a4");
  const [defaultDueDays, setDefaultDueDays] = useState(0);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void getInvoiceSettings()
      .then((value) => {
        if (!active || !value) {
          if (active) setFailed(true);
          return;
        }
        setInvoicePrefix(value.invoicePrefix);
        setPageSize(value.invoicePageSize);
        setDefaultDueDays(value.defaultDueDays);
        setNextInvoiceNumber(value.nextInvoiceNumber);
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

  async function save() {
    setSaving(true);
    try {
      await saveInvoiceSettings({
        invoicePrefix,
        invoicePageSize: pageSize,
        defaultDueDays,
      });
      Alert.alert(
        "Invoice defaults saved",
        "New invoices will use these defaults.",
      );
    } catch {
      Alert.alert(
        "Could not save invoice defaults",
        "Use a short prefix with letters, numbers, dash, underscore or slash.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading invoice defaults…" />;
  if (failed) {
    return (
      <ScreenContainer scroll={false}>
        <EmptyState
          title="Invoice settings unavailable"
          description="Complete Business Profile before changing invoice defaults."
          icon="document-text-outline"
          actionLabel="Open Business Profile"
          onAction={() => router.push("/onboarding")}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer keyboardAware contentContainerStyle={styles.content}>
      <SettingsHeader
        title="Invoice"
        subtitle="Defaults for numbering, due dates and document output."
        onBack={() => router.back()}
      />

      <SettingsSection title="NUMBERING">
        <View style={styles.field}>
          <Input
            label="Invoice Prefix"
            value={invoicePrefix}
            onChangeText={setInvoicePrefix}
            autoCapitalize="characters"
            maxLength={12}
            helperText={`Next invoice: ${invoicePrefix.trim().toUpperCase() || "INV"}-${nextInvoiceNumber}`}
          />
        </View>
        <SettingsRow
          index={1}
          icon="repeat-outline"
          label="Automatic Invoice Number"
          description="Always enabled in Version 1.0 to prevent duplicate numbers"
          value="ON"
        />
      </SettingsSection>

      <SettingsSection title="PAGE SIZE">
        <View style={styles.choiceGrid}>
          <Choice
            label="A4"
            description="Standard printer"
            selected={pageSize === "a4"}
            onPress={() => setPageSize("a4")}
          />
          <Choice
            label="4 × 6"
            description="Compact invoice"
            selected={pageSize === "4x6"}
            onPress={() => setPageSize("4x6")}
          />
        </View>
      </SettingsSection>

      <SettingsSection title="DEFAULT DUE DAYS">
        <View style={styles.dueGrid}>
          {dueOptions.map((days) => {
            const selected = defaultDueDays === days;
            return (
              <Pressable
                key={days}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setDefaultDueDays(days)}
                style={[
                  styles.dueChoice,
                  {
                    backgroundColor: selected
                      ? palette.primary
                      : palette.surfaceVariant,
                    borderColor: selected ? palette.primary : palette.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dueLabel,
                    { color: selected ? palette.textOnPrimary : palette.text },
                  ]}
                >
                  {days === 0 ? "Due now" : `${days} days`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SettingsSection>

      <SettingsSection title="CALCULATION & DESIGN">
        <SettingsRow
          icon="calculator-outline"
          label="Round Off"
          description="Whole-rupee round off is active in current calculations"
          value="ON"
        />
        <SettingsRow
          index={1}
          icon="color-wand-outline"
          label="Default Template"
          description="Professional responsive invoice renderer"
          value="Modern"
        />
      </SettingsSection>

      <SettingsSection
        title="ADVANCED DOCUMENT DEFAULTS"
        description="Shown now for a stable Settings structure; engines will be added before Version 1.0 release."
      >
        <SettingsRow
          icon="chatbox-ellipses-outline"
          label="Default Notes"
          description="Reusable invoice note"
          badge="PLANNED"
          disabled
        />
        <SettingsRow
          index={1}
          icon="reader-outline"
          label="Terms & Conditions"
          description="Reusable customer terms"
          badge="PLANNED"
          disabled
        />
        <SettingsRow
          index={2}
          icon="water-outline"
          label="Paid / Draft Watermark"
          description="Document status watermark"
          badge="PLANNED"
          disabled
        />
      </SettingsSection>

      <Button
        label="Save Invoice Defaults"
        loading={saving}
        onPress={() => void save()}
      />
    </ScreenContainer>
  );
}

function Choice({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  const palette = useAppPalette();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.choice,
        {
          backgroundColor: selected
            ? palette.primarySoft
            : palette.surfaceVariant,
          borderColor: selected ? palette.primary : palette.border,
        },
      ]}
    >
      <Text
        style={[
          styles.choiceLabel,
          { color: selected ? palette.primary : palette.text },
        ]}
      >
        {label}
      </Text>
      <Text style={[styles.choiceDescription, { color: palette.muted }]}>
        {description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { gap: 22 },
  field: { padding: 14 },
  choiceGrid: { padding: 12, flexDirection: "row", gap: 10 },
  choice: {
    flex: 1,
    minHeight: 78,
    padding: 12,
    borderWidth: 1,
    borderRadius: 16,
    justifyContent: "center",
    gap: 3,
  },
  choiceLabel: { fontSize: 17, lineHeight: 22, fontWeight: "700" },
  choiceDescription: { fontSize: 13, lineHeight: 18 },
  dueGrid: { padding: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dueChoice: {
    minWidth: 72,
    minHeight: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dueLabel: { fontSize: 14, lineHeight: 19, fontWeight: "700" },
});
