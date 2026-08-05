import { Ionicons } from "@expo/vector-icons";
import { Component, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  failed: boolean;
  resetKey: number;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { failed: false, resetKey: 0 };

  static getDerivedStateFromError(): Partial<AppErrorBoundaryState> {
    return { failed: true };
  }

  private retry = () => {
    this.setState((current) => ({
      failed: false,
      resetKey: current.resetKey + 1,
    }));
  };

  render() {
    if (this.state.failed) return <AppCrashFallback onRetry={this.retry} />;
    return (
      <View key={this.state.resetKey} style={styles.flex}>
        {this.props.children}
      </View>
    );
  }
}

function AppCrashFallback({ onRetry }: { onRetry: () => void }) {
  const palette = useAppPalette();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={["top", "right", "bottom", "left"]}
    >
      <View style={styles.content} accessibilityLiveRegion="assertive">
        <View
          style={[styles.icon, { backgroundColor: palette.surfaceVariant }]}
        >
          <Ionicons name="warning-outline" size={34} color={palette.warning} />
        </View>
        <Text style={[styles.title, { color: palette.text }]}>
          {strings.runtimeError.title}
        </Text>
        <Text style={[styles.description, { color: palette.muted }]}>
          {strings.runtimeError.description}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: palette.primary },
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>{strings.runtimeError.retry}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[5],
    gap: theme.spacing[3],
  },
  icon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    marginBottom: theme.spacing[1],
  },
  title: {
    textAlign: "center",
    ...theme.typography.screenTitle,
  },
  description: {
    maxWidth: 360,
    textAlign: "center",
    ...theme.typography.secondary,
  },
  button: {
    minWidth: 160,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing[4],
    borderRadius: 14,
    marginTop: theme.spacing[2],
  },
  buttonPressed: { opacity: 0.86 },
  buttonText: {
    color: "#FFFFFF",
    ...theme.typography.button,
  },
});
