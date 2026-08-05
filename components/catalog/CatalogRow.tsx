import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { PressableScale } from "@/components/ui/PressableScale";
import {
  SwipeActionRow,
  type SwipeRowAction,
} from "@/components/ui/SwipeActionRow";
import { useAppPalette } from "@/hooks/useAppPalette";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { formatPaise } from "@/lib/currency";
import { scaledToInput } from "@/lib/quantity";
import type { CatalogItem } from "@/types/catalog";
export function CatalogRow({
  item,
  onPress,
  onArchive,
}: {
  item: CatalogItem;
  onPress: () => void;
  onArchive: () => void;
}) {
  const palette = useAppPalette(),
    isProduct = item.type === "product",
    out = isProduct && item.currentStockScaled <= 0,
    low = isProduct && item.currentStockScaled <= item.lowStockThresholdScaled,
    label = out
      ? strings.ux.outOfStock
      : low
        ? strings.ux.lowStockLabel
        : strings.ux.inStock;
  const actions: SwipeRowAction[] = [
    {
      label: strings.ux.edit,
      icon: "create-outline",
      onPress,
      haptic: "light",
    },
    {
      label: strings.common.archive,
      icon: "archive-outline",
      onPress: onArchive,
      tone: "danger",
      haptic: "warning",
    },
  ];
  return (
    <SwipeActionRow actions={actions} containerStyle={styles.swipe}>
      <PressableScale
        haptic="selection"
        accessibilityRole="button"
        accessibilityHint={strings.ux.swipeHint}
        accessibilityLabel={`${item.name}, ${formatPaise(item.sellingPricePaise)}`}
        onLongPress={onArchive}
        delayLongPress={650}
        onPress={onPress}
        style={[
          styles.card,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View
          style={[
            styles.icon,
            { backgroundColor: isProduct ? palette.surfaceVariant : "#3B2454" },
          ]}
        >
          <Ionicons
            name={isProduct ? "cube" : "construct"}
            size={24}
            color={isProduct ? palette.primary : "#C084FC"}
          />
        </View>
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text
              numberOfLines={1}
              style={[styles.name, { color: palette.text }]}
            >
              {item.name}
            </Text>
            <Text style={[styles.price, { color: palette.text }]}>
              {formatPaise(item.sellingPricePaise)}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={[styles.meta, { color: palette.muted }]}
          >
            {item.brand ? `${item.brand} · ` : ""}
            {item.sku ? `${item.sku} · ` : ""}
            {item.categoryName ?? strings.catalog.types[item.type]}
          </Text>
          <View style={styles.footer}>
            {isProduct ? (
              <View
                style={[
                  styles.stockBadge,
                  {
                    backgroundColor: low
                      ? palette.dark
                        ? "#4A3415"
                        : "#FEF3C7"
                      : palette.dark
                        ? "#153D2B"
                        : "#DCFCE7",
                  },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: low ? palette.warning : palette.positive,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.stockStatus,
                    { color: low ? palette.warning : palette.positive },
                  ]}
                >
                  {label}
                </Text>
                <Text style={[styles.stockValue, { color: palette.muted }]}>
                  {" "}
                  · {scaledToInput(item.currentStockScaled)}{" "}
                  {item.unitName ?? ""}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.serviceBadge,
                  { backgroundColor: palette.dark ? "#3B2454" : "#F3E8FF" },
                ]}
              >
                <Ionicons name="flash-outline" size={14} color="#C084FC" />
                <Text
                  style={[
                    styles.serviceText,
                    { color: palette.dark ? "#E9D5FF" : "#7E22CE" },
                  ]}
                >
                  {strings.catalog.types.service}
                </Text>
              </View>
            )}
            <View style={styles.edit}>
              <Text style={[styles.editText, { color: palette.primary }]}>
                {strings.ux.edit}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={palette.primary}
              />
            </View>
          </View>
        </View>
      </PressableScale>
    </SwipeActionRow>
  );
}
const styles = StyleSheet.create({
  swipe: {
    marginHorizontal: theme.layout.screenHorizontalPadding,
    marginBottom: theme.spacing[3],
    borderRadius: 18,
  },
  card: {
    minHeight: 126,
    padding: theme.spacing[4],
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[3],
    borderWidth: 1,
    borderRadius: 18,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, gap: theme.spacing[2] },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing[3],
  },
  name: { flex: 1, ...theme.typography.sectionTitle },
  price: { ...theme.typography.sectionTitle },
  meta: { ...theme.typography.secondary },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[2],
  },
  stockBadge: {
    minHeight: 28,
    flexShrink: 1,
    paddingHorizontal: theme.spacing[2],
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 99,
  },
  dot: { width: 7, height: 7, borderRadius: 99, marginRight: theme.spacing[1] },
  stockStatus: { ...theme.typography.caption, fontWeight: "700" },
  stockValue: { flexShrink: 1, ...theme.typography.caption },
  serviceBadge: {
    minHeight: 28,
    paddingHorizontal: theme.spacing[2],
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
    borderRadius: 99,
  },
  serviceText: { ...theme.typography.caption, fontWeight: "700" },
  edit: { minHeight: 32, flexDirection: "row", alignItems: "center" },
  editText: { ...theme.typography.label },
});
