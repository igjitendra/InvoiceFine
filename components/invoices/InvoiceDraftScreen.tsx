import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { showFreePlanLimit } from "@/components/monetization/free-plan-alert";
import { useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette, type AppPalette } from "@/hooks/useAppPalette";
import { useBusinessType } from "@/hooks/useBusinessType";
import { listCatalogItems } from "@/db/repositories/catalog";
import { listCustomers } from "@/db/repositories/customers";
import {
  listFavoriteItemIds,
  setItemFavorite,
} from "@/db/repositories/item-favorites";
import { getInvoiceSettings } from "@/db/repositories/app-settings";
import { finalizeInvoice } from "@/db/repositories/invoice-finalization";
import {
  getInvoiceDraftBusinessStateCode,
  listRecentlySoldItemIds,
  loadInvoiceDraft,
  saveInvoiceDraft,
} from "@/db/repositories/invoice-drafts";
import { formatPaise, paiseToInput, parseRupeesToPaise } from "@/lib/currency";
import { calculateInvoice } from "@/lib/invoice-calculations";
import { parseQuantityToScaled, scaledToInput } from "@/lib/quantity";
import type { CatalogItem, CatalogItemType } from "@/types/catalog";
import type { Customer } from "@/types/customer";
import type { InvoiceDraftLine } from "@/types/invoice-draft";
import type { InvoiceKind } from "@/types/invoice";

import { SelectionModal, type SelectionOption } from "./SelectionModal";
import { InlineCustomerSheet } from "./InlineCustomerSheet";
import { InlineCatalogSheet } from "./InlineCatalogSheet";
import { VerticalDetailsCard } from "./VerticalDetailsCard";
import { getCurrentWorkflow } from "@/db/repositories/vertical-invoice-details";
import {
  createEmptyVerticalDetails,
  type VerticalDetailKey,
  type VerticalInvoiceDetails,
} from "@/types/vertical-workflow";

type DraftFormValues = {
  kind: InvoiceKind;
  invoiceDate: string;
  dueDate: string;
  notes: string;
};

type EditableLine = {
  key: string;
  item: CatalogItem;
  quantity: string;
  unitPrice: string;
  discount: string;
};

