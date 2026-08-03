import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { routes } from '@/constants/routes';
import { strings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { useCatalogItems } from '@/hooks/useCatalogItems';
import type { CatalogFilter, CatalogItem } from '@/types/catalog';
import { CatalogRow } from './CatalogRow';

const filters: CatalogFilter[] = ['all', 'product', 'service'];
export function CatalogListScreen() {
  const router = useRouter(); const [search, setSearch] = useState(''); const [filter, setFilter] = useState<CatalogFilter>('all');
  const { items, loading, error, refresh } = useCatalogItems(search, filter);
  const openItem = (item: CatalogItem) => router.push({ pathname: '/catalog-item/[id]', params: { id: item.id } });
  const empty = search.trim() ? { title: strings.catalog.noResultsTitle, description: strings.catalog.noResultsDescription } : { title: strings.catalog.emptyTitle, description: strings.catalog.emptyDescription };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}><Text style={styles.title}>{strings.catalog.title}</Text><Pressable accessibilityLabel={strings.catalog.add} accessibilityRole="button" onPress={() => router.push(routes.catalogItemNew)} style={({ pressed }) => [styles.add, pressed && styles.addPressed]}><Ionicons name="add" size={24} color={theme.colors.textOnPrimary} /></Pressable></View>
      <View style={styles.controls}>
        <Input label={strings.catalog.searchLabel} placeholder={strings.catalog.searchPlaceholder} value={search} onChangeText={setSearch} returnKeyType="search" />
        <View style={styles.filters}>{filters.map((value) => <Pressable key={value} accessibilityRole="button" onPress={() => setFilter(value)} style={[styles.filter, filter === value && styles.filterActive]}><Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{strings.catalog.filters[value]}</Text></Pressable>)}</View>
      </View>
      {loading ? <LoadingState /> : error ? <EmptyState title={strings.catalog.loadErrorTitle} description={strings.catalog.loadErrorDescription} icon="warning-outline" actionLabel={strings.common.retry} onAction={refresh} /> : (
        <FlatList data={items} keyExtractor={(item) => item.id} renderItem={({ item }) => <CatalogRow item={item} onPress={() => openItem(item)} />} contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list} ListEmptyComponent={<EmptyState title={empty.title} description={empty.description} icon="cube-outline" />} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background }, header: { minHeight: theme.layout.headerHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.layout.screenHorizontalPadding }, title: { color: theme.colors.textPrimary, ...theme.typography.screenTitle },
  add: { width: theme.layout.minimumTouchTarget, height: theme.layout.minimumTouchTarget, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, borderRadius: theme.radii.small }, addPressed: { backgroundColor: theme.colors.primaryPressed },
  controls: { paddingHorizontal: theme.layout.screenHorizontalPadding, paddingBottom: theme.spacing[3], gap: theme.spacing[3] }, filters: { flexDirection: 'row', gap: theme.spacing[2] }, filter: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderWidth: theme.layout.borderWidth, borderColor: theme.colors.border, borderRadius: theme.radii.small, backgroundColor: theme.colors.surface }, filterActive: { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary }, filterText: { color: theme.colors.textSecondary, ...theme.typography.secondary }, filterTextActive: { color: theme.colors.primary, fontWeight: '700' },
  list: { paddingBottom: theme.layout.tabBarHeight + theme.spacing[5] }, emptyList: { flexGrow: 1, justifyContent: 'center', paddingBottom: theme.layout.tabBarHeight },
});
