import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, type ComponentProps, type ReactNode } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { triggerHaptic, type HapticFeedback } from "@/lib/haptics";
import { useAppPalette } from "@/hooks/useAppPalette";
const ACTION_WIDTH = 82;
type IconName = ComponentProps<typeof Ionicons>["name"];
export type SwipeRowAction = {
  label: string;
  icon: IconName;
  onPress: () => void;
  tone?: "primary" | "danger";
  haptic?: HapticFeedback;
};
export function SwipeActionRow({
  children,
  actions,
  containerStyle,
}: {
  children: ReactNode;
  actions: SwipeRowAction[];
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const palette = useAppPalette(),
    x = useRef(new Animated.Value(0)).current,
    open = useRef(false),
    crossed = useRef(false),
    distance = ACTION_WIDTH * Math.max(actions.length, 1);
  function settle(reveal: boolean) {
    open.current = reveal;
    Animated.spring(x, {
      toValue: reveal ? -distance : 0,
      useNativeDriver: true,
      speed: 24,
      bounciness: 2,
    }).start();
  }
  function run(action: SwipeRowAction) {
    void triggerHaptic(
      action.haptic ?? (action.tone === "danger" ? "warning" : "light"),
    );
    settle(false);
    action.onPress();
  }
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.25,
        onPanResponderMove: (_, g) => {
          const base = open.current ? -distance : 0,
            next = Math.max(-distance, Math.min(0, base + g.dx));
          x.setValue(next);
          const now = next < -distance * 0.4;
          if (now && !crossed.current) void triggerHaptic("selection");
          crossed.current = now;
        },
        onPanResponderRelease: (_, g) => {
          crossed.current = false;
          settle(
            g.vx < -0.35 ||
              (!open.current && g.dx < -distance * 0.34) ||
              (open.current && g.dx < distance * 0.55),
          );
        },
        onPanResponderTerminate: () => {
          crossed.current = false;
          settle(open.current);
        },
      }),
    [distance, x],
  );
  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.actions, { width: distance }]}>
        {actions.map((action, index) => (
          <Pressable
            key={`${action.label}-${index}`}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={() => run(action)}
            style={[
              styles.action,
              {
                width: ACTION_WIDTH,
                backgroundColor:
                  action.tone === "danger" ? palette.danger : palette.primary,
              },
            ]}
          >
            <Ionicons name={action.icon} size={21} color="#FFFFFF" />
            <Text numberOfLines={1} style={styles.actionText}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </Animated.View>
      <Animated.View
        {...pan.panHandlers}
        style={[styles.foreground, { transform: [{ translateX: x }] }]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  container: { overflow: "hidden" },
  actions: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  action: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  foreground: { zIndex: 1 },
});
