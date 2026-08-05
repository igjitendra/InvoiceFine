import { useRef } from "react";
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { triggerHaptic, type HapticFeedback } from "@/lib/haptics";
type Props = Omit<PressableProps, "style"> & {
  style?: PressableProps["style"];
  wrapperStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: HapticFeedback;
};
export function PressableScale({
  onPress,
  onPressIn,
  onPressOut,
  scaleTo = 0.97,
  style,
  wrapperStyle,
  haptic,
  ...props
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  function move(toValue: number) {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 28,
      bounciness: 4,
    }).start();
  }
  return (
    <Animated.View style={[wrapperStyle, { transform: [{ scale }] }]}>
      <Pressable
        style={style}
        onPress={(event) => {
          if (haptic) void triggerHaptic(haptic);
          onPress?.(event);
        }}
        onPressIn={(event) => {
          move(scaleTo);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          move(1);
          onPressOut?.(event);
        }}
        {...props}
      />
    </Animated.View>
  );
}
