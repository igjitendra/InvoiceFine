import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { createExpense } from "@/db/repositories/expenses";
import { useAppPalette } from "@/hooks/useAppPalette";
import { parseRupeesToPaise } from "@/lib/currency";

export default function Screen() {
  const router = useRouter();
  const palette = useAppPalette();
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [payee, setPayee] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    const paise = parseRupeesToPaise(amount);
    if (!paise || !category.trim()) {
      Alert.alert(strings.expenses.errorTitle);
      return;
    }
    setSaving(true);
    try {
      await createExpense({
        category,
        expenseDate: date,
        amountPaise: paise,
        payee: payee.trim() || null,
        notes: notes.trim() || null,
      });
      Alert.alert(strings.expenses.saved);
      router.back();
    } catch {
      Alert.alert(strings.expenses.errorTitle);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer keyboardAware contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: palette.text }]}>
        {strings.expenses.add}
      </Text>
      <Card style={styles.card}>
        <Input
          label={strings.expenses.category}
          value={category}
          onChangeText={setCategory}
        />
        <Input
          label={strings.expenses.date}
          helperText={strings.expenses.dateHelp}
          value={date}
          onChangeText={setDate}
        />
        <Input
          label={strings.expenses.amount}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <Input
          label={strings.expenses.payee}
          value={payee}
          onChangeText={setPayee}
        />
        <Input
          label={strings.expenses.notes}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </Card>
      <Button
        label={strings.expenses.save}
        loading={saving}
        onPress={() => void save()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.spacing[4] },
  title: { ...theme.typography.screenTitle },
  card: { gap: theme.spacing[4] },
});
