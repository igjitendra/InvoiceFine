import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { AppText as Text } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { theme } from "@/constants/theme";
import { getCatalogItem } from "@/db/repositories/catalog";
import { addProductStock } from "@/db/repositories/product-profile";
import { useAppPalette } from "@/hooks/useAppPalette";
import { parseQuantityToScaled, scaledToInput } from "@/lib/quantity";
import type { CatalogItem } from "@/types/catalog";

export function StockEntryScreen({ id }: { id: string }) {
  const router = useRouter();
  const p = useAppPalette();
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("Purchase / new stock");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    void getCatalogItem(id).then((value) => {
      if (value?.type === "product") setItem(value);
    });
  }, [id]);
  if (!item)
    return (
      <ScreenContainer scroll={false}>
        <LoadingState />
      </ScreenContainer>
    );
  const parsed = parseQuantityToScaled(quantity);
  const valid = parsed !== null && parsed > 0;
  return (
    <ScreenContainer keyboardAware contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={p.text} />
        </Pressable>
        <Text style={[styles.title, { color: p.text }]}>Add stock</Text>
      </View>
      <Card style={styles.card}>
        <Text style={[styles.name, { color: p.text }]}>{item.name}</Text>
        <Text style={[styles.meta, { color: p.muted }]}>
          Current stock: {scaledToInput(item.currentStockScaled)} {item.unitName ?? ""}
        </Text>
      </Card>
      <Card style={styles.card}>
        <Input
          label="Quantity to add"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
          placeholder="0"
          error={quantity.length > 0 && !valid ? "Enter a quantity greater than zero." : undefined}
        />
        <Input
          label="Reason / supplier note"
          value={reason}
          onChangeText={setReason}
          placeholder="Purchase / new stock"
        />
      </Card>
      <Button
        label="Add to stock"
        disabled={!valid}
        loading={saving}
        onPress={() => {
          if (!valid || parsed === null) return;
          setSaving(true);
          void addProductStock(id, parsed, reason)
            .then(() => {
              Alert.alert("Stock updated", `${scaledToInput(parsed)} added to ${item.name}.`);
              router.back();
            })
            .catch((error: unknown) =>
              Alert.alert("Stock could not be added", error instanceof Error ? error.message : "Please try again."),
            )
            .finally(() => setSaving(false));
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.spacing[4] },
  header: { minHeight: theme.layout.headerHeight, flexDirection: "row", alignItems: "center", gap: 12 },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { ...theme.typography.screenTitle },
  card: { gap: theme.spacing[3] },
  name: { ...theme.typography.sectionTitle },
  meta: { ...theme.typography.body },
});
