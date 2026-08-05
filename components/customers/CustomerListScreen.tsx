import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CustomerRow } from "@/components/customers/CustomerRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { PressableScale } from "@/components/ui/PressableScale";
import { routes } from "@/constants/routes";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
import { useCustomers } from "@/hooks/useCustomers";
import type { Customer } from "@/types/customer";

export function CustomerListScreen() {
  const palette = useAppPalette();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { customers, error, loading, refresh } = useCustomers(search);

  function openCustomer(customer: Customer) {
    router.push({ pathname: "/customer/[id]", params: { id: customer.id } });
  }

  const empty = search.trim()
    ? {
        title: strings.customers.noResultsTitle,
        description: strings.customers.noResultsDescription,
      }
    : {
        title: strings.customers.emptyTitle,
        description: strings.customers.emptyDescription,
      };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: palette.text }]}>
            {strings.customers.title}
          </Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            {strings.ux.customerSubtitle}
          </Text>
        </View>
        <PressableScale
          haptic="medium"
          accessibilityLabel={strings.customers.add}
          accessibilityRole="button"
          onPress={() => router.push(routes.customerNew)}
          style={[styles.addButton, { backgroundColor: palette.primary }]}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </PressableScale>
      </View>
      <View style={styles.search}>
        <Input
          label={strings.customers.searchLabel}
          placeholder={strings.customers.searchPlaceholder}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="words"
          returnKeyType="search"
        />
      </View>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <EmptyState
          title={strings.customers.loadErrorTitle}
          description={strings.customers.loadErrorDescription}
          icon="warning-outline"
          actionLabel={strings.common.retry}
          onAction={refresh}
        />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(customer) => customer.id}
          renderItem={({ item }) => (
            <CustomerRow customer={item} onPress={() => openCustomer(item)} />
          )}
          contentContainerStyle={
            customers.length === 0 ? styles.emptyList : styles.list
          }
          ListEmptyComponent={
            <EmptyState
              title={empty.title}
              description={empty.description}
              icon="people-outline"
            />
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 16,
  },
  title: { ...theme.typography.screenTitle },
  subtitle: { ...theme.typography.caption, marginTop: 2 },
  addButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  search: { paddingHorizontal: 16, paddingBottom: 14 },
  list: { paddingTop: 4, paddingBottom: theme.layout.tabBarHeight + 24 },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: theme.layout.tabBarHeight,
  },
});
