import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { LoadingState } from "@/components/ui/LoadingState";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
import { loadCustomerLedger } from "@/db/repositories/payments";
import { formatPaise } from "@/lib/currency";
import type { CustomerLedger } from "@/types/payment";
export function CustomerLedgerScreen({ customerId }: { customerId: string }) {
  const p = useAppPalette(),
    [x, setX] = useState<CustomerLedger | null>(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    void loadCustomerLedger(customerId)
      .then(setX)
      .finally(() => setLoading(false));
  }, [customerId]);
  if (loading)
    return (
      <ScreenContainer scroll={false}>
        <LoadingState />
      </ScreenContainer>
    );
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: p.text }]}>
        {strings.payments.ledger}
      </Text>
      <Text style={[styles.name, { color: p.text }]}>{x?.customerName}</Text>
      <View
        style={[
          styles.summary,
          { backgroundColor: p.surface, borderColor: p.border },
        ]}
      >
        <Summary
          label={strings.payments.invoiced}
          value={formatPaise(x?.invoicedPaise ?? 0)}
        />
        <Summary
          label={strings.payments.received}
          value={formatPaise(x?.paidPaise ?? 0)}
        />
        <Summary
          label={strings.payments.outstanding}
          value={formatPaise(x?.outstandingPaise ?? 0)}
        />
      </View>
      {x?.entries.length ? (
        x.entries.map((e) => (
          <View
            key={`${e.kind}-${e.id}`}
            style={[
              styles.row,
              { backgroundColor: p.surface, borderColor: p.border },
            ]}
          >
            <View style={styles.copy}>
              <Text style={[styles.entry, { color: p.text }]}>{e.label}</Text>
              <Text style={[styles.date, { color: p.muted }]}>{e.date}</Text>
            </View>
            <Text style={[styles.entry, { color: p.text }]}>
              {e.kind === "invoice"
                ? formatPaise(e.debitPaise)
                : `-${formatPaise(e.creditPaise)}`}
            </Text>
          </View>
        ))
      ) : (
        <Text style={[styles.empty, { color: p.muted }]}>
          {strings.payments.noEntries}
        </Text>
      )}
    </ScreenContainer>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  const p = useAppPalette();
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: p.muted }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: p.text }]}>{value}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  content: { gap: theme.spacing[4] },
  title: { ...theme.typography.screenTitle },
  name: { ...theme.typography.sectionTitle },
  summary: {
    gap: theme.spacing[2],
    padding: theme.spacing[4],
    borderWidth: 1,
    borderRadius: 18,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: { ...theme.typography.secondary },
  summaryValue: { ...theme.typography.label },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: theme.spacing[3],
    borderWidth: 1,
    borderRadius: 16,
  },
  copy: { flex: 1 },
  entry: { ...theme.typography.body },
  date: { ...theme.typography.caption },
  empty: { ...theme.typography.body },
});
