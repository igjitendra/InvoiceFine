import { forwardRef } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { theme } from "@/constants/theme";
import { useAppearance } from "@/hooks/useAppearance";
import { useAppPalette } from "@/hooks/useAppPalette";
type Props = Omit<TextInputProps, "style"> & {
  error?: string;
  helperText?: string;
  label: string;
};
export const Input = forwardRef<TextInput, Props>(function Input(
  { accessibilityLabel, error, helperText, label, ...props },
  ref,
) {
  const { compactMode, fontScale } = useAppearance();
  const p = useAppPalette(),
    support = error ?? helperText;
  return (
    <View style={[styles.container, compactMode && styles.compactContainer]}>
      <Text style={[styles.label, { color: p.text }]}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={accessibilityLabel ?? label}
        placeholderTextColor={p.disabled}
        selectionColor={p.primary}
        style={[
          styles.input,
          compactMode && styles.compactInput,
          {
            color: p.text,
            backgroundColor: p.surfaceVariant,
            borderColor: error ? p.danger : p.borderStrong,
            fontSize: Math.round(theme.typography.body.fontSize * fontScale),
            lineHeight: Math.round(
              theme.typography.body.lineHeight * fontScale,
            ),
          },
        ]}
        {...props}
      />
      {support ? (
        <Text
          accessibilityLiveRegion={error ? "polite" : undefined}
          style={[styles.support, { color: error ? p.danger : p.muted }]}
        >
          {support}
        </Text>
      ) : null}
    </View>
  );
});
const styles = StyleSheet.create({
  container: { gap: 8 },
  compactContainer: { gap: 5 },
  label: { ...theme.typography.label },
  input: {
    minHeight: 54,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
    ...theme.typography.body,
  },
  support: { ...theme.typography.caption },
  compactInput: { minHeight: 46, paddingHorizontal: 13 },
});
