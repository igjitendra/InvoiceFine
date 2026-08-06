import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import type { ChartPalette } from "@/components/charts/palette";
import { strings } from "@/constants/strings";
export function ReportFilters({
  start,
  end,
  onStartChange,
  onEndChange,
  onApply,
  loading,
  palette,
}: {
  start: string;
  end: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onApply: () => void;
  loading: boolean;
  palette: ChartPalette;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <DateField
          label={strings.expenses.startDate}
          value={start}
          onChange={onStartChange}
          palette={palette}
        />
        <DateField
          label={strings.expenses.endDate}
          value={end}
          onChange={onEndChange}
          palette={palette}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: loading, disabled: loading }}
        disabled={loading}
        onPress={onApply}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: palette.primary },
          pressed && styles.pressed,
          loading && styles.disabled,
        ]}
      >
        <Text style={styles.buttonText}>
          {loading ? strings.common.loading : strings.expenses.apply}
        </Text>
      </Pressable>
    </View>
  );
}
function DateField({
  label,
  value,
  onChange,
  palette,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  palette: ChartPalette;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: palette.muted }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        keyboardType="numbers-and-punctuation"
        placeholder="YYYY-MM-DD"
        placeholderTextColor={palette.muted}
        selectionColor={palette.primary}
        style={[
          styles.input,
          {
            color: palette.text,
            backgroundColor: palette.surfaceVariant,
            borderColor: palette.border,
          },
        ]}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: 16 },
  row: { flexDirection: "row", gap: 10 },
  field: { flex: 1, gap: 7 },
  label: { fontSize: 13, lineHeight: 18, fontWeight: "600" },
  input: {
    minHeight: 54,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderRadius: 14,
    fontSize: 16,
    lineHeight: 22,
  },
  button: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
  },
  pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.6 },
});
