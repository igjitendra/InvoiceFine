import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PressableScale } from "@/components/ui/PressableScale";
import { SwipeActionRow } from "@/components/ui/SwipeActionRow";
import { routes } from "@/constants/routes";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { listInvoiceDrafts } from "@/db/repositories/invoice-drafts";
import { useAppPalette } from "@/hooks/useAppPalette";
import { formatPaise } from "@/lib/currency";
import type { InvoiceDraftListItem } from "@/types/invoice-draft";
export function InvoiceListScreen() {
  const palette = useAppPalette(),
    router = useRouter(),
    [drafts, setDrafts] = useState<InvoiceDraftListItem[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError(false);
      void listInvoiceDrafts()
        .then((rows) => {
          if (active) setDrafts(rows);
        })
        .catch(() => {
          if (active) setError(true);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [attempt]),
  );
  function open(id: string) {
    router.push({ pathname: "/invoice/[id]", params: { id } });
  }
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: palette.background }]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>
          {strings.invoiceDrafts.title}
        </Text>
        <PressableScale
          haptic="medium"
          accessibilityRole="button"
          accessibilityLabel={strings.invoiceDrafts.add}
          onPress={() => router.push(routes.invoiceNew)}
          style={[styles.add, { backgroundColor: palette.primary }]}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </PressableScale>
      </View>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <EmptyState
          title={strings.invoiceDrafts.loadErrorTitle}
          description={strings.invoiceDrafts.loadErrorDescription}
          icon="warning-outline"
          actionLabel={strings.common.retry}
          onAction={() => setAttempt((v) => v + 1)}
        />
      ) : (
        <FlatList
          data={drafts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            drafts.length === 0 ? styles.empty : styles.list
          }
          ListEmptyComponent={
            <EmptyState
              title={strings.invoiceDrafts.emptyTitle}
              description={strings.invoiceDrafts.emptyDescription}
              icon="document-text-outline"
            />
          }
          renderItem={({ item }) => (
            <SwipeActionRow
              actions={[
                {
                  label: strings.ux.open,
                  icon: "open-outline",
                  onPress: () => open(item.id),
                  haptic: "light",
                },
              ]}
            >
              <PressableScale
                haptic="selection"
                accessibilityRole="button"
                accessibilityHint={strings.ux.swipeHint}
                onPress={() => open(item.id)}
                style={[
                  styles.row,
                  {
                    backgroundColor: palette.surface,
                    borderBottomColor: palette.border,
                  },
                ]}
              >
                <View style={styles.copy}>
                  <Text style={[styles.name, { color: palette.text }]}>
                    {item.status === "draft"
                      ? (item.customerName ?? strings.invoiceDrafts.noCustomer)
                      : item.invoiceNumber}
                  </Text>
                  <Text style={[styles.meta, { color: palette.muted }]}>
                    {strings.finalization.status[item.status]} ·{" "}
                    {item.customerName ?? strings.invoiceDrafts.noCustomer} ·{" "}
                    {item.invoiceDate}
                  </Text>
                </View>
                <Text style={[styles.amount, { color: palette.text }]}>
                  {formatPaise(item.totalPaise)}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={palette.muted}
                />
              </PressableScale>
            </SwipeActionRow>
          )}
        />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    minHeight: theme.layout.headerHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.layout.screenHorizontalPadding,
  },
  title: { ...theme.typography.screenTitle },
  add: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  list: { paddingBottom: theme.layout.tabBarHeight + theme.spacing[5] },
  empty: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: theme.layout.tabBarHeight,
  },
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
  },
  copy: { flex: 1, gap: theme.spacing[1] },
  name: { ...theme.typography.body },
  meta: { ...theme.typography.secondary },
  amount: { ...theme.typography.body },
});
