import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { CatalogSkeleton } from "./CatalogSkeleton";
import { PressableScale } from "@/components/ui/PressableScale";
import { useAppPalette } from "@/hooks/useAppPalette";
import { useBusinessType } from "@/hooks/useBusinessType";
import { routes } from "@/constants/routes";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { archiveCatalogItem } from "@/db/repositories/catalog";
import { useCatalogItems } from "@/hooks/useCatalogItems";
import { triggerHaptic } from "@/lib/haptics";
import type { CatalogFilter, CatalogItem } from "@/types/catalog";
import { CatalogRow } from "./CatalogRow";
const filters: CatalogFilter[] = ["all", "product", "service"];
export function CatalogListScreen() {
  const palette = useAppPalette(),
    businessType = useBusinessType(),
    router = useRouter(),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState<CatalogFilter>("all");
  const { items, loading, error, refresh } = useCatalogItems(search, filter);
  useEffect(() => {
    if (businessType !== "both") setFilter(businessType);
  }, [businessType]);
  const visibleFilters: CatalogFilter[] =
    businessType === "both" ? filters : [businessType];
  const screenTitle =
    businessType === "product"
      ? strings.tabs.products
      : businessType === "service"
        ? strings.tabs.services
        : strings.catalog.title;
  function openItem(item: CatalogItem) {
    router.push({ pathname: "/catalog-item/[id]", params: { id: item.id } });
  }
  function confirmArchive(item: CatalogItem) {
    void triggerHaptic("warning");
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
              .then(() => {
                void triggerHaptic("success");
                refresh();
              })
              .catch(() => {
                void triggerHaptic("error");
                Alert.alert(
                  strings.catalog.messages.archiveErrorTitle,
                  strings.catalog.messages.archiveErrorDescription,
                );
              });
          },
        },
      ],
    );
  }
  const empty = search.trim()
    ? {
        title: strings.catalog.noResultsTitle,
        description: strings.catalog.noResultsDescription,
      }
    : {
        title: strings.catalog.emptyTitle,
        description: strings.catalog.emptyDescription,
      };
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: palette.text }]}>
            {screenTitle}
          </Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            {strings.ux.productCatalog}
          </Text>
        </View>
        <View
          style={[styles.count, { backgroundColor: palette.surfaceVariant }]}
        >
          <Text style={[styles.countValue, { color: palette.primary }]}>
            {items.length}
          </Text>
          <Text style={[styles.countLabel, { color: palette.muted }]}>
            {strings.ux.productsFound}
          </Text>
        </View>
      </View>
      <View style={styles.controls}>
        <Input
          label={strings.catalog.searchLabel}
          placeholder={strings.catalog.searchPlaceholder}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        <View style={styles.filters}>
          {visibleFilters.map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === value }}
              onPress={() => {
                void triggerHaptic("selection");
                setFilter(value);
              }}
              style={[
                styles.filter,
                {
                  backgroundColor:
                    filter === value ? palette.surfaceVariant : palette.surface,
                  borderColor:
                    filter === value ? palette.primary : palette.border,
                },
              ]}
            >
              <Ionicons
                name={
                  value === "all"
                    ? "apps-outline"
                    : value === "product"
                      ? "cube-outline"
                      : "construct-outline"
                }
                size={17}
                color={filter === value ? palette.primary : palette.muted}
              />
              <Text
                style={[
                  styles.filterText,
                  { color: filter === value ? palette.primary : palette.muted },
                  filter === value && styles.filterTextActive,
                ]}
              >
                {strings.catalog.filters[value]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      {loading ? (
        <CatalogSkeleton />
      ) : error ? (
        <EmptyState
          title={strings.catalog.loadErrorTitle}
          description={strings.catalog.loadErrorDescription}
          icon="warning-outline"
          actionLabel={strings.common.retry}
          onAction={refresh}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CatalogRow
              item={item}
              onPress={() => openItem(item)}
              onArchive={() => confirmArchive(item)}
            />
          )}
          contentContainerStyle={
            items.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={
            <EmptyState
              title={empty.title}
              description={empty.description}
              icon="cube-outline"
            />
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
      <PressableScale
        haptic="medium"
        accessibilityLabel={strings.catalog.add}
        accessibilityRole="button"
        onPress={() => router.push(routes.catalogItemNew)}
        wrapperStyle={styles.fabWrapper}
        style={[styles.fab, { backgroundColor: palette.primary }]}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </PressableScale>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.layout.screenHorizontalPadding,
  },
  title: { ...theme.typography.screenTitle },
  subtitle: { ...theme.typography.caption, marginTop: theme.spacing[1] },
  count: {
    minWidth: 60,
    alignItems: "center",
    padding: theme.spacing[2],
    borderRadius: 12,
  },
  countValue: { ...theme.typography.sectionTitle },
  countLabel: { ...theme.typography.caption },
  controls: {
    paddingHorizontal: theme.layout.screenHorizontalPadding,
    paddingBottom: theme.spacing[3],
    gap: theme.spacing[3],
  },
  filters: { flexDirection: "row", gap: theme.spacing[2] },
  filter: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row",
    gap: theme.spacing[1],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
  },
  filterText: { ...theme.typography.secondary },
  filterTextActive: { fontWeight: "700" },
  list: {
    paddingTop: theme.spacing[1],
    paddingBottom: theme.layout.tabBarHeight + 100,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: theme.layout.tabBarHeight,
  },
  fabWrapper: {
    position: "absolute",
    right: theme.spacing[5],
    bottom: theme.layout.tabBarHeight + theme.spacing[4],
  },
  fab: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
