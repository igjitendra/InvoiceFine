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
import { importCatalogRows } from "@/db/repositories/catalog-import";
import {
  catalogCsvFields,
  catalogCsvLabels,
  catalogErrorReportCsv,
  fieldsForCatalogType,
  parseCatalogCsv,
  productSampleCsv,
  serviceSampleCsv,
} from "@/lib/catalog-csv";
import {
  chooseCsvFile,
  saveCsvToDownloads,
  shareCsv,
} from "@/services/csv-files";
import { useAppPalette } from "@/hooks/useAppPalette";
import type { CatalogItemType } from "@/types/catalog";
import type {
  CatalogCsvField,
  CatalogCsvMapping,
  CatalogDuplicatePolicy,
  CatalogImportRow,
  CatalogImportSummary,
} from "@/types/catalog-csv";
export function CatalogCsvScreen({ type }: { type: CatalogItemType }) {
  const router = useRouter(),
    p = useAppPalette(),
    title = type === "product" ? "Product CSV" : "Service CSV";
  const [fileName, setFileName] = useState(""),
    [source, setSource] = useState(""),
    [headers, setHeaders] = useState<string[]>([]),
    [mapping, setMapping] = useState<CatalogCsvMapping>({}),
    [rows, setRows] = useState<CatalogImportRow[]>([]),
    [policy, setPolicy] = useState<CatalogDuplicatePolicy>("skip"),
    [summary, setSummary] = useState<CatalogImportSummary | null>(null),
    [busy, setBusy] = useState(false);
  function apply(text: string, map?: CatalogCsvMapping) {
    const result = parseCatalogCsv(text, type, map);
    setSource(text);
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
      apply(file.text);
    } catch {
      Alert.alert("CSV could not be opened", "Choose a valid UTF-8 CSV file.");
    }
  }
  function cycle(header: string) {
    const options: Array<CatalogCsvField | null> = [
        null,
        ...fieldsForCatalogType(type),
      ],
      current = mapping[header] ?? null,
      index = options.indexOf(current),
      next = options[(index + 1) % options.length] ?? null;
    apply(source, { ...mapping, [header]: next });
  }
  async function run() {
    setBusy(true);
    try {
      setSummary(await importCatalogRows(rows, policy));
    } catch {
      Alert.alert(
        "Import failed",
        "The catalog transaction was rolled back. Existing data was not changed.",
      );
    } finally {
      setBusy(false);
    }
  }
  const invalid = rows.filter((r) => r.errors.length),
    valid = rows.length - invalid.length,
    warnings = rows.filter((r) => r.warnings.length);
  const sample = type === "product" ? productSampleCsv : serviceSampleCsv;
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SettingsHeader
        title={title}
        subtitle="Smart mapping, validation and safe duplicate handling."
        onBack={() => router.back()}
      />
      <SettingsSection title="SAMPLE">
        <View style={styles.pad}>
          <Button
            label={`Save ${type} sample CSV`}
            variant="secondary"
            onPress={() =>
              void saveCsvToDownloads(`InvoiceFine_${type}_sample.csv`, sample)
            }
          />
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
          description="Tap a column to cycle through destination fields or Ignore."
        >
          {headers.map((h, i) => (
            <Pressable
              key={`${h}-${i}`}
              onPress={() => cycle(h)}
              style={[
                styles.mapRow,
                i > 0 && { borderTopWidth: 1, borderTopColor: p.border },
              ]}
            >
              <Text style={{ color: p.text, flex: 1 }}>{h}</Text>
              <Text style={{ color: p.primary, fontWeight: "700" }}>
                {mapping[h]
                  ? catalogCsvLabels[mapping[h] as CatalogCsvField]
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
            description={`Valid ${valid} · Failed ${invalid.length} · Warnings ${warnings.length} · Preview first 20`}
          >
            <View style={styles.preview}>
              {rows.slice(0, 20).map((r) => (
                <View key={r.rowNumber} style={styles.previewRow}>
                  <Text style={{ color: p.text, flex: 1 }}>
                    {r.rowNumber}. {r.values.name || "Unnamed"}
                  </Text>
                  <Text
                    style={{
                      color: r.errors.length
                        ? p.danger
                        : r.warnings.length
                          ? p.muted
                          : p.positive,
                      flex: 1,
                      textAlign: "right",
                    }}
                  >
                    {r.errors.join("; ") || r.warnings.join("; ") || "Valid"}
                  </Text>
                </View>
              ))}
            </View>
          </SettingsSection>
          <SettingsSection
            title={
              type === "product" ? "DUPLICATE SKU / BARCODE" : "DUPLICATE SKU"
            }
          >
            <View style={styles.policy}>
              {(["skip", "update", "create"] as CatalogDuplicatePolicy[]).map(
                (v) => (
                  <Pressable
                    key={v}
                    onPress={() => setPolicy(v)}
                    style={[
                      styles.chip,
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
            disabled={!valid || !mapping.name}
            onPress={() => void run()}
          />
          {invalid.length || warnings.length ? (
            <Button
              label="Share Error / Warning Report"
              variant="secondary"
              onPress={() =>
                void shareCsv(
                  `InvoiceFine_${type}_import_report.csv`,
                  catalogErrorReportCsv(rows),
                )
              }
            />
          ) : null}
        </>
      ) : null}
      {summary ? (
        <SettingsSection title="SUMMARY">
          <View style={styles.pad}>
            <Text style={{ color: p.text }}>Imported: {summary.imported}</Text>
            <Text style={{ color: p.text }}>Updated: {summary.updated}</Text>
            <Text style={{ color: p.text }}>Skipped: {summary.skipped}</Text>
            <Text style={{ color: p.text }}>Failed: {summary.failed}</Text>
            {type === "service" ? (
              <Text style={{ color: p.text }}>
                SAC pending classification: {summary.pendingClassification}
              </Text>
            ) : null}
          </View>
        </SettingsSection>
      ) : null}
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  content: { gap: 18 },
  pad: { padding: 14, gap: 10 },
  mapRow: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  preview: { padding: 12, gap: 9 },
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
