import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { AppText as Text } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { theme } from "@/constants/theme";
import { archiveCatalogItem, getCatalogItem } from "@/db/repositories/catalog";
import { loadProductProfile } from "@/db/repositories/product-profile";
import { useAppPalette, type AppPalette } from "@/hooks/useAppPalette";
import { formatPaise } from "@/lib/currency";
import { scaledToInput } from "@/lib/quantity";
import type { CatalogItem } from "@/types/catalog";
import type { ProductProfile } from "@/types/product-profile";
import { CatalogForm } from "./CatalogForm";

export function ProductProfileScreen({ id }: { id: string }) {
  const router = useRouter();
  const p = useAppPalette();
  const styles = createStyles(p);
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [profile, setProfile] = useState<ProductProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError(false);
      void Promise.all([getCatalogItem(id), loadProductProfile(id)])
        .then(([nextItem, nextProfile]) => {
          if (!active) return;
          if (!nextItem || nextItem.type !== "product") throw new Error("Product unavailable");
          setItem(nextItem);
          setProfile(nextProfile);
        })
        .catch(() => active && setError(true))
        .finally(() => active && setLoading(false));
      return () => { active = false; };
    }, [id]),
  );
  if (editing && item) return <CatalogForm item={item} />;
  if (loading && !item)
    return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error || !item || !profile)
    return (
      <ScreenContainer scroll={false}>
        <EmptyState title="Product unavailable" description="This product profile could not be loaded." icon="warning-outline" />
      </ScreenContainer>
    );
  const low = item.currentStockScaled <= item.lowStockThresholdScaled;
  function confirmDelete() {
    Alert.alert(
      "Delete product?",
      "The product will leave the catalog. Existing invoice and stock history will stay safe.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete product",
          style: "destructive",
          onPress: () => void archiveCatalogItem(id)
            .then(() => router.replace("/(tabs)/catalog"))
            .catch((cause: unknown) => Alert.alert("Could not delete product", cause instanceof Error ? cause.message : "Please try again.")),
        },
      ],
    );
  }
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color={p.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Product profile</Text>
        <Pressable onPress={() => setEditing(true)} style={styles.iconButton}>
          <Ionicons name="create-outline" size={22} color={p.primary} />
        </Pressable>
      </View>
      <View style={styles.identity}>
        <View style={styles.avatar}><Ionicons name="cube" size={34} color={p.textOnPrimary} /></View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{[item.sku, item.brand, item.categoryName].filter(Boolean).join(" · ") || "Product"}</Text>
      </View>
      <View style={styles.grid}>
        <Metric label="Current stock" value={`${scaledToInput(item.currentStockScaled)} ${item.unitName ?? ""}`} tone={low ? p.warning : p.positive} />
        <Metric label="Total sold" value={scaledToInput(profile.totalSoldScaled)} tone={p.primary} />
        <Metric label="Sales value" value={formatPaise(profile.totalSalesPaise)} tone={p.positive} />
        <Metric label="Invoices" value={String(profile.saleCount)} tone={p.primary} />
      </View>
      {low ? (
        <Card style={[styles.warning, { borderColor: p.warning }]}>
          <Ionicons name="warning-outline" size={22} color={p.warning} />
          <Text style={[styles.warningText, { color: p.warning }]}>Low/out of stock. Invoice finalization will stop if requested quantity is unavailable.</Text>
        </Card>
      ) : null}
      <Button label="Add new stock" onPress={() => router.push({ pathname: "/catalog-item/[id]/stock", params: { id } })} />
      <Button label="Edit product" variant="secondary" onPress={() => setEditing(true)} />
      <Text style={styles.section}>Sales history</Text>
      <Card style={styles.listCard}>
        {profile.sales.length === 0 ? <Text style={styles.emptyText}>No sales recorded yet.</Text> : profile.sales.map((sale, index) => (
          <Pressable
            key={sale.invoiceId}
            onPress={() => router.push({ pathname: "/invoice/[id]", params: { id: sale.invoiceId } })}
            style={[styles.row, index > 0 && styles.divider]}
          >
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{sale.invoiceNumber}</Text>
              <Text style={styles.meta}>{sale.invoiceDate} · {sale.customerName ?? "Walk-in customer"}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.rowTitle}>{scaledToInput(sale.quantityScaled)} sold</Text>
              <Text style={styles.meta}>{formatPaise(sale.salesPaise)}</Text>
            </View>
          </Pressable>
        ))}
      </Card>
      <Text style={styles.section}>Stock history</Text>
      <Card style={styles.listCard}>
        {profile.movements.length === 0 ? <Text style={styles.emptyText}>No stock movements yet.</Text> : profile.movements.map((movement, index) => (
          <View key={movement.id} style={[styles.row, index > 0 && styles.divider]}>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{movement.reason ?? movement.type.replace("_", " ")}</Text>
              <Text style={styles.meta}>{movement.occurredAt.slice(0, 10)}{movement.invoiceNumber ? ` · ${movement.invoiceNumber}` : ""}</Text>
            </View>
            <Text style={[styles.change, { color: movement.quantityDeltaScaled > 0 ? p.positive : p.danger }]}>
              {movement.quantityDeltaScaled > 0 ? "+" : ""}{scaledToInput(movement.quantityDeltaScaled)}
            </Text>
          </View>
        ))}
      </Card>
      <Button label="Delete product" variant="danger" onPress={confirmDelete} />
    </ScreenContainer>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  const p = useAppPalette();
  return <View style={[metricStyles.card, { backgroundColor: p.surface, borderColor: p.border }]}><View style={[metricStyles.bar, { backgroundColor: tone }]} /><Text style={[metricStyles.label, { color: p.muted }]}>{label}</Text><Text numberOfLines={1} adjustsFontSizeToFit style={[metricStyles.value, { color: p.text }]}>{value}</Text></View>;
}
const metricStyles = StyleSheet.create({ card: { minHeight: 104, flexBasis: "47%", flexGrow: 1, padding: 15, borderWidth: 1, borderRadius: 16, overflow: "hidden" }, bar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 }, label: { ...theme.typography.caption }, value: { ...theme.typography.sectionTitle, marginTop: 8 } });
const createStyles = (p: AppPalette) => StyleSheet.create({
  content: { gap: theme.spacing[4] }, header: { minHeight: theme.layout.headerHeight, flexDirection: "row", alignItems: "center" }, iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" }, headerTitle: { flex: 1, textAlign: "center", color: p.text, ...theme.typography.sectionTitle }, identity: { alignItems: "center", gap: 5 }, avatar: { width: 76, height: 76, borderRadius: 26, backgroundColor: p.primary, alignItems: "center", justifyContent: "center" }, name: { color: p.text, fontSize: 26, lineHeight: 32, fontWeight: "700" }, meta: { color: p.muted, ...theme.typography.caption }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, warning: { flexDirection: "row", gap: 10, alignItems: "center", borderWidth: 1 }, warningText: { flex: 1, ...theme.typography.secondary }, section: { color: p.text, ...theme.typography.sectionTitle }, listCard: { padding: 0, overflow: "hidden" }, row: { minHeight: 70, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }, divider: { borderTopWidth: 1, borderTopColor: p.border }, rowCopy: { flex: 1, gap: 3 }, rowTitle: { color: p.text, ...theme.typography.label }, right: { alignItems: "flex-end", gap: 3 }, change: { ...theme.typography.sectionTitle }, emptyText: { color: p.muted, padding: 16, ...theme.typography.body },
});
