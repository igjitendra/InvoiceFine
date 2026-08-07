import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette, type AppPalette } from "@/hooks/useAppPalette";
import {
  cancelFinalizedInvoice,
  loadFinalizedInvoiceSummary,
} from "@/db/repositories/invoice-finalization";
import { formatPaise } from "@/lib/currency";
import { scaledToInput } from "@/lib/quantity";
import { printInvoicePdf, shareInvoicePdf } from "@/services/pdf/invoice-pdf";
import type { FinalizedInvoiceSummary } from "@/types/invoice-finalization";
import { VerticalDetailsSummary } from "./VerticalDetailsSummary";
export function FinalizedInvoiceScreen({ id }: { id: string }) {
  const router = useRouter();
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const [invoice, setInvoice] = useState<FinalizedInvoiceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void loadFinalizedInvoiceSummary(id)
      .then((value) => {
        if (active) {
          setInvoice(value);
          setError(value === null);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);
  function confirmCancel() {
    if (!invoice || cancelling) return;
    Alert.alert(
      strings.finalization.cancelTitle,
      strings.finalization.cancelDescription,
      [
        { text: strings.common.cancel, style: "cancel" },
        {
          text: strings.finalization.cancelInvoice,
          style: "destructive",
          onPress: () => {
            setCancelling(true);
            void cancelFinalizedInvoice(id)
              .then(() => {
                Alert.alert(strings.finalization.cancelledTitle);
                router.replace("/(tabs)/invoices");
              })
              .catch(() =>
                Alert.alert(
                  strings.finalization.cancelErrorTitle,
                  strings.finalization.cancelErrorDescription,
                ),
              )
              .finally(() => setCancelling(false));
          },
        },
      ],
    );
  }
  if (loading)
    return (
      <ScreenContainer scroll={false}>
        <LoadingState />
      </ScreenContainer>
    );
  if (error || !invoice)
    return (
      <ScreenContainer scroll={false}>
        <EmptyState
          title={strings.invoiceDrafts.detailErrorTitle}
          description={strings.invoiceDrafts.detailErrorDescription}
          icon="warning-outline"
        />
      </ScreenContainer>
    );
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={24} color={palette.text} />
        </Pressable>
        <Text style={styles.title}>{strings.finalization.detailsTitle}</Text>
      </View>
      <Card style={styles.card}>
        <Text style={styles.number}>{invoice.invoiceNumber}</Text>
        <Text style={styles.status}>
          {strings.finalization.status[invoice.status]} · {invoice.invoiceDate}
        </Text>
        <Text style={styles.customer}>
          {invoice.customerName ?? strings.invoiceDrafts.noCustomer}
        </Text>
      </Card>
      <VerticalDetailsSummary details={invoice.verticalDetails} />
      <Card style={styles.card}>
        <Text style={styles.section}>{strings.finalization.lineItems}</Text>
        {invoice.lines.map((line, index) => (
          <View key={`${line.description}-${index}`} style={styles.line}>
            <View style={styles.copy}>
              <Text style={styles.lineName}>{line.description}</Text>
              <Text style={styles.meta}>
                {scaledToInput(line.quantityScaled)}
              </Text>
            </View>
            <Text style={styles.amount}>
              {formatPaise(line.lineTotalPaise)}
            </Text>
          </View>
        ))}
      </Card>
      <Card style={styles.card}>
        <MoneyRow
          label={strings.invoiceDrafts.subtotal}
          value={invoice.subtotalPaise}
        />
        <MoneyRow
          label={strings.invoiceDrafts.totalDiscount}
          value={-invoice.discountPaise}
        />
        {invoice.cgstPaise > 0 ? (
          <MoneyRow
            label={strings.invoiceDrafts.cgst}
            value={invoice.cgstPaise}
          />
        ) : null}
        {invoice.sgstPaise > 0 ? (
          <MoneyRow
            label={strings.invoiceDrafts.sgst}
            value={invoice.sgstPaise}
          />
        ) : null}
        {invoice.igstPaise > 0 ? (
          <MoneyRow
            label={strings.invoiceDrafts.igst}
            value={invoice.igstPaise}
          />
        ) : null}
        <MoneyRow
          label={strings.invoiceDrafts.rounding}
          value={invoice.roundingPaise}
        />
        <MoneyRow
          label={strings.invoiceDrafts.total}
          value={invoice.totalPaise}
          strong
        />
        <MoneyRow label={strings.payments.paid} value={invoice.paidPaise} />
        {invoice.settlementDiscountPaise > 0 ? (
          <MoneyRow
            label={strings.payments.paymentDiscount}
            value={invoice.settlementDiscountPaise}
          />
        ) : null}
        <MoneyRow
          label={strings.payments.outstanding}
          value={Math.max(
            0,
            invoice.totalPaise -
              invoice.paidPaise -
              invoice.settlementDiscountPaise,
          )}
          strong={
            invoice.totalPaise >
            invoice.paidPaise + invoice.settlementDiscountPaise
          }
        />
      </Card>
      <Button
        label={strings.pdf.print}
        loading={pdfBusy}
        onPress={() => {
          setPdfBusy(true);
          void printInvoicePdf(id)
            .catch(() =>
              Alert.alert(strings.pdf.errorTitle, strings.pdf.errorDescription),
            )
            .finally(() => setPdfBusy(false));
        }}
      />
      <Button
        label={strings.pdf.share}
        loading={pdfBusy}
        onPress={() => {
          setPdfBusy(true);
          void shareInvoicePdf(id)
            .catch(() =>
              Alert.alert(strings.pdf.errorTitle, strings.pdf.errorDescription),
            )
            .finally(() => setPdfBusy(false));
        }}
      />
      {invoice.totalPaise >
        invoice.paidPaise + invoice.settlementDiscountPaise &&
      invoice.status !== "cancelled" ? (
        <Button
          label={strings.payments.record}
          onPress={() =>
            router.push({ pathname: "/invoice/[id]/payment", params: { id } })
          }
        />
      ) : null}
      {invoice.status === "finalized" && invoice.paidPaise === 0 ? (
        <Button
          label={strings.finalization.cancelInvoice}
          variant="danger"
          loading={cancelling}
          onPress={confirmCancel}
        />
      ) : null}
    </ScreenContainer>
  );
}
function MoneyRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  return (
    <View style={styles.moneyRow}>
      <Text style={[styles.meta, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.amount, strong && styles.strong]}>
        {value < 0 ? `-${formatPaise(Math.abs(value))}` : formatPaise(value)}
      </Text>
    </View>
  );
}
const createStyles = (palette: AppPalette) =>
  StyleSheet.create({
    content: { gap: theme.spacing[5] },
    header: {
      minHeight: theme.layout.headerHeight,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing[3],
    },
    back: {
      width: theme.layout.minimumTouchTarget,
      height: theme.layout.minimumTouchTarget,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      flex: 1,
      color: palette.text,
      ...theme.typography.screenTitle,
    },
    card: { gap: theme.spacing[3] },
    number: { color: palette.text, ...theme.typography.sectionTitle },
    status: { color: palette.primary, ...theme.typography.secondary },
    customer: { color: palette.muted, ...theme.typography.body },
    section: {
      color: palette.text,
      ...theme.typography.sectionTitle,
    },
    line: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      borderBottomColor: palette.border,
      borderBottomWidth: theme.layout.borderWidth,
    },
    copy: { flex: 1 },
    lineName: { color: palette.text, ...theme.typography.body },
    meta: { color: palette.muted, ...theme.typography.secondary },
    amount: { color: palette.text, ...theme.typography.secondary },
    moneyRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: theme.spacing[4],
    },
    strong: { color: palette.text, fontWeight: "700" },
  });
