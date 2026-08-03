import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { strings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { formatPaise } from '@/lib/currency';
import type { CatalogItem } from '@/types/catalog';

export function CatalogRow({ item, onPress }: { item: CatalogItem; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.copy}>
        <View style={styles.top}><Text numberOfLines={1} style={styles.name}>{item.name}</Text><Text style={styles.price}>{formatPaise(item.sellingPricePaise)}</Text></View>
        <Text numberOfLines={1} style={styles.secondary}>
          {strings.catalog.types[item.type]}{item.sku ? ` · ${item.sku}` : ''}{item.categoryName ? ` · ${item.categoryName}` : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3], backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border, borderBottomWidth: theme.layout.borderWidth },
  pressed: { backgroundColor: theme.colors.primarySoft }, copy: { flex: 1, gap: theme.spacing[1] },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing[3] },
  name: { flex: 1, color: theme.colors.textPrimary, ...theme.typography.body },
  price: { color: theme.colors.textPrimary, ...theme.typography.body },
  secondary: { color: theme.colors.textSecondary, ...theme.typography.secondary },
});
