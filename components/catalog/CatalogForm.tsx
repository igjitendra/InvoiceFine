import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  type TextInputProps,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ImageField } from "@/components/forms/ImageField";
import { BusinessTemplateFields } from "@/components/catalog/BusinessTemplateFields";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import {
  archiveCatalogItem,
  createCatalogItem,
  updateCatalogItem,
} from "@/db/repositories/catalog";
import {
  deleteCatalogTemplateData,
  loadCatalogTemplateData,
  saveCatalogTemplateData,
} from "@/db/repositories/catalog-template-data";
import { getPremiumOnboardingSettings } from "@/db/repositories/onboarding-settings";
import { useAppPalette, type AppPalette } from "@/hooks/useAppPalette";
import { paiseToInput, parseRupeesToPaise } from "@/lib/currency";
import { parseQuantityToScaled, scaledToInput } from "@/lib/quantity";
import { basisPointsToInput, parsePercentToBasisPoints } from "@/lib/tax";
import { pickBusinessImage } from "@/services/image-picker";
import {
  sanitizeTemplateData,
  templateForCategory,
  type BusinessTemplate,
} from "@/lib/business-template-engine";
import {
  professionalCatalogDefaults,
  type CatalogItem,
  type CatalogItemInput,
  type CatalogItemType,
  type ServicePricingModel,
} from "@/types/catalog";

type TextKey = Exclude<
  keyof CatalogItemInput,
  "type" | "taxInclusive" | "appointmentRequired" | "servicePricingModel"
>;
type FieldOptions = Partial<
  Pick<
    TextInputProps,
    "keyboardType" | "autoCapitalize" | "multiline" | "numberOfLines"
  >
> & { helperText?: string };

const defaults: CatalogItemInput = {
  ...professionalCatalogDefaults,
  type: "product",
  name: "",
  sku: "",
  barcode: "",
  category: "",
  brand: "",
  unit: "pcs",
  purchasePrice: "0.00",
  sellingPrice: "",
  gstRate: "0",
  lowStockThreshold: "0",
};

function valuesFromItem(item: CatalogItem): CatalogItemInput {
  return {
    ...professionalCatalogDefaults,
    type: item.type,
    name: item.name,
    shortName: item.shortName ?? "",
    sku: item.sku ?? "",
    barcode: item.barcode ?? "",
    hsnSacCode: item.hsnSacCode ?? "",
    category: item.categoryName ?? "",
    brand: item.brand ?? "",
    unit: item.unitName ?? "",
    purchasePrice: paiseToInput(item.purchasePricePaise),
    sellingPrice: paiseToInput(item.sellingPricePaise),
    mrp: paiseToInput(item.mrpPaise ?? 0),
    wholesalePrice: paiseToInput(item.wholesalePricePaise ?? 0),
    taxInclusive: item.taxInclusive ?? false,
    gstRate: basisPointsToInput(item.gstRateBasisPoints),
    openingStock: "0",
    lowStockThreshold: scaledToInput(item.lowStockThresholdScaled),
    reorderLevel: scaledToInput(item.reorderLevelScaled ?? 0),
    storageLocation: item.storageLocation ?? "",
    supplier: item.supplier ?? "",
    description: item.description ?? "",
    imageUri: item.imageUri ?? "",
    weight: item.weight ?? "",
    dimensions: item.dimensions ?? "",
    color: item.color ?? "",
    size: item.size ?? "",
    expiryDate: item.expiryDate ?? "",
    batchNumber: item.batchNumber ?? "",
    warranty: item.warranty ?? "",
    manufacturer: item.manufacturer ?? "",
    purchaseAccount: item.purchaseAccount ?? "",
    salesAccount: item.salesAccount ?? "",
    cogsAccount: item.cogsAccount ?? "",
    servicePricingModel: item.servicePricingModel ?? "fixed",
    serviceDurationMinutes: String(item.serviceDurationMinutes ?? 0),
    assignedStaff: item.assignedStaff ?? "",
    appointmentRequired: item.appointmentRequired ?? false,
    warrantyDays: String(item.warrantyDays ?? 0),
    checklist: (item.checklist ?? []).join("\n"),
    internalNotes: item.internalNotes ?? "",
    customerNotes: item.customerNotes ?? "",
  };
}

