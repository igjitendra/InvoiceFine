import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { strings } from '@/constants/strings';
import { theme } from '@/constants/theme';

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = strings.common.loading }: LoadingStateProps) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <ActivityIndicator color={theme.colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[3],
  },
  label: {
    color: theme.colors.textSecondary,
    ...theme.typography.secondary,
  },
});
