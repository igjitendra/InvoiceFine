import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useAppPalette } from "@/hooks/useAppPalette";
export function SkeletonPulse({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useRef(new Animated.Value(0.48)).current,
    [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    if (reduced) {
      opacity.setValue(0.68);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.42,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduced]);
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[style, { opacity }]}
    >
      {children}
    </Animated.View>
  );
}
export function SkeletonBlock({
  height,
  width = "100%",
  radius = 14,
  style,
}: {
  height: number;
  width?: ViewStyle["width"];
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const p = useAppPalette();
  return (
    <View
      style={[
        styles.block,
        {
          height,
          width,
          borderRadius: radius,
          backgroundColor: p.surfaceVariant,
        },
        style,
      ]}
    />
  );
}
const styles = StyleSheet.create({ block: { overflow: "hidden" } });
