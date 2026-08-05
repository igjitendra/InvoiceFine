import { forwardRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { theme } from "@/constants/theme";
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
  const p = useAppPalette(),
    support = error ?? helperText;
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: p.text }]}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={accessibilityLabel ?? label}
        placeholderTextColor={p.disabled}
        selectionColor={p.primary}
        style={[
          styles.input,
          {
            color: p.text,
            backgroundColor: p.surfaceVariant,
            borderColor: error ? p.danger : p.borderStrong,
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
  label: { ...theme.typography.label },
  input: {
    minHeight: 54,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
    ...theme.typography.body,
  },
  support: { ...theme.typography.caption },
});
