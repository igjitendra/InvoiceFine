import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette, type AppPalette } from "@/hooks/useAppPalette";
import { loadCustomerInsights } from "@/db/repositories/customer-insights";
import { getCustomer } from "@/db/repositories/customers";
import { formatPaise } from "@/lib/currency";
import type { Customer } from "@/types/customer";
import type { CustomerInsights } from "@/types/customer-insights";
import { CustomerForm } from "./CustomerForm";

type Props = { id: string };
export function CustomerDetailScreen({ id }: Props) {
  const p = useAppPalette(),
    styles = createStyles(p),
    router = useRouter(),
    [customer, setCustomer] = useState<Customer | null>(null),
    [insights, setInsights] = useState<CustomerInsights | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [editing, setEditing] = useState(false),
    [attempt, setAttempt] = useState(0);
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [c, i] = await Promise.all([
        getCustomer(id),
        loadCustomerInsights(id),
      ]);
      if (!c) throw new Error("Missing customer");
      setCustomer(c);
      setInsights(i);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id, attempt]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  async function open(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(strings.customerProfile.contactError);
    }
  }
  function call() {
    if (!customer?.phone)
      return Alert.alert(strings.customerProfile.contactUnavailable);
    void open(`tel:${customer.phone}`);
  }
  function whatsapp() {
    if (!customer?.phone)
      return Alert.alert(strings.customerProfile.contactUnavailable);
    const digits = customer.phone.replace(/\D/g, "");
    const international = digits.length === 10 ? `91${digits}` : digits;
    void open(`https://wa.me/${international}`);
  }
  if (loading && !customer)
    return (
      <ScreenContainer scroll={false}>
        <LoadingState />
      </ScreenContainer>
    );
  if (error || !customer)
    return (
      <ScreenContainer scroll={false}>
        <EmptyState
          title={strings.customers.detailErrorTitle}
          description={strings.customers.detailErrorDescription}
          icon="warning-outline"
          actionLabel={strings.common.retry}
          onAction={() => setAttempt((v) => v + 1)}
        />
      </ScreenContainer>
    );
  if (editing)
    return (
      <CustomerForm
        customer={customer}
        onCancel={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          void load();
        }}
      />
    );
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons name="arrow-back" size={24} color={p.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {strings.customerProfile.overview}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setEditing(true)}
          style={styles.editIcon}
        >
          <Ionicons name="create-outline" size={22} color={p.primary} />
        </Pressable>
      </View>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {customer.name.trim().charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.contact}>
          {customer.phone ?? customer.email ?? strings.common.notAvailable}
        </Text>
        {customer.gstin ? (
          <Text style={styles.gstin}>GSTIN · {customer.gstin}</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Action
          icon="call-outline"
          label={strings.customerProfile.call}
          onPress={call}
          disabled={!customer.phone}
        />
        <Action
          icon="logo-whatsapp"
          label={strings.customerProfile.whatsapp}
          onPress={whatsapp}
          disabled={!customer.phone}
        />
        <Action
          icon="create-outline"
          label={strings.customerProfile.edit}
          onPress={() => setEditing(true)}
        />
      </View>
      <View style={styles.grid}>
        <Metric
          label={strings.customerProfile.totalSales}
          value={formatPaise(insights?.totalSalesPaise ?? 0)}
          tone="blue"
        />
        <Metric
          label={strings.customerProfile.outstanding}
          value={formatPaise(insights?.outstandingPaise ?? 0)}
          tone="amber"
        />
        <Metric
          label={strings.customerProfile.received}
          value={formatPaise(insights?.receivedPaise ?? 0)}
          tone="green"
        />
        <Metric
          label={strings.customerProfile.invoices}
          value={String(insights?.invoiceCount ?? 0)}
          tone="purple"
        />
      </View>
      <Text style={styles.section}>{strings.customerProfile.activity}</Text>
      <Card style={styles.card}>
        <Pressable
          accessibilityRole={insights?.lastInvoice ? "button" : undefined}
          onPress={() => {
            if (insights?.lastInvoice)
              router.push({
                pathname: "/invoice/[id]",
                params: { id: insights.lastInvoice.id },
              });
          }}
          style={styles.activity}
        >
          <View style={styles.activityIcon}>
            <Ionicons
              name="document-text-outline"
              size={21}
              color={p.primary}
            />
          </View>
          <View style={styles.activityCopy}>
            <Text style={styles.activityLabel}>
              {strings.customerProfile.lastInvoice}
            </Text>
            <Text style={styles.activityTitle}>
              {insights?.lastInvoice?.invoiceNumber ??
                strings.customerProfile.noInvoice}
            </Text>
            {insights?.lastInvoice ? (
              <Text style={styles.meta}>
                {insights.lastInvoice.invoiceDate} ·{" "}
                {formatPaise(insights.lastInvoice.totalPaise)}
              </Text>
            ) : null}
          </View>
          {insights?.lastInvoice ? (
            <Ionicons name="chevron-forward" size={18} color={p.disabled} />
          ) : null}
        </Pressable>
        <View style={styles.divider} />
        <View style={styles.activity}>
          <View style={[styles.activityIcon, styles.paymentIcon]}>
            <Ionicons name="cash-outline" size={21} color={p.positive} />
          </View>
          <View style={styles.activityCopy}>
            <Text style={styles.activityLabel}>
              {strings.customerProfile.lastPayment}
            </Text>
            <Text style={styles.activityTitle}>
              {insights?.lastPayment
                ? formatPaise(insights.lastPayment.amountPaise)
                : strings.customerProfile.noPayment}
            </Text>
            {insights?.lastPayment ? (
              <Text style={styles.meta}>
                {insights.lastPayment.paymentDate} ·{" "}
                {insights.lastPayment.method.replace("_", " ")}
              </Text>
            ) : null}
          </View>
        </View>
      </Card>
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.push({ pathname: "/customer/[id]/ledger", params: { id } })
        }
        style={styles.ledger}
      >
        <Ionicons name="book-outline" size={20} color={p.primary} />
        <Text style={styles.ledgerText}>{strings.customerProfile.ledger}</Text>
        <Ionicons name="arrow-forward" size={18} color={p.primary} />
      </Pressable>
      {customer.billingAddress ? (
        <Card style={styles.details}>
          <Text style={styles.detailLabel}>
            {strings.customers.fields.billingAddress}
          </Text>
          <Text style={styles.detailValue}>{customer.billingAddress}</Text>
        </Card>
      ) : null}
    </ScreenContainer>
  );
}
function Action({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: "call-outline" | "logo-whatsapp" | "create-outline";
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const p = useAppPalette(),
    styles = createStyles(p);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.action, disabled && styles.disabled]}
    >
      <Ionicons name={icon} size={22} color={p.primary} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}
