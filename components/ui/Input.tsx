import { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { theme } from '@/constants/theme';

type InputProps = Omit<TextInputProps, 'style'> & {
  error?: string;
  helperText?: string;
  label: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { accessibilityLabel, error, helperText, label, ...textInputProps },
  ref,
) {
  const supportingText = error ?? helperText;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ invalid: Boolean(error) }}
        placeholderTextColor={theme.colors.disabled}
        style={[styles.input, error && styles.inputError]}
        {...textInputProps}
      />
      {supportingText ? (
        <Text style={[styles.supportingText, error && styles.errorText]}>
          {supportingText}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing[2],
  },
  label: {
    color: theme.colors.textPrimary,
    ...theme.typography.label,
  },
  input: {
    minHeight: theme.layout.inputHeight,
    paddingHorizontal: theme.spacing[3],
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
    borderWidth: theme.layout.borderWidth,
    borderRadius: theme.radii.small,
    ...theme.typography.body,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  supportingText: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
  },
  errorText: {
    color: theme.colors.danger,
  },
});
