import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DatabaseStartupState } from '@/components/ui/DatabaseStartupState';
import { theme } from '@/constants/theme';
import { useDatabaseInitialization } from '@/hooks/useDatabaseInitialization';

function RootNavigator() {
  const { retry, status } = useDatabaseInitialization();

  if (status !== 'ready') {
    return <DatabaseStartupState onRetry={retry} status={status} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider style={styles.provider}>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  provider: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
});
