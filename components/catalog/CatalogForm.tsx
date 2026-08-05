import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette, type AppPalette } from "@/hooks/useAppPalette";
import {
  archiveCatalogItem,
  createCatalogItem,
  updateCatalogItem,
} from "@/db/repositories/catalog";
import { paiseToInput, parseRupeesToPaise } from "@/lib/currency";
import { parseQuantityToScaled, scaledToInput } from "@/lib/quantity";
import { basisPointsToInput, parsePercentToBasisPoints } from "@/lib/tax";
import { validateRequired } from "@/lib/validation";
import type {
  CatalogItem,
  CatalogItemInput,
  CatalogItemType,
} from "@/types/catalog";

const defaults: CatalogItemInput = {
  type: "product",
  name: "",
  sku: "",
  barcode: "",
  category: "",
  brand: "",
  unit: "",
  purchasePrice: "0.00",
  sellingPrice: "",
  gstRate: "0",
  lowStockThreshold: "0",
};

function valuesFromItem(item: CatalogItem): CatalogItemInput {
  return {
    type: item.type,
    name: item.name,
    sku: item.sku ?? "",
    barcode: item.barcode ?? "",
    category: item.categoryName ?? "",
    brand: item.brand ?? "",
    unit: item.unitName ?? "",
    purchasePrice: paiseToInput(item.purchasePricePaise),
    sellingPrice: paiseToInput(item.sellingPricePaise),
    gstRate: basisPointsToInput(item.gstRateBasisPoints),
    lowStockThreshold: scaledToInput(item.lowStockThresholdScaled),
  };
}

function validateMoney(value: string): true | string {
  return parseRupeesToPaise(value) !== null || strings.catalog.validation.money;
}
function validateGst(value: string): true | string {
  return (
    parsePercentToBasisPoints(value) !== null ||
    strings.catalog.validation.gstRate
  );
}
function validateQuantity(value: string): true | string {
  return (
    parseQuantityToScaled(value) !== null || strings.catalog.validation.quantity
  );
}

