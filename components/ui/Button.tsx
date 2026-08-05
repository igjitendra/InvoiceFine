import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
type Variant = "primary" | "secondary" | "danger";
type Props = Omit<PressableProps, "children" | "style"> & {
  label: string;
  loading?: boolean;
  variant?: Variant;
};
export function Button({
  disabled,
  label,
  loading = false,
  variant = "primary",
  ...props
}: Props) {
  const p = useAppPalette(),
    off = disabled || loading,
    background =
      variant === "primary"
        ? p.primary
        : variant === "danger"
          ? p.danger
          : p.surface,
    border = variant === "secondary" ? p.borderStrong : background,
    color = variant === "secondary" ? p.primary : p.textOnPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      disabled={off}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background, borderColor: border },
        pressed &&
          !off && {
            backgroundColor:
              variant === "primary"
                ? p.primaryPressed
                : variant === "danger"
                  ? p.dangerPressed
                  : p.primarySoft,
          },
        off && styles.disabled,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[styles.label, { color }]}>{label}</Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    minWidth: 44,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
  },
  disabled: { opacity: 0.52 },
  label: { ...theme.typography.button },
});
