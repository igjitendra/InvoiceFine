import { Image, StyleSheet, Text, View } from "react-native";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
import { Button } from "@/components/ui/Button";
type Props = {
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
}: Props) {
  const p = useAppPalette();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: p.text }]}>{label}</Text>
      <Text style={[styles.helper, { color: p.muted }]}>{helperText}</Text>
      {value ? (
        <Image
          source={{ uri: value }}
          style={[
            styles.preview,
            { backgroundColor: p.background, borderColor: p.border },
          ]}
        />
      ) : null}
      <View style={styles.actions}>
        <Button
          label={strings.common.chooseImage}
          onPress={onChoose}
          variant="secondary"
        />
        {value ? (
          <Button
            label={strings.common.remove}
            onPress={onRemove}
            variant="secondary"
          />
        ) : null}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: theme.spacing[2] },
  label: { ...theme.typography.label },
  helper: { ...theme.typography.caption },
  preview: {
    width: 120,
    height: 80,
    resizeMode: "contain",
    borderWidth: theme.layout.borderWidth,
    borderRadius: theme.radii.small,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing[2] },
});
