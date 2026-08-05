import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppErrorBoundary } from "@/components/ui/AppErrorBoundary";
import { DatabaseStartupState } from "@/components/ui/DatabaseStartupState";
import { useAppPalette } from "@/hooks/useAppPalette";
import { useDatabaseInitialization } from "@/hooks/useDatabaseInitialization";

function RootNavigator() {
  const { retry, status } = useDatabaseInitialization();
  if (status !== "ready")
    return <DatabaseStartupState onRetry={retry} status={status} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const palette = useAppPalette();
  const backgroundColor = palette.background;
  return (
    <SafeAreaProvider style={[styles.provider, { backgroundColor }]}>
      <StatusBar style={palette.dark ? "light" : "dark"} />
      <AppErrorBoundary>
        <RootNavigator />
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({ provider: { flex: 1 } });
