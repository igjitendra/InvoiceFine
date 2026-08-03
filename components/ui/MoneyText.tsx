import {
  StyleSheet,
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { theme } from '@/constants/theme';

type MoneyTextTone = 'default' | 'positive' | 'warning' | 'danger';

const tabularNumerals: NonNullable<TextStyle['fontVariant']> = [
  'tabular-nums',
];

type MoneyTextProps = Omit<TextProps, 'style'> & {
  style?: StyleProp<TextStyle>;
  tone?: MoneyTextTone;
  value: string;
};

export function MoneyText({
  style,
  tone = 'default',
  value,
  ...textProps
}: MoneyTextProps) {
  return (
    <Text style={[styles.base, styles[tone], style]} {...textProps}>
      {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: theme.colors.textPrimary,
    fontVariant: tabularNumerals,
    ...theme.typography.cardValue,
  },
  default: {
    color: theme.colors.textPrimary,
  },
  positive: {
    color: theme.colors.positive,
  },
  warning: {
    color: theme.colors.warning,
  },
  danger: {
    color: theme.colors.danger,
  },
});
