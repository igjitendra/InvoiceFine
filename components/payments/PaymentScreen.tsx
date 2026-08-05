import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
import { getPaymentContext, recordPayment } from "@/db/repositories/payments";
import { formatPaise, parseRupeesToPaise } from "@/lib/currency";
import type { PaymentContext, PaymentMethod } from "@/types/payment";
const methods: PaymentMethod[] = [
  "cash",
  "upi",
  "card",
  "bank_transfer",
  "cheque",
  "other",
];
export function PaymentScreen({ invoiceId }: { invoiceId: string }) {
  const router = useRouter(),
    p = useAppPalette(),
    [ctx, setCtx] = useState<PaymentContext | null>(null),
    [amount, setAmount] = useState(""),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10)),
    [method, setMethod] = useState<PaymentMethod>("cash"),
    [reference, setReference] = useState(""),
    [notes, setNotes] = useState(""),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false);
  useEffect(() => {
    void getPaymentContext(invoiceId)
      .then((x) => {
        setCtx(x);
        if (x) setAmount((x.outstandingPaise / 100).toFixed(2));
      })
      .finally(() => setLoading(false));
  }, [invoiceId]);
  async function save() {
    const value = parseRupeesToPaise(amount);
    if (!value || !ctx)
      return Alert.alert(
        strings.payments.errorTitle,
        strings.payments.errorDescription,
      );
    setSaving(true);
    try {
      await recordPayment({
        invoiceId,
        amountPaise: value,
        paymentDate: date,
        method,
        reference: reference.trim() || null,
        notes: notes.trim() || null,
      });
      Alert.alert(strings.payments.successTitle);
      router.replace({ pathname: "/invoice/[id]", params: { id: invoiceId } });
    } catch {
      Alert.alert(
        strings.payments.errorTitle,
        strings.payments.errorDescription,
      );
    } finally {
      setSaving(false);
    }
  }
  if (loading)
    return (
      <ScreenContainer scroll={false}>
        <LoadingState />
      </ScreenContainer>
    );
  return (
    <ScreenContainer keyboardAware contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: p.text }]}>
        {strings.payments.title}
      </Text>
      <Card style={styles.card}>
        <Text style={[styles.info, { color: p.text }]}>
          {ctx?.invoiceNumber} · {strings.payments.outstanding}:{" "}
          {formatPaise(ctx?.outstandingPaise ?? 0)}
        </Text>
        <Input
          label={strings.payments.amount}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <Input
          label={strings.payments.date}
          value={date}
          onChangeText={setDate}
        />
        <Text style={[styles.label, { color: p.text }]}>
          {strings.payments.method}
        </Text>
        <View style={styles.methods}>
          {methods.map((x) => {
            const selected = method === x;
            return (
              <Pressable
                key={x}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setMethod(x)}
                style={[
                  styles.method,
                  {
                    borderColor: selected ? p.primary : p.borderStrong,
                    backgroundColor: selected ? p.primary : p.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.methodText,
                    { color: selected ? p.textOnPrimary : p.text },
                  ]}
                >
                  {strings.payments.methods[x]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Input
          label={strings.payments.reference}
          value={reference}
          onChangeText={setReference}
        />
        <Input
          label={strings.payments.notes}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </Card>
      <Button
        label={strings.payments.save}
        loading={saving}
        onPress={() => void save()}
      />
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  content: { gap: theme.spacing[5] },
  title: { ...theme.typography.screenTitle },
  card: { gap: theme.spacing[4] },
  info: { ...theme.typography.body },
  label: { ...theme.typography.label },
  methods: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing[2] },
  method: {
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: theme.radii.small,
  },
  methodText: { ...theme.typography.secondary },
});
