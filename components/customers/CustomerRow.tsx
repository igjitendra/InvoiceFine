import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";

import { PressableScale } from "@/components/ui/PressableScale";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
import type { Customer } from "@/types/customer";

type CustomerRowProps = {
  customer: Customer;
  onPress: () => void;
};

export function CustomerRow({ customer, onPress }: CustomerRowProps) {
  const palette = useAppPalette();
  const secondary = customer.phone ?? customer.email ?? customer.gstin;
  const initial = customer.name.trim().charAt(0).toUpperCase();

  return (
    <PressableScale
      haptic="selection"
      accessibilityRole="button"
      onPress={onPress}
      wrapperStyle={styles.wrapper}
      style={[
        styles.row,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: palette.primarySoft }]}>
        <Text style={[styles.avatarText, { color: palette.primary }]}>
          {initial}
        </Text>
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.name, { color: palette.text }]}>
          {customer.name}
        </Text>
        {secondary ? (
          <Text
            numberOfLines={1}
            style={[styles.secondary, { color: palette.muted }]}
          >
            {secondary}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={palette.muted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 10 },
  row: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
  },
  avatarText: { fontSize: 20, lineHeight: 25, fontWeight: "700" },
  copy: { flex: 1, gap: 3 },
  name: { ...theme.typography.body, fontWeight: "700" },
  secondary: { ...theme.typography.secondary },
});
