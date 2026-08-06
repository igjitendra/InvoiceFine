import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { createCatalogItem, getCatalogItem } from "@/db/repositories/catalog";
import { useAppPalette } from "@/hooks/useAppPalette";
import { parseRupeesToPaise } from "@/lib/currency";
import { parseQuantityToScaled } from "@/lib/quantity";
import { parsePercentToBasisPoints } from "@/lib/tax";
import {
  professionalCatalogDefaults,
  type CatalogItem,
  type CatalogItemType,
} from "@/types/catalog";

type Props = {
  visible: boolean;
  type: CatalogItemType;
  initialName: string;
  onClose: () => void;
  onSaved: (item: CatalogItem) => void;
};

export function InlineCatalogSheet({
  visible,
  type,
  initialName,
  onClose,
  onSaved,
}: Props) {
  const palette = useAppPalette();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [gst, setGst] = useState("0");
  const [stock, setStock] = useState("0");
  const [duration, setDuration] = useState("0");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(initialName.trim());
    setPrice("");
    setGst("0");
    setStock("0");
    setDuration("0");
    setCategory("");
    setUnit(type === "product" ? "pcs" : "service");
    setErrors({});
  }, [initialName, type, visible]);

  async function save() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required.";
    if (parseRupeesToPaise(price) === null)
      next.price = "Enter a valid selling price.";
    if (parsePercentToBasisPoints(gst) === null)
      next.gst = "Enter GST from 0 to 100.";
    if (type === "product" && parseQuantityToScaled(stock) === null)
      next.stock = "Enter a valid opening stock.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      const id = await createCatalogItem({
        ...professionalCatalogDefaults,
        type,
        name,
        sellingPrice: price,
        purchasePrice: "0",
        gstRate: gst,
        openingStock: type === "product" ? stock : "0",
        serviceDurationMinutes: type === "service" ? duration : "0",
        lowStockThreshold: "0",
        category,
        unit,
        sku: "",
        barcode: "",
        brand: "",
      });
      const item = await getCatalogItem(id);
      if (!item) throw new Error("Created item could not be loaded.");
      onSaved(item);
    } catch {
      Alert.alert(
        type === "product"
          ? strings.inlineAdd.productErrorTitle
          : strings.inlineAdd.serviceErrorTitle,
        strings.inlineAdd.itemErrorDescription,
      );
    } finally {
      setSaving(false);
    }
  }

  const noun = type === "product" ? "product" : "service";
  const title =
    type === "product"
      ? strings.inlineAdd.newProduct
      : strings.inlineAdd.newService;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.overlay} edges={["top", "bottom"]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Close ${noun} form`}
          style={styles.backdrop}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[
              styles.sheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View
              style={[styles.handle, { backgroundColor: palette.borderStrong }]}
            />
            <View style={styles.header}>
              <View
                style={[styles.icon, { backgroundColor: palette.primarySoft }]}
              >
                <Ionicons
                  name={type === "product" ? "cube-outline" : "flash-outline"}
                  size={22}
                  color={palette.primary}
                />
              </View>
              <View style={styles.headerCopy}>
                <Text style={[styles.title, { color: palette.text }]}>
                  {title}
                </Text>
                <Text style={[styles.subtitle, { color: palette.muted }]}>
                  {strings.inlineAdd.itemSubtitle}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={styles.close}
              >
                <Ionicons name="close" size={23} color={palette.text} />
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.form}
            >
              <Input
                label={
                  type === "product"
                    ? strings.inlineAdd.productName
                    : strings.inlineAdd.serviceName
                }
                value={name}
                onChangeText={setName}
                error={errors.name}
                autoCapitalize="words"
              />
              <Input
                label={strings.inlineAdd.sellingPrice}
                value={price}
                onChangeText={setPrice}
                error={errors.price}
                keyboardType="decimal-pad"
              />
              <Input
                label={strings.inlineAdd.gstRate}
                value={gst}
                onChangeText={setGst}
                error={errors.gst}
                keyboardType="decimal-pad"
              />
              {type === "product" ? (
                <Input
                  label={strings.inlineAdd.openingStock}
                  value={stock}
                  onChangeText={setStock}
                  error={errors.stock}
                  keyboardType="decimal-pad"
                />
              ) : (
                <Input
                  label={strings.catalogPro.durationMinutes}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                />
              )}
              <View style={styles.twoColumns}>
                <View style={styles.column}>
                  <Input
                    label={strings.inlineAdd.category}
                    value={category}
                    onChangeText={setCategory}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.column}>
                  <Input
                    label={strings.inlineAdd.unit}
                    value={unit}
                    onChangeText={setUnit}
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <Text style={[styles.helper, { color: palette.muted }]}>
                {type === "service"
                  ? strings.inlineAdd.serviceHelper
                  : strings.inlineAdd.productHelper}
              </Text>
              <Button
                label={strings.inlineAdd.saveAndAdd}
                loading={saving}
                onPress={() => void save()}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    maxHeight: "91%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  handle: {
    width: 42,
    height: 5,
    alignSelf: "center",
    borderRadius: 99,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: { flex: 1 },
  title: { ...theme.typography.sectionTitle },
  subtitle: { ...theme.typography.secondary, marginTop: 2 },
  close: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  form: { gap: 14, paddingBottom: 10 },
  twoColumns: { flexDirection: "row", gap: 10 },
  column: { flex: 1 },
  helper: { ...theme.typography.caption },
});