let lineSequence = 0;
function nextLineKey(): string {
  lineSequence += 1;
  return `draft-line-${Date.now()}-${lineSequence}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function addLocalDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function toEditableLine(
  line: InvoiceDraftLine,
  items: CatalogItem[],
): EditableLine {
  const matching = items.find((item) => item.id === line.itemId);
  const item: CatalogItem = matching ?? {
    id: line.itemId ?? line.id,
    type: line.itemType,
    name: line.description,
    sku: line.sku,
    barcode: null,
    categoryName: null,
    brand: null,
    unitName: line.unitName,
    purchasePricePaise: line.costPricePaise,
    sellingPricePaise: line.unitPricePaise,
    gstRateBasisPoints: line.gstRateBasisPoints,
    currentStockScaled: 0,
    lowStockThresholdScaled: 0,
    isArchived: false,
    createdAt: "",
    updatedAt: "",
  };
  return {
    key: nextLineKey(),
    item,
    quantity: scaledToInput(line.quantityScaled),
    unitPrice: paiseToInput(line.unitPricePaise),
    discount: paiseToInput(line.discountPaise),
  };
}

export function InvoiceDraftScreen({ draftId }: { draftId?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const palette = useAppPalette();
  const businessType = useBusinessType();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [recentItemIds, setRecentItemIds] = useState<string[]>([]);
  const [favoriteItemIds, setFavoriteItemIds] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [lines, setLines] = useState<EditableLine[]>([]);
  const [verticalDetails, setVerticalDetails] =
    useState<VerticalInvoiceDetails | null>(null);
  const [businessStateCode, setBusinessStateCode] = useState<string | null>(
    null,
  );
  const [customerModal, setCustomerModal] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [inlineCustomer, setInlineCustomer] = useState(false);
  const [inlineCatalogType, setInlineCatalogType] =
    useState<CatalogItemType | null>(null);
  const [inlineName, setInlineName] = useState("");
  const [loading, setLoading] = useState(true);
  const [finalizing, setFinalizing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<DraftFormValues>({
    defaultValues: {
      kind: "non_tax_invoice",
      invoiceDate: today(),
      dueDate: "",
      notes: "",
    },
  });
  const kind = useWatch({ control, name: "kind" });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    void Promise.all([
      listCustomers(""),
      listCatalogItems("", "all"),
      getInvoiceDraftBusinessStateCode(),
      listRecentlySoldItemIds(),
      listFavoriteItemIds(),
      draftId ? loadInvoiceDraft(draftId) : Promise.resolve(null),
      getCurrentWorkflow(),
      getInvoiceSettings(),
    ])
      .then(
        ([
          loadedCustomers,
          loadedItems,
          stateCode,
          loadedRecentItemIds,
          loadedFavoriteItemIds,
          draft,
          workflow,
          invoiceSettings,
        ]) => {
          if (!active) return;
          setCustomers(loadedCustomers);
          setItems(loadedItems);
          setBusinessStateCode(stateCode);
          setRecentItemIds(loadedRecentItemIds);
          setFavoriteItemIds(loadedFavoriteItemIds);
          if (draftId && !draft) {
            setLoadError(true);
            return;
          }
          if (draft) {
            setVerticalDetails(
              draft.verticalDetails ??
                (workflow === "general"
                  ? null
                  : createEmptyVerticalDetails(workflow)),
            );
            setSelectedCustomer(
              loadedCustomers.find(
                (customer) => customer.id === draft.customerId,
              ) ?? null,
            );
            setLines(
              draft.lines.map((line) => toEditableLine(line, loadedItems)),
            );
            reset({
              kind: draft.kind,
              invoiceDate: draft.invoiceDate,
              dueDate: draft.dueDate ?? "",
              notes: draft.notes ?? "",
            });
          } else {
            setVerticalDetails(
              workflow === "general"
                ? null
                : createEmptyVerticalDetails(workflow),
            );
            const invoiceDate = today();
            reset({
              kind: "non_tax_invoice",
              invoiceDate,
              dueDate: addLocalDays(
                invoiceDate,
                invoiceSettings?.defaultDueDays ?? 0,
              ),
              notes: "",
            });
          }
        },
      )
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [draftId, reset]);

  const parsedLines = useMemo(() => {
    const result: InvoiceDraftLine[] = [];
    for (const line of lines) {
      const quantityScaled = parseQuantityToScaled(line.quantity);
      const unitPricePaise = parseRupeesToPaise(line.unitPrice);
      const discountPaise = parseRupeesToPaise(line.discount);
      if (
        quantityScaled === null ||
        quantityScaled <= 0 ||
        unitPricePaise === null ||
        discountPaise === null
      ) {
        return null;
      }
      result.push({
        id: line.key,
        itemId: line.item.id,
        itemType: line.item.type,
        description: line.item.name,
        sku: line.item.sku,
        unitName: line.item.unitName,
        quantityScaled,
        unitPricePaise,
        costPricePaise: line.item.purchasePricePaise,
        discountPaise,
        gstRateBasisPoints: line.item.gstRateBasisPoints,
      });
    }
    return result;
  }, [lines]);

  const calculation = useMemo(() => {
    if (!parsedLines || parsedLines.length === 0) return null;
    try {
      return calculateInvoice({
        kind,
        businessStateCode,
        customerStateCode: selectedCustomer?.stateCode ?? null,
        lines: parsedLines.map((line) => ({
          lineKey: line.id,
          quantityScaled: line.quantityScaled,
          unitPricePaise: line.unitPricePaise,
          discountPaise: line.discountPaise,
          gstRateBasisPoints: line.gstRateBasisPoints,
        })),
      });
    } catch {
      return null;
    }
  }, [businessStateCode, kind, parsedLines, selectedCustomer?.stateCode]);

  function appendItem(item: CatalogItem) {
    setLines((current) => {
      const existing = current.find((line) => line.item.id === item.id);
      if (existing) {
        const quantity = parseQuantityToScaled(existing.quantity) ?? 0;
        return current.map((line) =>
          line.key === existing.key
            ? { ...line, quantity: scaledToInput(quantity + 1000) }
            : line,
        );
      }
      return [
        ...current,
        {
          key: nextLineKey(),
          item,
          quantity: "1",
          unitPrice: paiseToInput(item.sellingPricePaise),
          discount: "0.00",
        },
      ];
    });
    setItemModal(false);
  }

  function addItem(id: string) {
    const item = items.find((candidate) => candidate.id === id);
    if (item) appendItem(item);
  }

  function openCustomerCreate(query: string) {
    setCustomerModal(false);
    setInlineName(query);
    setInlineCustomer(true);
  }

  function openCatalogCreate(type: CatalogItemType, query: string) {
    setItemModal(false);
    setInlineName(query);
    setInlineCatalogType(type);
  }

  function updateLine(
    key: string,
    field: "quantity" | "unitPrice" | "discount",
    value: string,
  ) {
    setLines((current) =>
      current.map((line) =>
        line.key === key ? { ...line, [field]: value } : line,
      ),
    );
  }

  function stepQuantity(key: string, direction: -1 | 1) {
    setLines((current) =>
      current.map((line) => {
        if (line.key !== key) return line;
        const quantity = parseQuantityToScaled(line.quantity) ?? 1000;
        return {
          ...line,
          quantity: scaledToInput(Math.max(1000, quantity + direction * 1000)),
        };
      }),
    );
  }

  function setQuickQuantity(key: string, quantity: number) {
    setLines((current) =>
      current.map((line) =>
        line.key === key ? { ...line, quantity: String(quantity) } : line,
      ),
    );
  }

  function toggleFavorite(id: string, favorite: boolean) {
    setFavoriteItemIds((current) =>
      favorite
        ? [id, ...current.filter((itemId) => itemId !== id)]
        : current.filter((itemId) => itemId !== id),
    );
    void setItemFavorite(id, favorite).catch(() =>
      setFavoriteItemIds((current) =>
        favorite
          ? current.filter((itemId) => itemId !== id)
          : [id, ...current.filter((itemId) => itemId !== id)],
      ),
    );
  }

  const submit = handleSubmit(async (values) => {
    if (
      !validDate(values.invoiceDate) ||
      (values.dueDate.length > 0 && !validDate(values.dueDate))
    ) {
      Alert.alert(
        strings.invoiceDrafts.saveErrorTitle,
        strings.invoiceDrafts.invalidDate,
      );
      return;
    }
    if (!parsedLines || parsedLines.length === 0 || !calculation) {
      Alert.alert(
        strings.invoiceDrafts.saveErrorTitle,
        strings.invoiceDrafts.invalidLines,
      );
      return;
    }
    try {
      const id = await saveInvoiceDraft({
        id: draftId,
        kind: values.kind,
        customerId: selectedCustomer?.id ?? null,
        invoiceDate: values.invoiceDate,
        dueDate: values.dueDate.trim() || null,
        notes: values.notes.trim() || null,
        lines: parsedLines,
        verticalDetails,
      });
      Alert.alert(
        strings.invoiceDrafts.savedTitle,
        strings.invoiceDrafts.savedDescription,
      );
      if (!draftId)
        router.replace({ pathname: "/invoice/[id]", params: { id } });
    } catch (error) {
      if (showFreePlanLimit(error, () => router.push("/upgrade"))) return;
      Alert.alert(
        strings.invoiceDrafts.saveErrorTitle,
        strings.invoiceDrafts.saveErrorDescription,
      );
    }
  });

  function confirmFinalize() {
    if (!draftId || finalizing) return;
    Alert.alert(
      strings.finalization.finalizeTitle,
      strings.finalization.finalizeDescription,
      [
        { text: strings.common.cancel, style: "cancel" },
        {
          text: strings.finalization.finalize,
          onPress: () => {
            setFinalizing(true);
            void finalizeInvoice(draftId)
              .then((result) => {
                Alert.alert(
                  strings.finalization.finalizedTitle,
                  result.invoiceNumber,
                );
                router.replace("/(tabs)/invoices");
              })
              .catch((error: unknown) =>
                Alert.alert(
                  strings.finalization.finalizeErrorTitle,
                  error instanceof Error
                    ? error.message
                    : strings.finalization.finalizeErrorDescription,
                ),
              )
              .finally(() => setFinalizing(false));
          },
        },
      ],
    );
  }

  if (loading)
    return (
      <ScreenContainer scroll={false}>
        <LoadingState />
      </ScreenContainer>
    );
  if (loadError)
    return (
      <ScreenContainer scroll={false}>
        <EmptyState
          title={strings.invoiceDrafts.detailErrorTitle}
          description={strings.invoiceDrafts.detailErrorDescription}
          icon="warning-outline"
        />
      </ScreenContainer>
    );

  const customerOptions: SelectionOption[] = [
    { id: "__none__", title: strings.invoiceDrafts.noCustomer },
    ...customers.map((customer) => ({
      id: customer.id,
      title: customer.name,
      subtitle: customer.phone ?? undefined,
    })),
  ];
  const itemOptions: SelectionOption[] = items
    .filter((item) => businessType === "both" || item.type === businessType)
    .sort((a, b) => {
      const aFavorite = favoriteItemIds.includes(a.id);
      const bFavorite = favoriteItemIds.includes(b.id);
      if (aFavorite !== bFavorite) return aFavorite ? -1 : 1;
      const aIndex = recentItemIds.indexOf(a.id);
      const bIndex = recentItemIds.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    })
    .map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: `${formatPaise(item.sellingPricePaise)} · ${item.type === "product" ? `Stock ${scaledToInput(item.currentStockScaled)}` : strings.catalog.types[item.type]}`,
      keywords: `${item.sku ?? ""} ${item.barcode ?? ""} ${item.brand ?? ""}`,
      recent: recentItemIds.includes(item.id),
      favorite: favoriteItemIds.includes(item.id),
    }));

  return (
    <>
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
            {draftId
              ? strings.invoiceDrafts.editTitle
              : strings.invoiceDrafts.newTitle}
          </Text>
        </View>
        <Card style={styles.card}>
          <Text style={styles.section}>
            {strings.invoiceDrafts.invoiceType}
          </Text>
          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <View style={styles.segment}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => field.onChange("non_tax_invoice")}
                  style={[
                    styles.segmentButton,
                    field.value === "non_tax_invoice" && styles.segmentActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      field.value === "non_tax_invoice" &&
                        styles.segmentTextActive,
                    ]}
                  >
                    {strings.invoiceDrafts.nonTaxInvoice}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => field.onChange("tax_invoice")}
                  style={[
                    styles.segmentButton,
                    field.value === "tax_invoice" && styles.segmentActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      field.value === "tax_invoice" && styles.segmentTextActive,
                    ]}
                  >
                    {strings.invoiceDrafts.taxInvoice}
                  </Text>
                </Pressable>
              </View>
            )}
          />
          {kind === "tax_invoice" ? (
            <Text style={styles.helper}>
              {businessStateCode
                ? selectedCustomer?.stateCode
                  ? ""
                  : strings.invoiceDrafts.taxStateFallback
                : strings.invoiceDrafts.taxBusinessStateRequired}
            </Text>
          ) : null}
          <Controller
            control={control}
            name="invoiceDate"
            render={({ field }) => (
              <Input
                label={strings.invoiceDrafts.invoiceDate}
                helperText={strings.invoiceDrafts.dateHelper}
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="numbers-and-punctuation"
              />
            )}
          />
          <Controller
            control={control}
            name="dueDate"
            render={({ field }) => (
              <Input
                label={strings.invoiceDrafts.dueDate}
                helperText={`${strings.invoiceDrafts.optional} · ${strings.invoiceDrafts.dateHelper}`}
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="numbers-and-punctuation"
              />
            )}
          />
        </Card>
        <Card style={styles.card}>
          <Text style={styles.section}>{strings.invoiceDrafts.customer}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setCustomerModal(true)}
            style={styles.selector}
          >
            <Text style={styles.selectorText}>
              {selectedCustomer?.name ?? strings.invoiceDrafts.noCustomer}
            </Text>
            <Ionicons name="chevron-down" size={20} color={palette.muted} />
          </Pressable>
        </Card>
        <Card style={styles.card}>
          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.section}>
                {strings.invoiceDrafts.lineItems}
              </Text>
              <Text style={styles.itemCount}>
                {lines.length} {strings.ux.selectedItems}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setItemModal(true)}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>
                {strings.invoiceDrafts.addItem}
              </Text>
            </Pressable>
          </View>
          {lines.length === 0 ? (
            <Text style={styles.helper}>{strings.invoiceDrafts.noItems}</Text>
          ) : (
            lines.map((line, index) => (
              <View key={line.key} style={styles.line}>
                <View style={styles.sectionRow}>
                  <Text style={styles.lineTitle}>
                    {index + 1}. {line.item.name}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      setLines((current) =>
                        current.filter(
                          (candidate) => candidate.key !== line.key,
                        ),
                      )
                    }
                  >
                    <Text style={styles.remove}>
                      {strings.invoiceDrafts.removeLine}
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.quantityRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={strings.ux.decreaseQuantity}
                    onPress={() => stepQuantity(line.key, -1)}
                    onLongPress={() => setQuickQuantity(line.key, 1)}
                    style={styles.quantityButton}
                  >
                    <Ionicons name="remove" size={22} color={palette.primary} />
                  </Pressable>
                  <View style={styles.quantityInput}>
                    <Input
                      label={strings.invoiceDrafts.quantity}
                      value={line.quantity}
                      onChangeText={(value) =>
                        updateLine(line.key, "quantity", value)
                      }
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={strings.ux.increaseQuantity}
                    onPress={() => stepQuantity(line.key, 1)}
                    onLongPress={() => setQuickQuantity(line.key, 10)}
                    style={styles.quantityButton}
                  >
                    <Ionicons name="add" size={22} color={palette.primary} />
                  </Pressable>
                </View>
                <View style={styles.quantityPresets}>
                  {[1, 2, 5, 10].map((quantity) => (
                    <Pressable
                      key={quantity}
                      accessibilityRole="button"
                      accessibilityLabel={`${strings.speedTools.setQuantity} ${quantity}`}
                      onPress={() => setQuickQuantity(line.key, quantity)}
                      style={[
                        styles.quantityPreset,
                        line.quantity === String(quantity) &&
                          styles.quantityPresetActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.quantityPresetText,
                          line.quantity === String(quantity) &&
                            styles.quantityPresetTextActive,
                        ]}
                      >
                        ×{quantity}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.lineFields}>
                  <Input
                    label={strings.invoiceDrafts.unitPrice}
                    value={line.unitPrice}
                    onChangeText={(value) =>
                      updateLine(line.key, "unitPrice", value)
                    }
                    keyboardType="decimal-pad"
                  />
                  <Input
                    label={strings.invoiceDrafts.discount}
                    value={line.discount}
                    onChangeText={(value) =>
                      updateLine(line.key, "discount", value)
                    }
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            ))
          )}
        </Card>
        {verticalDetails ? (
          <VerticalDetailsCard
            details={verticalDetails}
            onChange={(key: VerticalDetailKey, value: string) =>
              setVerticalDetails((current) =>
                current ? { ...current, [key]: value } : current,
              )
            }
          />
        ) : null}
        <Card style={styles.card}>
          <Text style={styles.section}>{strings.invoiceDrafts.totals}</Text>
          {calculation ? (
            <View style={styles.totalRows}>
              <TotalRow
                label={strings.invoiceDrafts.subtotal}
                value={calculation.subtotalPaise}
              />
              <TotalRow
                label={strings.invoiceDrafts.totalDiscount}
                value={-calculation.discountPaise}
              />
              {kind === "tax_invoice" ? (
                <TotalRow
                  label={strings.invoiceDrafts.taxable}
                  value={calculation.taxablePaise}
                />
              ) : null}
              {calculation.cgstPaise > 0 ? (
                <TotalRow
                  label={strings.invoiceDrafts.cgst}
                  value={calculation.cgstPaise}
                />
              ) : null}
              {calculation.sgstPaise > 0 ? (
                <TotalRow
                  label={strings.invoiceDrafts.sgst}
                  value={calculation.sgstPaise}
                />
              ) : null}
              {calculation.igstPaise > 0 ? (
                <TotalRow
                  label={strings.invoiceDrafts.igst}
                  value={calculation.igstPaise}
                />
              ) : null}
              <TotalRow
                label={strings.invoiceDrafts.rounding}
                value={calculation.roundingPaise}
              />
              <TotalRow
                label={strings.invoiceDrafts.total}
                value={calculation.totalPaise}
                strong
              />
            </View>
          ) : (
            <Text style={styles.helper}>
              {strings.invoiceDrafts.invalidLines}
            </Text>
          )}
        </Card>
        <Card style={styles.card}>
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <Input
                label={strings.invoiceDrafts.notes}
                helperText={strings.invoiceDrafts.optional}
                value={field.value}
                onChangeText={field.onChange}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </Card>
        {draftId ? (
          <Button
            label={strings.finalization.finalize}
            loading={finalizing}
            onPress={confirmFinalize}
          />
        ) : null}
      </ScreenContainer>
      <View
        style={[
          styles.stickySummary,
          { paddingBottom: Math.max(insets.bottom, theme.spacing[3]) },
        ]}
      >
        <View style={styles.stickyCopy}>
          <Text style={styles.stickyLabel}>
            {lines.length} {strings.speedTools.itemSummary} ·{" "}
            {strings.invoiceDrafts.total}
          </Text>
          <Text style={styles.stickyTotal}>
            {formatPaise(calculation?.totalPaise ?? 0)}
          </Text>
        </View>
        <Button
          label={strings.invoiceDrafts.save}
          loading={isSubmitting}
          onPress={() => void submit()}
        />
      </View>
      <SelectionModal
        visible={customerModal}
        title={strings.invoiceDrafts.selectCustomerTitle}
        options={customerOptions}
        createActions={[
          {
            id: "customer",
            label: (query) =>
              query
                ? `${strings.inlineAdd.createCustomer} “${query}”`
                : strings.inlineAdd.addCustomer,
            onCreate: openCustomerCreate,
          },
        ]}
        onClose={() => setCustomerModal(false)}
        onSelect={(id) => {
          setSelectedCustomer(
            id === "__none__"
              ? null
              : (customers.find((customer) => customer.id === id) ?? null),
          );
          setCustomerModal(false);
        }}
      />
      <SelectionModal
        visible={itemModal}
        title={strings.invoiceDrafts.selectItemTitle}
        searchPlaceholder={strings.ux.searchItems}
        options={itemOptions}
        createActions={[
          ...(businessType !== "service"
            ? [
                {
                  id: "product",
                  label: (query: string) =>
                    query
                      ? `${strings.inlineAdd.createProduct} “${query}”`
                      : strings.inlineAdd.addProduct,
                  onCreate: (query: string) =>
                    openCatalogCreate("product", query),
                },
              ]
            : []),
          ...(businessType !== "product"
            ? [
                {
                  id: "service",
                  label: (query: string) =>
                    query
                      ? `${strings.inlineAdd.createService} “${query}”`
                      : strings.inlineAdd.addService,
                  onCreate: (query: string) =>
                    openCatalogCreate("service", query),
                },
              ]
            : []),
        ]}
        onClose={() => setItemModal(false)}
        onSelect={addItem}
        onToggleFavorite={toggleFavorite}
      />
      <InlineCustomerSheet
        visible={inlineCustomer}
        initialName={inlineName}
        onClose={() => setInlineCustomer(false)}
        onSaved={(customer) => {
          setCustomers((current) =>
            [
              ...current.filter((entry) => entry.id !== customer.id),
              customer,
            ].sort((a, b) => a.name.localeCompare(b.name)),
          );
          setSelectedCustomer(customer);
          setInlineCustomer(false);
        }}
      />
      <InlineCatalogSheet
        visible={inlineCatalogType !== null}
        type={inlineCatalogType ?? "product"}
        initialName={inlineName}
        onClose={() => setInlineCatalogType(null)}
        onSaved={(item) => {
          setItems((current) => [
            ...current.filter((entry) => entry.id !== item.id),
            item,
          ]);
          appendItem(item);
          setInlineCatalogType(null);
        }}
      />
    </>
  );
}

function TotalRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  const palette = useAppPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.totalValue, strong && styles.strong]}>
        {value < 0 ? `-${formatPaise(Math.abs(value))}` : formatPaise(value)}
      </Text>
    </View>
  );
}
function createStyles(palette: AppPalette) {
  return StyleSheet.create({
    content: { gap: theme.spacing[5], paddingBottom: 150 },
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
    section: { color: palette.text, ...theme.typography.sectionTitle },
    sectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing[3],
    },
    segment: { flexDirection: "row", gap: theme.spacing[2] },
    segmentButton: {
      flex: 1,
      minHeight: theme.layout.minimumTouchTarget,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: theme.layout.borderWidth,
      borderColor: palette.border,
      borderRadius: theme.radii.small,
    },
    segmentActive: {
      borderColor: palette.primary,
      backgroundColor: palette.primary,
    },
    segmentText: { color: palette.muted, ...theme.typography.secondary },
    segmentTextActive: { color: palette.textOnPrimary, fontWeight: "700" },
    selector: {
      minHeight: 54,
      backgroundColor: palette.surfaceVariant,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing[3],
      borderWidth: theme.layout.borderWidth,
      borderColor: palette.border,
      borderRadius: theme.radii.small,
    },
    selectorText: { color: palette.text, ...theme.typography.body },
    linkButton: {
      minHeight: theme.layout.minimumTouchTarget,
      justifyContent: "center",
      paddingHorizontal: theme.spacing[3],
      backgroundColor: palette.primarySoft,
      borderRadius: theme.radii.small,
    },
    linkText: { color: palette.primarySoftText, ...theme.typography.label },
    itemCount: { color: palette.muted, ...theme.typography.caption },
    helper: { color: palette.muted, ...theme.typography.secondary },
    line: {
      gap: theme.spacing[3],
      paddingTop: theme.spacing[3],
      borderTopColor: palette.border,
      borderTopWidth: theme.layout.borderWidth,
    },
    lineTitle: { flex: 1, color: palette.text, ...theme.typography.body },
    remove: { color: palette.danger, ...theme.typography.secondary },
    quantityRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: theme.spacing[2],
    },
    quantityButton: {
      width: theme.layout.minimumTouchTarget,
      height: theme.layout.minimumTouchTarget,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: palette.primary,
      borderRadius: theme.radii.small,
      marginBottom: 2,
    },
    quantityInput: { flex: 1 },
    quantityPresets: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    quantityPreset: {
      minWidth: 48,
      minHeight: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceVariant,
    },
    quantityPresetActive: {
      borderColor: palette.primary,
      backgroundColor: palette.primarySoft,
    },
    quantityPresetText: { color: palette.muted, ...theme.typography.label },
    quantityPresetTextActive: { color: palette.primarySoftText },
    stickySummary: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      minHeight: 92,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: palette.surface,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    stickyCopy: { flex: 1 },
    stickyLabel: { color: palette.muted, ...theme.typography.caption },
    stickyTotal: { color: palette.text, ...theme.typography.sectionTitle },
    lineFields: { gap: theme.spacing[3] },
    totalRows: { gap: theme.spacing[2] },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: theme.spacing[4],
    },
    totalLabel: { color: palette.muted, ...theme.typography.secondary },
    totalValue: { color: palette.text, ...theme.typography.secondary },
    strong: { color: palette.text, fontWeight: "700" },
  });
}
