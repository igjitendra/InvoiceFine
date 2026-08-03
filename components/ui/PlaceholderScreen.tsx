import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

import { Card } from './Card';
import { EmptyState } from './EmptyState';
import { ScreenContainer } from './ScreenContainer';

type PlaceholderScreenProps = {
  description: string;
  emptyTitle: string;
  icon: ComponentProps<typeof EmptyState>['icon'];
  title: string;
};

export function PlaceholderScreen({
  description,
  emptyTitle,
  icon,
  title,
}: PlaceholderScreenProps) {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Card>
        <EmptyState description={description} icon={icon} title={emptyTitle} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing[5],
  },
  header: {
    minHeight: theme.layout.minimumTouchTarget,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    ...theme.typography.screenTitle,
  },
});
