import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState, type ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeInView } from "@/components/ui/FadeInView";
import { Input } from "@/components/ui/Input";
import { PressableScale } from "@/components/ui/PressableScale";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { routes } from "@/constants/routes";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { loadDashboardData } from "@/db/repositories/dashboard";
import { useAppPalette, type AppPalette } from "@/hooks/useAppPalette";
import { formatPaise } from "@/lib/currency";
import { scaledToInput } from "@/lib/quantity";
import type { DashboardData, DashboardPeriod } from "@/types/dashboard";

type IconName = ComponentProps<typeof Ionicons>["name"];
type MetricTone = "primary" | "positive" | "warning" | "purple";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function monthStart() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

export function DashboardScreen() {
  const palette = useAppPalette();
  const router = useRouter();
  const [period, setPeriod] = useState<DashboardPeriod>("today");
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState(today());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setData(await loadDashboardData(start, end));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [attempt, end, start]);

  useFocusEffect(useCallback(() => void load(), [load]));

  function choose(next: DashboardPeriod) {
    setPeriod(next);
    if (next === "today") {
      setStart(today());
      setEnd(today());
    } else if (next === "month") {
      setStart(monthStart());
      setEnd(today());
    }
  }

  if (loading && !data) return <DashboardSkeleton />;
  if (error && !data) {
    return (
      <ScreenContainer scroll={false}>
        <EmptyState
          title={strings.reports.errorTitle}
          description={strings.reports.errorDescription}
          icon="warning-outline"
          actionLabel={strings.common.retry}
          onAction={() => setAttempt((value) => value + 1)}
        />
      </ScreenContainer>
    );
  }

  const totals = data?.totals;

  return (
    <ScreenContainer>
      <FadeInView style={styles.content}>
        <View style={styles.header}>
          <View
            style={[styles.brandMark, { backgroundColor: palette.primary }]}
          >
            <Ionicons name="receipt" size={26} color={palette.textOnPrimary} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: palette.text }]}>
              {strings.ux.brand}
            </Text>
            <Text style={[styles.subtitle, { color: palette.muted }]}>
              {strings.ux.tagline}
            </Text>
          </View>
        </View>

        <PressableScale
          haptic="medium"
          accessibilityRole="button"
          onPress={() => router.push(routes.invoiceNew)}
          style={[styles.hero, { backgroundColor: palette.primary }]}
        >
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: palette.textOnPrimary },
            ]}
          >
            <Ionicons name="add" size={30} color={palette.primary} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{strings.ux.createInvoice}</Text>
            <Text style={styles.heroCaption}>
              {strings.ux.dashboardHeroDescription}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={26} color="#FFFFFF" />
        </PressableScale>

        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          {strings.ux.quickActions}
        </Text>
        <View style={styles.quickGrid}>
          <QuickAction
            icon="person-add-outline"
            label={strings.ux.addCustomer}
            onPress={() => router.push(routes.customerNew)}
          />
          <QuickAction
            icon="cube-outline"
            label={strings.ux.addProduct}
            onPress={() => router.push(routes.catalogItemNew)}
          />
          <QuickAction
            icon="time-outline"
            label={strings.ux.pendingPayments}
            badge={
              totals?.receivablesPaise
                ? formatPaise(totals.receivablesPaise)
                : undefined
            }
            onPress={() => router.push(routes.invoices)}
          />
        </View>

        <View
          style={[styles.periods, { backgroundColor: palette.surfaceVariant }]}
        >
          {(["today", "month", "custom"] as DashboardPeriod[]).map((item) => {
            const selected = period === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => choose(item)}
                style={[
                  styles.period,
                  selected && { backgroundColor: palette.primary },
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
                    { color: selected ? "#FFFFFF" : palette.muted },
                  ]}
                >
                  {strings.reports[item]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {period === "custom" ? (
          <Card style={styles.customCard}>
            <Input
              label={strings.reports.startDate}
              value={start}
              onChangeText={setStart}
            />
            <Input
              label={strings.reports.endDate}
              value={end}
              onChangeText={setEnd}
            />
            <Pressable accessibilityRole="button" onPress={() => void load()}>
              <Text style={[styles.link, { color: palette.primary }]}>
                {strings.reports.apply}
              </Text>
            </Pressable>
          </Card>
        ) : null}

        <View style={styles.metricGrid}>
          <Metric
            icon="wallet-outline"
            label={period === "today" ? "Today's sales" : strings.reports.sales}
            value={formatPaise(totals?.salesPaise ?? 0)}
            tone="primary"
          />
          <Metric
            icon="cash-outline"
            label={strings.reports.received}
            value={formatPaise(totals?.receivedPaise ?? 0)}
            tone="positive"
          />
          <Metric
            icon="time-outline"
            label={strings.reports.receivables}
            value={formatPaise(totals?.receivablesPaise ?? 0)}
            tone="warning"
            onPress={() => router.push(routes.invoices)}
          />
          <Metric
            icon="trending-up-outline"
            label={strings.reports.net}
            value={formatPaise(totals?.netProfitPaise ?? 0)}
            tone="purple"
          />
        </View>

        <SectionHeader
          title={strings.reports.recentInvoices}
          onPress={() => router.push(routes.invoices)}
        />
        <Card style={styles.listCard}>
          {data?.recentInvoices.length ? (
            data.recentInvoices.map((invoice, index) => (
              <Pressable
                key={invoice.id}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/invoice/[id]",
                    params: { id: invoice.id },
                  })
                }
                style={[
                  styles.listRow,
                  index > 0 && {
                    borderTopWidth: 1,
                    borderTopColor: palette.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.rowIcon,
                    { backgroundColor: palette.primarySoft },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={21}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={[styles.rowTitle, { color: palette.text }]}>
                    {invoice.invoiceNumber}
                  </Text>
                  <Text style={[styles.rowMeta, { color: palette.muted }]}>
                    {invoice.customerName ?? "Cash customer"} ·{" "}
                    {invoice.invoiceDate}
                  </Text>
                </View>
                <Text style={[styles.rowAmount, { color: palette.text }]}>
                  {formatPaise(invoice.totalPaise)}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={palette.muted}
                />
              </Pressable>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: palette.muted }]}>
              {strings.reports.noInvoices}
            </Text>
          )}
        </Card>

        <SectionHeader
          title={strings.ux.needsAttention}
          onPress={() => router.push(routes.catalog)}
        />
        <Card style={styles.listCard}>
          {data?.lowStockItems.length ? (
            data.lowStockItems.map((item, index) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/catalog-item/[id]",
                    params: { id: item.id },
                  })
                }
                style={[
                  styles.listRow,
                  index > 0 && {
                    borderTopWidth: 1,
                    borderTopColor: palette.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.rowIcon,
                    { backgroundColor: palette.dark ? "#3D3018" : "#FFF1D6" },
                  ]}
                >
                  <Ionicons
                    name="alert-outline"
                    size={21}
                    color={palette.warning}
                  />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={[styles.rowTitle, { color: palette.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.rowMeta, { color: palette.muted }]}>
                    Low-stock threshold {scaledToInput(item.thresholdScaled)}
                  </Text>
                </View>
                <Text style={[styles.stock, { color: palette.warning }]}>
                  {scaledToInput(item.currentStockScaled)} {item.unitName ?? ""}
                </Text>
              </Pressable>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: palette.muted }]}>
              {strings.reports.noLowStock}
            </Text>
          )}
        </Card>
      </FadeInView>
    </ScreenContainer>
  );
}

