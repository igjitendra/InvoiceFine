import { Image, StyleSheet, Text, View } from 'react-native';

import { strings } from '@/constants/strings';
import { theme } from '@/constants/theme';

import { Button } from '@/components/ui/Button';

type ImageFieldProps = {
  helperText: string;
  label: string;
  onChoose: () => void;
  onRemove: () => void;
  value: string | null;
};

export function ImageField({
  helperText,
  label,
  onChoose,
  onRemove,
  value,
}: ImageFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.helper}>{helperText}</Text>
      {value ? <Image source={{ uri: value }} style={styles.preview} /> : null}
      <View style={styles.actions}>
        <Button label={strings.common.chooseImage} onPress={onChoose} variant="secondary" />
        {value ? (
          <Button label={strings.common.remove} onPress={onRemove} variant="secondary" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing[2],
  },
  label: {
    color: theme.colors.textPrimary,
    ...theme.typography.label,
  },
  helper: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
  },
  preview: {
    width: 120,
    height: 80,
    resizeMode: 'contain',
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: theme.layout.borderWidth,
    borderRadius: theme.radii.small,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
});
