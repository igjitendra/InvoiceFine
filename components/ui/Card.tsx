import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { theme } from '@/constants/theme';

type CardProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style, ...viewProps }: CardProps) {
  return (
    <View style={[styles.card, style]} {...viewProps}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.layout.cardPadding,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: theme.layout.borderWidth,
    borderRadius: theme.radii.card,
  },
});