function SectionHeader({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  const palette = useAppPalette();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>
        {title}
      </Text>
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text style={[styles.link, { color: palette.primary }]}>
          {strings.ux.viewAll}
        </Text>
      </Pressable>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: IconName;
  label: string;
  badge?: string;
  onPress: () => void;
}) {
  const palette = useAppPalette();
  return (
    <PressableScale
      haptic="selection"
      accessibilityRole="button"
      onPress={onPress}
      wrapperStyle={styles.quickWrapper}
      style={[
        styles.quickAction,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <View
        style={[styles.quickIcon, { backgroundColor: palette.primarySoft }]}
      >
        <Ionicons name={icon} size={23} color={palette.primary} />
      </View>
      <Text style={[styles.quickLabel, { color: palette.text }]}>{label}</Text>
      {badge ? (
        <Text
          numberOfLines={1}
          style={[styles.quickBadge, { color: palette.warning }]}
        >
          {badge}
        </Text>
      ) : null}
    </PressableScale>
  );
}

function toneColors(palette: AppPalette, tone: MetricTone) {
  if (tone === "positive")
    return {
      color: palette.positive,
      soft: palette.dark ? "#17382B" : "#E3F5EC",
    };
  if (tone === "warning")
    return {
      color: palette.warning,
      soft: palette.dark ? "#3D3018" : "#FFF1D6",
    };
  if (tone === "purple")
    return {
      color: palette.dark ? "#C084FC" : "#7C3AED",
      soft: palette.dark ? "#352348" : "#F1E8FF",
    };
  return { color: palette.primary, soft: palette.primarySoft };
}

function Metric({
  icon,
  label,
  value,
  tone,
  onPress,
}: {
  icon: IconName;
  label: string;
  value: string;
  tone: MetricTone;
  onPress?: () => void;
}) {
  const palette = useAppPalette();
  const colors = toneColors(palette, tone);
  const body = (
    <>
      <View style={[styles.metricIcon, { backgroundColor: colors.soft }]}>
        <Ionicons name={icon} size={21} color={colors.color} />
      </View>
      <Text style={[styles.metricLabel, { color: palette.muted }]}>
        {label}
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[styles.metricValue, { color: palette.text }]}
      >
        {value}
      </Text>
    </>
  );
  const cardStyle = [
    styles.metric,
    { backgroundColor: palette.surface, borderColor: palette.border },
  ];
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={cardStyle}>
      {body}
    </Pressable>
  ) : (
    <View style={cardStyle}>{body}</View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  brandMark: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: { flex: 1 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: "700" },
  subtitle: { ...theme.typography.secondary },
  hero: {
    minHeight: 112,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 24,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: { flex: 1 },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
  },
  heroCaption: { color: "#FFE8E6", ...theme.typography.caption, marginTop: 4 },
  sectionTitle: { ...theme.typography.sectionTitle },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  link: { ...theme.typography.label, fontWeight: "700" },
  quickGrid: { flexDirection: "row", gap: 8 },
  quickWrapper: { flex: 1 },
  quickAction: {
    minHeight: 120,
    flex: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 20,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: { textAlign: "center", ...theme.typography.label },
  quickBadge: { ...theme.typography.caption },
  periods: { flexDirection: "row", padding: 4, gap: 4, borderRadius: 16 },
  period: {
    minHeight: 46,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },
  periodText: { ...theme.typography.label, fontWeight: "700" },
  customCard: { gap: 14 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: {
    minHeight: 142,
    flexBasis: "47%",
    flexGrow: 1,
    padding: 16,
    borderWidth: 1,
    borderRadius: 22,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricLabel: { ...theme.typography.secondary },
  metricValue: { ...theme.typography.cardValue, marginTop: 4 },
  listCard: { padding: 0, overflow: "hidden" },
  listRow: {
    minHeight: 78,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: { flex: 1 },
  rowTitle: { ...theme.typography.label, fontWeight: "700" },
  rowMeta: { ...theme.typography.caption, marginTop: 3 },
  rowAmount: { ...theme.typography.label, fontWeight: "700" },
  stock: { ...theme.typography.label, fontWeight: "700" },
  emptyText: { padding: 18, ...theme.typography.body },
});
