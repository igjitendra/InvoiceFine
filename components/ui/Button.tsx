import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

import { theme } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
};

export function Button({
  disabled,
  label,
  loading = false,
  variant = 'primary',
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const indicatorColor =
    variant === 'secondary' ? theme.colors.primary : theme.colors.textOnPrimary;
  const variantStyle =
    variant === 'primary'
      ? styles.primary
      : variant === 'secondary'
        ? styles.secondary
        : styles.danger;
  const pressedStyle =
    variant === 'primary'
      ? styles.primaryPressed
      : variant === 'secondary'
        ? styles.secondaryPressed
        : styles.dangerPressed;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        pressed && !isDisabled && pressedStyle,
        isDisabled && styles.disabled,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <Text style={[styles.label, variant === 'secondary' && styles.secondaryLabel]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: theme.layout.buttonHeight,
    minWidth: theme.layout.minimumTouchTarget,
    paddingHorizontal: theme.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.small,
    borderWidth: theme.layout.borderWidth,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  primaryPressed: {
    backgroundColor: theme.colors.primaryPressed,
    borderColor: theme.colors.primaryPressed,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderStrong,
  },
  secondaryPressed: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  danger: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
  },
  dangerPressed: {
    backgroundColor: theme.colors.dangerPressed,
    borderColor: theme.colors.dangerPressed,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    color: theme.colors.textOnPrimary,
    ...theme.typography.button,
  },
  secondaryLabel: {
    color: theme.colors.primary,
  },
});
