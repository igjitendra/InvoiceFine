import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { Customer } from '@/types/customer';

type CustomerRowProps = {
  customer: Customer;
  onPress: () => void;
};

export function CustomerRow({ customer, onPress }: CustomerRowProps) {
  const secondary = customer.phone ?? customer.email ?? customer.gstin;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.name}>{customer.name}</Text>
        {secondary ? <Text numberOfLines={1} style={styles.secondary}>{secondary}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: theme.layout.borderWidth,
  },
  pressed: { backgroundColor: theme.colors.primarySoft },
  copy: { flex: 1, gap: theme.spacing[1] },
  name: { color: theme.colors.textPrimary, ...theme.typography.body },
  secondary: { color: theme.colors.textSecondary, ...theme.typography.secondary },
});