function TypeSelector({
  value,
  onChange,
}: {
  value: CatalogItemType;
  onChange: (value: CatalogItemType) => void;
}) {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const values: CatalogItemType[] = ["product", "service"];
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{strings.catalog.fields.type}</Text>
      <View style={styles.typeRow}>
        {values.map((type) => (
          <Pressable
            key={type}
            accessibilityRole="button"
            onPress={() => onChange(type)}
            style={[
              styles.typeButton,
              value === type && styles.typeButtonActive,
            ]}
          >
            <Text
              style={[styles.typeText, value === type && styles.typeTextActive]}
            >
              {strings.catalog.types[type]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function CatalogForm({ item }: { item?: CatalogItem }) {
  const router = useRouter();
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const editing = item !== undefined;
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CatalogItemInput>({
    defaultValues: item ? valuesFromItem(item) : defaults,
    mode: "onBlur",
  });
  const itemType = useWatch({ control, name: "type" });

  const submit = handleSubmit(async (values) => {
    try {
      if (item) {
        await updateCatalogItem(item.id, values);
        Alert.alert(
          strings.catalog.messages.updateSuccessTitle,
          strings.catalog.messages.updateSuccessDescription,
        );
      } else {
        await createCatalogItem(values);
      }
      router.back();
    } catch {
      Alert.alert(
        editing
          ? strings.catalog.messages.updateErrorTitle
          : strings.catalog.messages.createErrorTitle,
        strings.catalog.messages.saveErrorDescription,
      );
    }
  });

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
        <Text style={styles.title}>
          {editing ? strings.catalog.editTitle : strings.catalog.newTitle}
        </Text>
      </View>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>
          {strings.catalog.sections.identity}
        </Text>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <TypeSelector value={field.value} onChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="name"
          rules={{ validate: validateRequired }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.catalog.fields.name}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              autoCapitalize="words"
            />
          )}
        />
        <Controller
          control={control}
          name="sku"
          render={({ field }) => (
            <Input
              label={strings.catalog.fields.sku}
              helperText={strings.catalog.helpers.optional}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              autoCapitalize="characters"
            />
          )}
        />
        <Controller
          control={control}
          name="barcode"
          render={({ field }) => (
            <Input
              label={strings.catalog.fields.barcode}
              helperText={strings.catalog.helpers.optional}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              keyboardType="number-pad"
            />
          )}
        />
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Input
              label={strings.catalog.fields.category}
              helperText={strings.catalog.helpers.optional}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              autoCapitalize="words"
            />
          )}
        />
        <Controller
          control={control}
          name="brand"
          render={({ field }) => (
            <Input
              label={strings.catalog.fields.brand}
              helperText={strings.catalog.helpers.optional}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              autoCapitalize="words"
            />
          )}
        />
        <Controller
          control={control}
          name="unit"
          render={({ field }) => (
            <Input
              label={strings.catalog.fields.unit}
              helperText={strings.catalog.helpers.unit}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              autoCapitalize="none"
            />
          )}
        />
      </Card>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>
          {strings.catalog.sections.pricing}
        </Text>
        <Controller
          control={control}
          name="purchasePrice"
          rules={{ validate: validateMoney }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.catalog.fields.purchasePrice}
              helperText={strings.catalog.helpers.money}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              keyboardType="decimal-pad"
            />
          )}
        />
        <Controller
          control={control}
          name="sellingPrice"
          rules={{ validate: validateMoney }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.catalog.fields.sellingPrice}
              helperText={strings.catalog.helpers.money}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              keyboardType="decimal-pad"
            />
          )}
        />
        <Controller
          control={control}
          name="gstRate"
          rules={{ validate: validateGst }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.catalog.fields.gstRate}
              helperText={strings.catalog.helpers.gstRate}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              keyboardType="decimal-pad"
            />
          )}
        />
      </Card>
      {itemType === "product" ? (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>
            {strings.catalog.sections.inventory}
          </Text>
          <Controller
            control={control}
            name="lowStockThreshold"
            rules={{ validate: validateQuantity }}
            render={({ field, fieldState }) => (
              <Input
                label={strings.catalog.fields.lowStockThreshold}
                helperText={strings.catalog.helpers.threshold}
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                keyboardType="decimal-pad"
              />
            )}
          />
          <Text style={styles.helper}>{strings.catalog.helpers.stock}</Text>
        </Card>
      ) : null}
      <Button
        label={
          editing
            ? strings.catalog.actions.update
            : strings.catalog.actions.create
        }
        loading={isSubmitting}
        onPress={() => void submit()}
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

const createStyles = (palette: AppPalette) =>
  StyleSheet.create({
    content: { gap: theme.spacing[5] },
    header: {
      minHeight: theme.layout.headerHeight,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing[3],
    },
    back: {
      width: theme.layout.minimumTouchTarget,
      height: theme.layout.minimumTouchTarget,
      alignItems: "center",
      justifyContent: "center",
    },
    title: { flex: 1, color: palette.text, ...theme.typography.screenTitle },
    card: { gap: theme.spacing[4] },
    sectionTitle: { color: palette.text, ...theme.typography.sectionTitle },
    fieldGroup: { gap: theme.spacing[2] },
    label: { color: palette.text, ...theme.typography.label },
    typeRow: { flexDirection: "row", gap: theme.spacing[2] },
    typeButton: {
      flex: 1,
      minHeight: theme.layout.minimumTouchTarget,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: theme.layout.borderWidth,
      borderColor: palette.border,
      borderRadius: theme.radii.small,
      backgroundColor: palette.surface,
    },
    typeButtonActive: {
      borderColor: palette.primary,
      backgroundColor: palette.primary,
    },
    typeText: { color: palette.muted, ...theme.typography.body },
    typeTextActive: { color: palette.textOnPrimary, fontWeight: "700" },
    helper: { color: palette.muted, ...theme.typography.secondary },
  });
