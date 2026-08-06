import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, View } from "react-native";
import {
  SettingsHeader,
  SettingsSection,
} from "@/components/settings/SettingsUI";
import { AppText as Text } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  buildSelectedCsvExport,
  loadSelectedExportCounts,
} from "@/db/repositories/selected-exports";
import { useAppPalette } from "@/hooks/useAppPalette";
import { saveCsvFilesToDirectory, shareCsv } from "@/services/csv-files";
import type {
  ExportCounts,
  ExportDateBounds,
  ExportDateRange,
  SelectedCsvExport,
  SelectedExportKey,
} from "@/types/selected-export";

const emptyCounts: ExportCounts = {
  customers: 0,
  products: 0,
  services: 0,
  expenses: 0,
  payments: 0,
  invoices: 0,
  stock: 0,
};
const options: Array<{
  key: SelectedExportKey;
  label: string;
  description: string;
  icon:
    | "people-outline"
    | "cube-outline"
    | "construct-outline"
    | "wallet-outline"
    | "cash-outline"
    | "document-text-outline"
    | "layers-outline";
}> = [
  {
    key: "customers",
    label: "Customers",
    description: "Contact, GST and addresses",
    icon: "people-outline",
  },
  {
    key: "products",
    label: "Products",
    description: "Pricing, GST and catalog details",
    icon: "cube-outline",
  },
  {
    key: "services",
    label: "Services",
    description: "SAC, pricing model and duration",
    icon: "construct-outline",
  },
  {
    key: "expenses",
    label: "Expenses",
    description: "Category, amount and payee",
    icon: "wallet-outline",
  },
  {
    key: "payments",
    label: "Payments",
    description: "Invoice, method and reference",
    icon: "cash-outline",
  },
  {
    key: "invoices",
    label: "Invoices",
    description: "Status, taxes, paid and outstanding",
    icon: "document-text-outline",
  },
  {
    key: "stock",
    label: "Stock",
    description: "Quantity, thresholds and stock value",
    icon: "layers-outline",
  },
];
const ranges: Array<{ value: ExportDateRange; label: string }> = [
  { value: "all", label: "All time" },
  { value: "this_month", label: "This month" },
  { value: "financial_year", label: "Financial year" },
];
function localDate(date: Date) {
  const y = date.getFullYear(),
    m = String(date.getMonth() + 1).padStart(2, "0"),
    d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function boundsFor(range: ExportDateRange): ExportDateBounds {
  if (range === "all") return { startDate: null, endDate: null };
  const now = new Date();
  if (range === "this_month") {
    return {
      startDate: localDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      endDate: localDate(now),
    };
  }
  const startYear =
    now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return {
    startDate: `${startYear}-04-01`,
    endDate: localDate(now),
  };
}

export default function SelectedExportsScreen() {
  const router = useRouter(),
    p = useAppPalette();
  const [selected, setSelected] = useState<SelectedExportKey[]>([]),
    [range, setRange] = useState<ExportDateRange>("all"),
    [includeArchived, setIncludeArchived] = useState(false),
    [counts, setCounts] = useState<ExportCounts>(emptyCounts),
    [loadingCounts, setLoadingCounts] = useState(true),
    [exporting, setExporting] = useState(false);
  const bounds = useMemo(() => boundsFor(range), [range]);

  useEffect(() => {
    let active = true;
    setLoadingCounts(true);
    void loadSelectedExportCounts(bounds, includeArchived)
      .then((next) => {
        if (active) setCounts(next);
      })
      .catch(() => {
        if (active)
          Alert.alert(
            "Counts unavailable",
            "The export screen could not read local data.",
          );
      })
      .finally(() => {
        if (active) setLoadingCounts(false);
      });
    return () => {
      active = false;
    };
  }, [bounds, includeArchived]);

  function toggle(key: SelectedExportKey) {
    setSelected((current) =>
      current.includes(key)
        ? current.filter((entry) => entry !== key)
        : [...current, key],
    );
  }
  async function build(): Promise<SelectedCsvExport[]> {
    const files: SelectedCsvExport[] = [];
    for (const key of selected) {
      files.push(await buildSelectedCsvExport(key, bounds, includeArchived));
    }
    return files;
  }
  async function saveSelected() {
    if (!selected.length) return;
    setExporting(true);
    try {
      const built = await build(),
        nonEmpty = built.filter((file) => file.rowCount > 0),
        empty = built.filter((file) => file.rowCount === 0);
      if (!nonEmpty.length) {
        Alert.alert(
          "Nothing to export",
          "The selected datasets contain no records for this range.",
        );
        return;
      }
      await saveCsvFilesToDirectory(
        nonEmpty.map((file) => ({ name: file.fileName, text: file.csv })),
      );
      Alert.alert(
        "Export complete",
        `${nonEmpty.length} CSV file${nonEmpty.length === 1 ? "" : "s"} saved.${empty.length ? ` ${empty.map((file) => file.label).join(", ")} skipped because empty.` : ""}`,
      );
    } catch {
      Alert.alert(
        "Export failed",
        "Choose a writable folder and try again. No app data was changed.",
      );
    } finally {
      setExporting(false);
    }
  }
  async function shareOne() {
    const key = selected[0];
    if (selected.length !== 1 || !key) return;
    setExporting(true);
    try {
      const file = await buildSelectedCsvExport(key, bounds, includeArchived);
      if (!file.rowCount) {
        Alert.alert(
          "Nothing to share",
          "This dataset contains no records for the selected range.",
        );
        return;
      }
      await shareCsv(file.fileName, file.csv);
    } catch {
      Alert.alert(
        "Share failed",
        "A compatible sharing app could not be opened.",
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <SettingsHeader
        title="Selected CSV Exports"
        subtitle="Choose only the local records you want to save or share."
        onBack={() => router.back()}
      />
      <SettingsSection
        title="DATE RANGE"
        description="Applies to invoices, payments and expenses."
      >
        <View style={styles.rangeRow}>
          {ranges.map((item) => (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              accessibilityState={{ selected: range === item.value }}
              onPress={() => setRange(item.value)}
              style={[
                styles.rangeChip,
                {
                  backgroundColor:
                    range === item.value ? p.primary : p.surfaceVariant,
                },
              ]}
            >
              <Text
                style={{
                  color: range === item.value ? p.textOnPrimary : p.text,
                  fontWeight: "700",
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {bounds.startDate ? (
          <Text style={[styles.rangeCopy, { color: p.muted }]}>
            {bounds.startDate} to {bounds.endDate}
          </Text>
        ) : null}
      </SettingsSection>
      <SettingsSection title="MASTER DATA">
        <View style={styles.switchRow}>
          <View style={styles.flex}>
            <Text style={{ color: p.text, fontWeight: "700" }}>
              Include archived records
            </Text>
            <Text style={{ color: p.muted }}>
              Customers, products, services and stock only
            </Text>
          </View>
          <Switch
            value={includeArchived}
            onValueChange={setIncludeArchived}
            trackColor={{ false: p.border, true: p.primarySoft }}
            thumbColor={includeArchived ? p.primary : p.muted}
          />
        </View>
      </SettingsSection>
      <SettingsSection
        title="SELECT DATA"
        description={
          loadingCounts
            ? "Counting local records…"
            : `${selected.length} of ${options.length} selected`
        }
      >
        {options.map((item, index) => {
          const checked = selected.includes(item.key);
          return (
            <Pressable
              key={item.key}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              onPress={() => toggle(item.key)}
              style={[
                styles.option,
                index > 0 && { borderTopWidth: 1, borderTopColor: p.border },
                checked && { backgroundColor: p.primarySoft },
              ]}
            >
              <View
                style={[
                  styles.icon,
                  { backgroundColor: checked ? p.primary : p.surfaceVariant },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={checked ? p.textOnPrimary : p.text}
                />
              </View>
              <View style={styles.flex}>
                <Text style={{ color: p.text, fontWeight: "700" }}>
                  {item.label}
                </Text>
                <Text style={{ color: p.muted }}>{item.description}</Text>
              </View>
              <Text style={{ color: p.muted, fontWeight: "700" }}>
                {counts[item.key]}
              </Text>
              <Ionicons
                name={checked ? "checkbox" : "square-outline"}
                size={24}
                color={checked ? p.primary : p.muted}
              />
            </Pressable>
          );
        })}
        <View style={styles.selectActions}>
          <Pressable
            onPress={() => setSelected(options.map((item) => item.key))}
          >
            <Text style={{ color: p.primary, fontWeight: "700" }}>
              Select all
            </Text>
          </Pressable>
          <Pressable onPress={() => setSelected([])}>
            <Text style={{ color: p.primary, fontWeight: "700" }}>Clear</Text>
          </Pressable>
        </View>
      </SettingsSection>
      <Button
        label={`Save ${selected.length || ""} Selected CSV${selected.length === 1 ? "" : "s"}`.replace(
          "  ",
          " ",
        )}
        loading={exporting}
        disabled={!selected.length}
        onPress={() => void saveSelected()}
      />
      <Button
        label="Share Single Selected CSV"
        variant="secondary"
        disabled={selected.length !== 1 || exporting}
        onPress={() => void shareOne()}
      />
      <Text style={[styles.note, { color: p.muted }]}>
        Exports are read-only. They never modify, archive, or delete app data.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18 },
  rangeRow: { flexDirection: "row", gap: 8, padding: 12 },
  rangeChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  rangeCopy: { paddingHorizontal: 14, paddingBottom: 12, textAlign: "center" },
  switchRow: {
    minHeight: 66,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  option: {
    minHeight: 72,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1, gap: 2 },
  selectActions: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  note: { textAlign: "center", paddingHorizontal: 16 },
});
