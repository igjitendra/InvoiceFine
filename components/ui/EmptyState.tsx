import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

import { Button } from './Button';

type EmptyStateProps = {
  actionLabel?: string;
  description: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  onAction?: () => void;
  title: string;
};

export function EmptyState({
  actionLabel,
  description,
  icon = 'file-tray-outline',
  onAction,
  title,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={32} color={theme.colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[4],
  },
  iconContainer: {
    width: theme.spacing[7],
    height: theme.spacing[7],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.spacing[5],
  },
  copy: {
    maxWidth: 320,
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  title: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
    ...theme.typography.sectionTitle,
  },
  description: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    ...theme.typography.secondary,
  },
});
