import type { PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/constants/theme";
import { useAppearance } from "@/hooks/useAppearance";
import { useAppPalette } from "@/hooks/useAppPalette";
type Props = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  keyboardAware?: boolean;
  backgroundColor?: string;
}>;
export function ScreenContainer({
  children,
  contentContainerStyle,
  scroll = true,
  keyboardAware = false,
  backgroundColor,
}: Props) {
  const { compactMode } = useAppearance();
  const p = useAppPalette(),
    bg = backgroundColor ?? p.background;
  const content = scroll ? (
    <ScrollView
      style={{ backgroundColor: bg }}
      contentContainerStyle={[
        styles.content,
        compactMode && styles.compactContent,
        contentContainerStyle,
      ]}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.content,
        compactMode && styles.compactContent,
        { backgroundColor: bg },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: bg }]}
      edges={["top", "left", "right"]}
    >
      {keyboardAware ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: theme.layout.contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: theme.layout.tabBarHeight + 24,
  },
  compactContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: theme.layout.tabBarHeight + 16,
  },
});
