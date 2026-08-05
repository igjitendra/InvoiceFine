import {
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
type Props = ViewProps & { style?: StyleProp<ViewStyle> };
export function Card({ children, style, ...props }: Props) {
  const p = useAppPalette();
  return (
    <View
      style={[
        {
          padding: theme.layout.cardPadding,
          backgroundColor: p.surface,
          borderColor: p.border,
          borderWidth: 1,
          borderRadius: theme.radii.card,
        },
        !p.dark && {
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 1,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
