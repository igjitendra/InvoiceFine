import { type StyleProp, type TextProps, type TextStyle } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
type Tone = "default" | "positive" | "warning" | "danger";
const nums: NonNullable<TextStyle["fontVariant"]> = ["tabular-nums"];
type Props = Omit<TextProps, "style"> & {
  style?: StyleProp<TextStyle>;
  tone?: Tone;
  value: string;
};
export function MoneyText({ style, tone = "default", value, ...props }: Props) {
  const p = useAppPalette(),
    color =
      tone === "positive"
        ? p.positive
        : tone === "warning"
          ? p.warning
          : tone === "danger"
            ? p.danger
            : p.text;
  return (
    <Text
      style={[
        { color, fontVariant: nums, ...theme.typography.cardValue },
        style,
      ]}
      {...props}
    >
      {value}
    </Text>
  );
}