export function CatalogForm({ item }: { item?: CatalogItem }) {
  const router = useRouter(),
    palette = useAppPalette(),
    styles = createStyles(palette),
    editing = item !== undefined;
  const [values, setValues] = useState<CatalogItemInput>(() =>
    item ? valuesFromItem(item) : defaults,
  );
  const [errors, setErrors] = useState<Partial<Record<TextKey, string>>>({});
  const [advanced, setAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [businessTemplate, setBusinessTemplate] =
    useState<BusinessTemplate | null>(null);
  const [templateData, setTemplateData] = useState<Record<string, string>>(
    item?.templateData ?? {},
  );
  const product = values.type === "product";
  useEffect(() => {
    let active = true;
    void Promise.all([
      getPremiumOnboardingSettings(),
      item ? loadCatalogTemplateData(item.id) : Promise.resolve(null),
    ]).then(([settings, saved]) => {
      if (!active) return;
      const resolved = templateForCategory(settings?.businessCategory ?? "");
      setBusinessTemplate(resolved);
      if (saved && (!resolved || saved.templateId === resolved.id))
        setTemplateData(saved.data);
    });
    return () => {
      active = false;
    };
  }, [item]);
  function setText(key: TextKey, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }
  function field(key: TextKey, label: string, options: FieldOptions = {}) {
    return (
      <Input
        label={label}
        value={values[key]}
        onChangeText={(value) => setText(key, value)}
        error={errors[key]}
        helperText={options.helperText}
        keyboardType={options.keyboardType}
        autoCapitalize={options.autoCapitalize}
        multiline={options.multiline}
        numberOfLines={options.numberOfLines}
      />
    );
  }
  function validate() {
    const next: Partial<Record<TextKey, string>> = {};
    if (!values.name.trim()) next.name = strings.onboarding.validation.required;
    for (const key of [
      "purchasePrice",
      "sellingPrice",
      "mrp",
      "wholesalePrice",
    ] as TextKey[]) {
      if (parseRupeesToPaise(values[key]) === null)
        next[key] = strings.catalog.validation.money;
    }
    if (parsePercentToBasisPoints(values.gstRate) === null)
      next.gstRate = strings.catalog.validation.gstRate;
    for (const key of [
      "openingStock",
      "lowStockThreshold",
      "reorderLevel",
    ] as TextKey[]) {
      if (parseQuantityToScaled(values[key]) === null)
        next[key] = strings.catalog.validation.quantity;
    }
    for (const key of ["serviceDurationMinutes", "warrantyDays"] as TextKey[]) {
      if (!/^\d+$/.test(values[key].trim()))
        next[key] = strings.catalogPro.invalidInteger;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  async function save() {
    if (!validate()) return;
    setSaving(true);
    try {
      const itemId = item
        ? (await updateCatalogItem(item.id, values), item.id)
        : await createCatalogItem(values);
      if (businessTemplate) {
        await saveCatalogTemplateData(
          itemId,
          businessTemplate.id,
          sanitizeTemplateData(businessTemplate, values.type, templateData),
        );
      } else {
        await deleteCatalogTemplateData(itemId);
      }
      router.back();
    } catch {
      Alert.alert(
        editing
          ? strings.catalog.messages.updateErrorTitle
          : strings.catalog.messages.createErrorTitle,
        strings.catalog.messages.saveErrorDescription,
      );
    } finally {
      setSaving(false);
    }
  }
  async function chooseImage() {
    try {
      const uri = await pickBusinessImage({ aspect: [1, 1] });
      if (uri) setText("imageUri", uri);
    } catch {
      Alert.alert(
        strings.onboarding.messages.imageErrorTitle,
        strings.onboarding.messages.imageErrorDescription,
      );
    }
  }
  function confirmArchive() {
    if (!item) return;
    Alert.alert(
      strings.catalog.messages.archiveTitle,
      strings.catalog.messages.archiveDescription,
      [
        { text: strings.common.cancel, style: "cancel" },
        {
          text: strings.common.archive,
          style: "destructive",
          onPress: () => {
            void archiveCatalogItem(item.id)
              .then(() => router.replace("/(tabs)/catalog"))
              .catch(() =>
                Alert.alert(
                  strings.catalog.messages.archiveErrorTitle,
                  strings.catalog.messages.archiveErrorDescription,
                ),
              );
          },
        },
      ],
    );
  }
  return (
    <ScreenContainer keyboardAware contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={24} color={palette.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>
            {editing ? strings.catalog.editTitle : strings.catalog.newTitle}
          </Text>
          <Text style={styles.subtitle}>
            {product
              ? strings.catalogPro.productProfile
              : strings.catalogPro.serviceProfile}
          </Text>
        </View>
      </View>
      <Card style={styles.card}>
        <SectionTitle title={strings.catalogPro.basic} />
        <TypeSelector
          value={values.type}
          disabled={editing}
          onChange={(type) =>
            setValues((current) => ({
              ...current,
              type,
              unit: type === "product" ? "pcs" : "service",
            }))
          }
        />
        {field(
          "name",
          product
            ? strings.catalogPro.productName
            : strings.catalogPro.serviceName,
          { autoCapitalize: "words" },
        )}
        {field("shortName", strings.catalogPro.shortName, {
          autoCapitalize: "words",
        })}
        {field(
          "sku",
          product ? strings.catalog.fields.sku : strings.catalogPro.serviceCode,
          { autoCapitalize: "characters" },
        )}
        {product
          ? field("barcode", strings.catalog.fields.barcode, {
              keyboardType: "number-pad",
            })
          : null}
        {field(
          "hsnSacCode",
          product ? strings.catalogPro.hsn : strings.catalogPro.sac,
          { autoCapitalize: "characters" },
        )}
        {field("category", strings.catalog.fields.category, {
          autoCapitalize: "words",
        })}
        {product
          ? field("brand", strings.catalog.fields.brand, {
              autoCapitalize: "words",
            })
          : null}
        {field("unit", strings.catalog.fields.unit, { autoCapitalize: "none" })}
      </Card>
      <Card style={styles.card}>
        <SectionTitle title={strings.catalog.sections.pricing} />
        {!product ? (
          <PricingModel
            value={values.servicePricingModel}
            onChange={(servicePricingModel) =>
              setValues((current) => ({ ...current, servicePricingModel }))
            }
          />
        ) : null}
        {product
          ? field("purchasePrice", strings.catalog.fields.purchasePrice, {
              keyboardType: "decimal-pad",
            })
          : null}
        {field(
          "sellingPrice",
          product
            ? strings.catalog.fields.sellingPrice
            : strings.catalogPro.serviceRate,
          { keyboardType: "decimal-pad" },
        )}
        {product
          ? field("mrp", strings.catalogPro.mrp, {
              keyboardType: "decimal-pad",
            })
          : null}
        {product
          ? field("wholesalePrice", strings.catalogPro.wholesalePrice, {
              keyboardType: "decimal-pad",
            })
          : null}
        <BooleanRow
          label={strings.catalogPro.taxInclusive}
          value={values.taxInclusive}
          onChange={(taxInclusive) =>
            setValues((current) => ({ ...current, taxInclusive }))
          }
        />
        {field("gstRate", strings.catalog.fields.gstRate, {
          keyboardType: "decimal-pad",
        })}
        {!product
          ? field(
              "serviceDurationMinutes",
              strings.catalogPro.durationMinutes,
              { keyboardType: "number-pad" },
            )
          : null}
      </Card>
      {product ? (
        <Card style={styles.card}>
          <SectionTitle title={strings.catalog.sections.inventory} />
          {!editing ? (
            field("openingStock", strings.catalogPro.openingStock, {
              keyboardType: "decimal-pad",
            })
          ) : (
            <Text style={styles.helper}>
              Current stock: {scaledToInput(item?.currentStockScaled ?? 0)}.
              Adjustments remain stock movements.
            </Text>
          )}
          {field(
            "lowStockThreshold",
            strings.catalog.fields.lowStockThreshold,
            { keyboardType: "decimal-pad" },
          )}
          {field("reorderLevel", strings.catalogPro.reorderLevel, {
            keyboardType: "decimal-pad",
          })}
          {field("storageLocation", strings.catalogPro.location)}
          {field("supplier", strings.catalogPro.supplier, {
            autoCapitalize: "words",
          })}
        </Card>
      ) : null}
      <Card style={styles.card}>
        <SectionTitle
          title={
            product
              ? strings.catalogPro.productDetails
              : strings.catalogPro.serviceDetails
          }
        />
        {field("description", strings.catalogPro.description, {
          multiline: true,
          numberOfLines: 3,
        })}
        <ImageField
          label={strings.catalogPro.image}
          helperText={strings.catalogPro.imageHelp}
          value={values.imageUri || null}
          onChoose={() => void chooseImage()}
          onRemove={() => setText("imageUri", "")}
        />
        {product ? (
          <>
            {field("weight", strings.catalogPro.weight)}
            {field("dimensions", strings.catalogPro.dimensions)}
            {field("color", strings.catalogPro.color)}
            {field("size", strings.catalogPro.size)}
          </>
        ) : (
          <>
            {field("assignedStaff", strings.catalogPro.assignedStaff, {
              autoCapitalize: "words",
            })}
            <BooleanRow
              label={strings.catalogPro.appointmentRequired}
              value={values.appointmentRequired}
              onChange={(appointmentRequired) =>
                setValues((current) => ({ ...current, appointmentRequired }))
              }
            />
            {field("warrantyDays", strings.catalogPro.warrantyDays, {
              keyboardType: "number-pad",
            })}
            {field("checklist", strings.catalogPro.checklist, {
              helperText: strings.catalogPro.checklistHelp,
              multiline: true,
              numberOfLines: 4,
            })}
            {field("customerNotes", strings.catalogPro.customerNotes, {
              multiline: true,
              numberOfLines: 3,
            })}
          </>
        )}
      </Card>
      {businessTemplate ? (
        <BusinessTemplateFields
          template={businessTemplate}
          itemType={values.type}
          value={templateData}
          onChange={setTemplateData}
        />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: advanced }}
        onPress={() => setAdvanced((value) => !value)}
        style={[
          styles.advanced,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.advancedCopy}>
          <Text style={styles.advancedTitle}>
            {advanced
              ? strings.catalogPro.advancedHide
              : strings.catalogPro.advancedShow}
          </Text>
          <Text style={styles.subtitle}>
            {strings.catalogPro.advancedDescription}
          </Text>
        </View>
        <Ionicons
          name={advanced ? "chevron-up" : "chevron-down"}
          size={21}
          color={palette.primary}
        />
      </Pressable>
      {advanced ? (
        <>
          <Card style={styles.card}>
            <SectionTitle title={strings.catalogPro.accounting} />
            {product
              ? field("purchaseAccount", strings.catalogPro.purchaseAccount)
              : null}
            {field("salesAccount", strings.catalogPro.salesAccount)}
            {product
              ? field("cogsAccount", strings.catalogPro.cogsAccount)
              : null}
          </Card>
          {product ? (
            <Card style={styles.card}>
              <SectionTitle title={strings.catalogPro.optional} />
              {field("expiryDate", strings.catalogPro.expiryDate)}
              {field("batchNumber", strings.catalogPro.batchNumber)}
              {field("warranty", strings.catalogPro.warranty)}
              {field("manufacturer", strings.catalogPro.manufacturer, {
                autoCapitalize: "words",
              })}
            </Card>
          ) : (
            <Card style={styles.card}>
              <SectionTitle title={strings.catalogPro.internalNotes} />
              {field("internalNotes", strings.catalogPro.internalNotes, {
                multiline: true,
                numberOfLines: 3,
              })}
            </Card>
          )}
        </>
      ) : null}
      <Button
        label={
          editing
            ? strings.catalog.actions.update
            : strings.catalog.actions.create
        }
        loading={saving}
        onPress={() => void save()}
      />
      {editing ? (
        <Button
          label={strings.catalog.actions.archive}
          variant="danger"
          onPress={confirmArchive}
        />
      ) : null}
    </ScreenContainer>
  );
}
function SectionTitle({ title }: { title: string }) {
  const p = useAppPalette();
  return (
    <Text style={[stylesStatic.sectionTitle, { color: p.text }]}>{title}</Text>
  );
}
function BooleanRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const p = useAppPalette();
  return (
    <View style={stylesStatic.booleanRow}>
      <Text style={[stylesStatic.booleanLabel, { color: p.text }]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: p.borderStrong, true: p.primarySoft }}
        thumbColor={value ? p.primary : p.disabled}
      />
    </View>
  );
}
function TypeSelector({
  value,
  onChange,
  disabled,
}: {
  value: CatalogItemType;
  onChange: (value: CatalogItemType) => void;
  disabled: boolean;
}) {
  const p = useAppPalette();
  return (
    <View style={stylesStatic.typeRow}>
      {(["product", "service"] as const).map((type) => {
        const selected = value === type;
        return (
          <Pressable
            key={type}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled }}
            onPress={() => onChange(type)}
            style={[
              stylesStatic.segment,
              {
                borderColor: selected ? p.primary : p.border,
                backgroundColor: selected ? p.primary : p.surface,
              },
              disabled && stylesStatic.disabled,
            ]}
          >
            <Text
              style={[
                stylesStatic.segmentText,
                { color: selected ? p.textOnPrimary : p.text },
              ]}
            >
              {strings.catalog.types[type]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const pricingModels: ServicePricingModel[] = [
  "fixed",
  "hourly",
  "per_visit",
  "per_km",
  "per_day",
];
function PricingModel({
  value,
  onChange,
}: {
  value: ServicePricingModel;
  onChange: (value: ServicePricingModel) => void;
}) {
  const p = useAppPalette(),
    labels = {
      fixed: strings.catalogPro.fixed,
      hourly: strings.catalogPro.hourly,
      per_visit: strings.catalogPro.perVisit,
      per_km: strings.catalogPro.perKm,
      per_day: strings.catalogPro.perDay,
    };
  return (
    <View style={stylesStatic.wrap}>
      {pricingModels.map((model) => {
        const selected = value === model;
        return (
          <Pressable
            key={model}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(model)}
            style={[
              stylesStatic.pill,
              {
                borderColor: selected ? p.primary : p.border,
                backgroundColor: selected ? p.primary : p.surface,
              },
            ]}
          >
            <Text
              style={[
                stylesStatic.pillText,
                { color: selected ? p.textOnPrimary : p.text },
              ]}
            >
              {labels[model]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const stylesStatic = StyleSheet.create({
  sectionTitle: { ...theme.typography.sectionTitle },
  booleanRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  booleanLabel: { flex: 1, ...theme.typography.body },
  typeRow: { flexDirection: "row", gap: 8 },
  segment: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 14,
  },
  segmentText: { ...theme.typography.label },
  disabled: { opacity: 0.72 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    minHeight: 44,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 99,
  },
  pillText: { ...theme.typography.secondary },
});
const createStyles = (p: AppPalette) =>
  StyleSheet.create({
    content: { gap: 16 },
    header: {
      minHeight: 64,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    back: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCopy: { flex: 1 },
    title: { color: p.text, ...theme.typography.screenTitle },
    subtitle: { color: p.muted, ...theme.typography.secondary, marginTop: 2 },
    card: { gap: 15, borderRadius: 22 },
    helper: { color: p.muted, ...theme.typography.secondary },
    advanced: {
      minHeight: 72,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderRadius: 20,
    },
    advancedCopy: { flex: 1 },
    advancedTitle: { color: p.primarySoftText, ...theme.typography.label },
  });
