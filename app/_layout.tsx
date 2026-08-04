import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DatabaseStartupState } from '@/components/ui/DatabaseStartupState';
import { theme } from '@/constants/theme';
import { useDatabaseInitialization } from '@/hooks/useDatabaseInitialization';

function RootNavigator() {
  const { retry, status } = useDatabaseInitialization();
  if (status !== 'ready') return <DatabaseStartupState onRetry={retry} status={status} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const dark = useColorScheme() === 'dark';
  const backgroundColor = dark ? '#0F172A' : theme.colors.surface;
  return (
    <SafeAreaProvider style={[styles.provider, { backgroundColor }]}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({ provider: { flex: 1 } });
