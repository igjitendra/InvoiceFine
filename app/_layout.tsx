import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppErrorBoundary } from "@/components/ui/AppErrorBoundary";
import { DatabaseStartupState } from "@/components/ui/DatabaseStartupState";
import { AppearanceProvider } from "@/hooks/useAppearance";
import { useAppPalette } from "@/hooks/useAppPalette";
import { useDatabaseInitialization } from "@/hooks/useDatabaseInitialization";

function RootNavigator() {
  const { retry, status } = useDatabaseInitialization();
  if (status !== "ready")
    return <DatabaseStartupState onRetry={retry} status={status} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

function RootContent() {
  const palette = useAppPalette();
  return (
    <SafeAreaProvider
      style={[styles.provider, { backgroundColor: palette.background }]}
    >
      <StatusBar style={palette.dark ? "light" : "dark"} />
      <AppErrorBoundary>
        <RootNavigator />
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <AppearanceProvider>
      <RootContent />
    </AppearanceProvider>
  );
}

const styles = StyleSheet.create({ provider: { flex: 1 } });
