import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import type { DatabaseInitializationStatus } from '@/types/database';

import { Button } from './Button';
import { LoadingState } from './LoadingState';
import { ScreenContainer } from './ScreenContainer';

type DatabaseStartupStateProps = {
  onRetry: () => void;
  status: Exclude<DatabaseInitializationStatus, 'ready'>;
};

export function DatabaseStartupState({
  onRetry,
  status,
}: DatabaseStartupStateProps) {
  if (status === 'loading') {
    return (
      <ScreenContainer scroll={false} contentContainerStyle={styles.centered}>
        <LoadingState label={strings.startup.loadingTitle} />
        <Text style={styles.description}>{strings.startup.loadingDescription}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false} contentContainerStyle={styles.centered}>
      <View style={styles.copy}>
        <Text style={styles.title}>{strings.startup.errorTitle}</Text>
        <Text style={styles.description}>{strings.startup.errorDescription}</Text>
      </View>
      <Button label={strings.common.retry} onPress={onRetry} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[4],
  },
  copy: {
    maxWidth: 360,
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  title: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
    ...theme.typography.sectionTitle,
  },
  description: {
    maxWidth: 360,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    ...theme.typography.secondary,
  },
});