function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "amber" | "green" | "purple";
}) {
  const p = useAppPalette(),
    styles = createStyles(p);
  return (
    <View style={styles.metric}>
      <View style={[styles.metricBar, styles[`${tone}Bar`]]} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}
const createStyles = (p: AppPalette) =>
  StyleSheet.create({
    content: { gap: theme.spacing[4] },
    header: {
      minHeight: theme.layout.headerHeight,
      flexDirection: "row",
      alignItems: "center",
    },
    back: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      color: p.text,
      ...theme.typography.sectionTitle,
    },
    editIcon: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    identity: { alignItems: "center", gap: theme.spacing[1] },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: p.primary,
    },
    avatarText: { color: p.textOnPrimary, fontSize: 32, fontWeight: "700" },
    name: { color: p.text, fontSize: 26, lineHeight: 32, fontWeight: "700" },
    contact: { color: p.muted, ...theme.typography.body },
    gstin: { color: p.muted, ...theme.typography.caption },
    actions: { flexDirection: "row", gap: theme.spacing[2] },
    action: {
      minHeight: 76,
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing[1],
      backgroundColor: p.surface,
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: 16,
    },
    disabled: { opacity: 0.45 },
    actionText: {
      color: p.primary,
      ...theme.typography.caption,
      fontWeight: "700",
    },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing[2] },
    metric: {
      minHeight: 112,
      flexBasis: "47%",
      flexGrow: 1,
      padding: theme.spacing[4],
      backgroundColor: p.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: p.border,
      overflow: "hidden",
    },
    metricBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
    blueBar: { backgroundColor: p.primary },
    amberBar: { backgroundColor: p.warning },
    greenBar: { backgroundColor: p.positive },
    purpleBar: { backgroundColor: p.dark ? "#C084FC" : "#7E22CE" },
    metricLabel: { color: p.muted, ...theme.typography.caption },
    metricValue: {
      color: p.text,
      ...theme.typography.cardValue,
      marginTop: theme.spacing[2],
    },
    section: { color: p.text, ...theme.typography.sectionTitle },
    card: { padding: 0, overflow: "hidden" },
    activity: {
      minHeight: 88,
      padding: theme.spacing[4],
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing[3],
    },
    activityIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: p.primarySoft,
    },
    paymentIcon: { backgroundColor: p.dark ? "#17382B" : "#DCFCE7" },
    activityCopy: { flex: 1 },
    activityLabel: { color: p.muted, ...theme.typography.caption },
    activityTitle: { color: p.text, ...theme.typography.label, marginTop: 2 },
    meta: { color: p.muted, ...theme.typography.caption, marginTop: 2 },
    divider: {
      height: 1,
      backgroundColor: p.border,
      marginHorizontal: theme.spacing[4],
    },
    ledger: {
      minHeight: 56,
      paddingHorizontal: theme.spacing[4],
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing[3],
      backgroundColor: p.primarySoft,
      borderRadius: 14,
    },
    ledgerText: {
      flex: 1,
      color: p.primarySoftText,
      ...theme.typography.label,
    },
    details: { gap: theme.spacing[2] },
    detailLabel: { color: p.muted, ...theme.typography.caption },
    detailValue: { color: p.text, ...theme.typography.body },
  });
