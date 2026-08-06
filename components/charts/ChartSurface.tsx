import { useEffect, useRef, type ReactNode } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import type { ChartPalette } from "./palette";
export function ChartSurface({
  title,
  subtitle,
  children,
  palette,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  palette: ChartPalette;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [progress]);
  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  card: { padding: 16, gap: 16, borderWidth: 1, borderRadius: 20 },
  title: { fontSize: 18, lineHeight: 24, fontWeight: "700" },
  subtitle: { fontSize: 12, lineHeight: 16, marginTop: 2 },
});
