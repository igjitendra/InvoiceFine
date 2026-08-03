import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { strings } from '@/constants/strings';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useCustomers } from '@/hooks/useCustomers';
import type { Customer } from '@/types/customer';

import { CustomerRow } from './CustomerRow';

export function CustomerListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { customers, error, loading, refresh } = useCustomers(search);

  function openCustomer(customer: Customer) {
    router.push({ pathname: '/customer/[id]', params: { id: customer.id } });
  }

  const empty = search.trim()
    ? { title: strings.customers.noResultsTitle, description: strings.customers.noResultsDescription }
    : { title: strings.customers.emptyTitle, description: strings.customers.emptyDescription };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>{strings.customers.title}</Text>
        <Pressable
          accessibilityLabel={strings.customers.add}
          accessibilityRole="button"
          onPress={() => router.push(routes.customerNew)}
          style={({ pressed }) => [styles.addButton, pressed && styles.addPressed]}
        >
          <Ionicons name="add" size={24} color={theme.colors.textOnPrimary} />
        </Pressable>
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
          renderItem={({ item }) => <CustomerRow customer={item} onPress={() => openCustomer(item)} />}
          contentContainerStyle={customers.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={<EmptyState title={empty.title} description={empty.description} icon="people-outline" />}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    minHeight: theme.layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenHorizontalPadding,
    gap: theme.spacing[4],
  },
  title: { color: theme.colors.textPrimary, ...theme.typography.screenTitle },
  addButton: {
    width: theme.layout.minimumTouchTarget,
    height: theme.layout.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.small,
  },
  addPressed: { backgroundColor: theme.colors.primaryPressed },
  search: { paddingHorizontal: theme.layout.screenHorizontalPadding, paddingBottom: theme.spacing[3] },
  list: { paddingBottom: theme.layout.tabBarHeight + theme.spacing[5] },
  emptyList: { flexGrow: 1, justifyContent: 'center', paddingBottom: theme.layout.tabBarHeight },
});
