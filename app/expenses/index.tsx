import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
import { listExpenses } from "@/db/repositories/expenses";
import { formatPaise } from "@/lib/currency";
import type { Expense } from "@/types/expense";
export default function Screen() {
  const router = useRouter(),
    p = useAppPalette(),
    [items, setItems] = useState<Expense[]>([]);
  useFocusEffect(
    useCallback(() => {
      void listExpenses().then(setItems);
    }, []),
  );
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: p.text }]}>
          {strings.expenses.title}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/expenses/new")}
        >
          <Text style={[styles.link, { color: p.primary }]}>
            {strings.expenses.add}
          </Text>
        </Pressable>
      </View>
      {items.length ? (
        items.map((x) => (
          <View
            key={x.id}
            style={[
              styles.row,
              { backgroundColor: p.surface, borderColor: p.border },
            ]}
          >
            <View style={styles.copy}>
              <Text style={[styles.name, { color: p.text }]}>
                {x.categoryName}
              </Text>
              <Text style={[styles.muted, { color: p.muted }]}>
                {x.expenseDate}
                {x.payee ? ` · ${x.payee}` : ""}
              </Text>
            </View>
            <Text style={[styles.amount, { color: p.text }]}>
              {formatPaise(x.amountPaise)}
            </Text>
          </View>
        ))
      ) : (
        <Text style={[styles.empty, { color: p.muted }]}>
          {strings.expenses.empty}
        </Text>
      )}
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  content: { gap: theme.spacing[4] },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: { ...theme.typography.screenTitle },
  link: { ...theme.typography.body, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderRadius: 18,
  },
  copy: { flex: 1 },
  name: { ...theme.typography.body, fontWeight: "600" },
  muted: { ...theme.typography.caption, marginTop: 4 },
  amount: { ...theme.typography.label },
  empty: { ...theme.typography.body },
});
