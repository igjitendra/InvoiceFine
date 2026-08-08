import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  SettingsHeader,
  SettingsSection,
} from "@/components/settings/SettingsUI";
import { listCustomers } from "@/db/repositories/customers";
import { importCustomerRows } from "@/db/repositories/customer-import";
import {
  autoMapCustomerColumns,
  customerCsvFields,
  customerCsvLabels,
  customerSampleCsv,
  errorReportCsv,
  exportCustomersCsv,
  parseCustomerCsv,
} from "@/lib/customer-csv";
import {
  chooseCsvFile,
  saveCsvToDownloads,
  shareCsv,
} from "@/services/csv-files";
import { useAppPalette } from "@/hooks/useAppPalette";
import type {
  CustomerCsvField,
  CustomerCsvMapping,
  CustomerImportRow,
  CustomerImportSummary,
  DuplicatePhonePolicy,
} from "@/types/customer-csv";
export default function CustomerCsvScreen() {
  const router = useRouter(),
    p = useAppPalette();
  const [fileName, setFileName] = useState(""),
    [text, setText] = useState(""),
    [headers, setHeaders] = useState<string[]>([]),
    [mapping, setMapping] = useState<CustomerCsvMapping>({}),
    [rows, setRows] = useState<CustomerImportRow[]>([]),
    [policy, setPolicy] = useState<DuplicatePhonePolicy>("skip"),
    [summary, setSummary] = useState<CustomerImportSummary | null>(null),
    [busy, setBusy] = useState(false);
  function validate(next = text, map = mapping) {
    const result = parseCustomerCsv(next, map);
    setHeaders(result.headers);
    setMapping(result.mapping);
    setRows(result.rows);
    setSummary(null);
  }
  async function choose() {
    try {
      const file = await chooseCsvFile();
      if (!file) return;
      setFileName(file.name);
      setText(file.text);
      const parsed = parseCustomerCsv(file.text);
      setHeaders(parsed.headers);
      setMapping(parsed.mapping);
      setRows(parsed.rows);
      setSummary(null);
    } catch (error) {
      Alert.alert(
        "CSV could not be opened",
        error instanceof Error
          ? error.message
          : "Choose a valid UTF-8 CSV file.",
      );
    }
  }
  function cycle(header: string) {
    const current = mapping[header],
      index = current ? customerCsvFields.indexOf(current) : -1,
      next = customerCsvFields[(index + 1) % customerCsvFields.length] ?? null;
    const updated = { ...mapping, [header]: next };
    setMapping(updated);
    validate(text, updated);
  }
  async function run() {
    setBusy(true);
    try {
      setSummary(await importCustomerRows(rows, policy));
    } catch {
      Alert.alert("Import failed", "No customer data was changed.");
    } finally {
      setBusy(false);
    }
  }
  async function exportData(mode: "share" | "save") {
    try {
      const csv = exportCustomersCsv(await listCustomers("")),
        name = `InvoiceFine_Customers_${new Date().toISOString().slice(0, 10)}.csv`;
      if (mode === "share") await shareCsv(name, csv);
      else {
        const saved = await saveCsvToDownloads(name, csv);
        if (!saved) return;
        Alert.alert("Export saved", "The customer CSV was saved successfully.");
      }
    } catch {
      Alert.alert("Export failed", "Try again and choose a writable folder.");
    }
  }
  async function saveSample() {
    try {
      const saved = await saveCsvToDownloads(
        "InvoiceFine_Customers_Sample.csv",
        customerSampleCsv,
      );
      if (saved)
        Alert.alert(
          "Sample saved",
          "The customer CSV sample was saved successfully.",
        );
    } catch {
      Alert.alert(
        "Sample could not be saved",
        "Choose a writable folder and try again.",
      );
    }
  }
  async function shareErrorReport() {
    try {
      await shareCsv(
        "InvoiceFine_Customer_Import_Errors.csv",
        errorReportCsv(rows),
      );
    } catch {
      Alert.alert(
        "Report could not be shared",
        "Try again with a compatible sharing app.",
      );
    }
  }
  const invalid = rows.filter((r) => r.errors.length),
    valid = rows.length - invalid.length,
    hasNameMapping = Object.values(mapping).includes("name");
  return (
    <ScreenContainer contentContainerStyle={s.content}>
      <SettingsHeader
        title="Customer CSV"
        subtitle="Map, validate, preview and import safely."
        onBack={() => router.back()}
      />
      <SettingsSection title="EXPORT">
        <View style={s.actions}>
          <Button
            label="Share Customers CSV"
            onPress={() => void exportData("share")}
          />
          <Button
            label="Download Customers CSV"
            variant="secondary"
            onPress={() => void exportData("save")}
          />
          <Button
            label="Download Sample CSV"
            variant="secondary"
            onPress={() => void saveSample()}
          />
        </View>
      </SettingsSection>
      <SettingsSection title="IMPORT">
        <View style={s.actions}>
          <Button label="Choose CSV File" onPress={() => void choose()} />
          {fileName ? (
            <Text style={{ color: p.text, fontWeight: "700" }}>
              {fileName} · {rows.length} rows
            </Text>
          ) : null}
        </View>
      </SettingsSection>
      {headers.length ? (
        <SettingsSection
          title="SMART MAPPING"
          description="Tap a row to change its destination field."
        >
          {headers.map((h, i) => (
            <Pressable
              key={`${h}-${i}`}
              onPress={() => cycle(h)}
              style={[
                s.mapRow,
                i > 0 && { borderTopWidth: 1, borderTopColor: p.border },
              ]}
            >
              <Text style={{ color: p.text, flex: 1 }}>{h}</Text>
              <Text style={{ color: p.primary, fontWeight: "700" }}>
                {mapping[h]
                  ? customerCsvLabels[mapping[h] as CustomerCsvField]
                  : "Ignore"}
              </Text>
            </Pressable>
          ))}
        </SettingsSection>
      ) : null}
      {rows.length ? (
        <>
          <SettingsSection
            title="VALIDATION"
            description={`Valid ${valid} · Failed ${invalid.length} · Preview first 20`}
          >
            <View style={s.preview}>
              {rows.slice(0, 20).map((r) => (
                <View key={r.rowNumber} style={s.previewRow}>
                  <Text style={{ color: p.text, flex: 1 }}>
                    {r.rowNumber}. {r.values.name || "Unnamed"}
                  </Text>
                  <Text
                    style={{ color: r.errors.length ? p.danger : p.positive }}
                  >
                    {r.errors.length ? r.errors.join("; ") : "Valid"}
                  </Text>
                </View>
              ))}
            </View>
          </SettingsSection>
          <SettingsSection title="DUPLICATE PHONE">
            <View style={s.policy}>
              {(["skip", "update", "create"] as DuplicatePhonePolicy[]).map(
                (v) => (
                  <Pressable
                    key={v}
                    onPress={() => setPolicy(v)}
                    style={[
                      s.chip,
                      {
                        backgroundColor:
                          policy === v ? p.primary : p.surfaceVariant,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: policy === v ? p.textOnPrimary : p.text,
                        fontWeight: "700",
                      }}
                    >
                      {v.toUpperCase()}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
          </SettingsSection>
          <Button
            label={`Import ${valid} Valid Rows`}
            loading={busy}
            disabled={!valid || !hasNameMapping}
            onPress={() => void run()}
          />
          {invalid.length ? (
            <Button
              label="Share Error Report"
              variant="secondary"
              onPress={() => void shareErrorReport()}
            />
          ) : null}
        </>
      ) : null}
      {summary ? (
        <SettingsSection title="SUMMARY">
          <View style={s.actions}>
            <Text style={{ color: p.text }}>Imported: {summary.imported}</Text>
            <Text style={{ color: p.text }}>Updated: {summary.updated}</Text>
            <Text style={{ color: p.text }}>Skipped: {summary.skipped}</Text>
            <Text style={{ color: p.text }}>Failed: {summary.failed}</Text>
          </View>
        </SettingsSection>
      ) : null}
    </ScreenContainer>
  );
}
const s = StyleSheet.create({
  content: { gap: 18 },
  actions: { padding: 14, gap: 10 },
  mapRow: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  preview: { padding: 12, gap: 8 },
  previewRow: { flexDirection: "row", gap: 8 },
  policy: { padding: 12, flexDirection: "row", gap: 8 },
  chip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
