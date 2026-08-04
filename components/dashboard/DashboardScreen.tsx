import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { routes } from '@/constants/routes';
import { strings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { loadDashboardData } from '@/db/repositories/dashboard';
import { formatPaise } from '@/lib/currency';
import { scaledToInput } from '@/lib/quantity';
import type { DashboardData, DashboardPeriod } from '@/types/dashboard';

type IconName = ComponentProps<typeof Ionicons>['name'];

function today() { return new Date().toISOString().slice(0, 10); }
function monthStart() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; }

export function DashboardScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<DashboardPeriod>('today');
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState(today());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try { setData(await loadDashboardData(start, end)); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, [start, end, attempt]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  function choose(next: DashboardPeriod) {
    setPeriod(next);
    if (next === 'today') { setStart(today()); setEnd(today()); }
    if (next === 'month') { setStart(monthStart()); setEnd(today()); }
  }

  if (loading && !data) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error && !data) return <ScreenContainer scroll={false}><EmptyState title={strings.reports.errorTitle} description={strings.reports.errorDescription} icon="warning-outline" actionLabel={strings.common.retry} onAction={() => setAttempt((value) => value + 1)} /></ScreenContainer>;

  const totals = data?.totals;
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.brandHeader}>
        <View style={styles.brandMark}><Ionicons name="receipt" size={24} color={theme.colors.textOnPrimary} /></View>
        <View style={styles.brandCopy}><Text style={styles.brand}>{strings.ux.brand}</Text><Text style={styles.tagline}>{strings.ux.tagline}</Text></View>
      </View>

      <Pressable accessibilityRole="button" onPress={() => router.push(routes.invoiceNew)} style={({ pressed }) => [styles.heroAction, pressed && styles.heroPressed]}>
        <View style={styles.heroIcon}><Ionicons name="add" size={30} color={theme.colors.primary} /></View>
        <View style={styles.heroCopy}><Text style={styles.heroTitle}>{strings.ux.createInvoice}</Text><Text style={styles.heroCaption}>Fast billing, stock update and professional PDF</Text></View>
        <Ionicons name="arrow-forward" size={24} color={theme.colors.textOnPrimary} />
      </Pressable>

      <Text style={styles.sectionTitle}>{strings.ux.quickActions}</Text>
      <View style={styles.quickGrid}>
        <QuickAction icon="person-add-outline" label={strings.ux.addCustomer} onPress={() => router.push(routes.customerNew)} />
        <QuickAction icon="cube-outline" label={strings.ux.addProduct} onPress={() => router.push(routes.catalogItemNew)} />
        <QuickAction icon="time-outline" label={strings.ux.pendingPayments} badge={totals?.receivablesPaise ? formatPaise(totals.receivablesPaise) : undefined} onPress={() => router.push(routes.invoices)} />
      </View>

      <View style={styles.periods}>
        {(['today', 'month', 'custom'] as DashboardPeriod[]).map((item) => (
          <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: period === item }} onPress={() => choose(item)} style={[styles.period, period === item && styles.periodActive]}>
            <Text style={[styles.periodText, period === item && styles.periodTextActive]}>{strings.reports[item]}</Text>
          </Pressable>
        ))}
      </View>

      {period === 'custom' ? <Card style={styles.customCard}><Input label={strings.reports.startDate} value={start} onChangeText={setStart} /><Input label={strings.reports.endDate} value={end} onChangeText={setEnd} /><Pressable accessibilityRole="button" onPress={() => void load()}><Text style={styles.link}>{strings.reports.apply}</Text></Pressable></Card> : null}

      <View style={styles.metricGrid}>
        <Metric icon="wallet-outline" label={period === 'today' ? "Today's sales" : strings.reports.sales} value={formatPaise(totals?.salesPaise ?? 0)} tone="blue" />
        <Metric icon="cash-outline" label={strings.reports.received} value={formatPaise(totals?.receivedPaise ?? 0)} tone="green" />
        <Metric icon="time-outline" label={strings.reports.receivables} value={formatPaise(totals?.receivablesPaise ?? 0)} tone="amber" onPress={() => router.push(routes.invoices)} />
        <Metric icon="trending-up-outline" label={strings.reports.net} value={formatPaise(totals?.netProfitPaise ?? 0)} tone="purple" />
      </View>

      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{strings.reports.recentInvoices}</Text><Pressable accessibilityRole="button" onPress={() => router.push(routes.invoices)}><Text style={styles.link}>{strings.ux.viewAll}</Text></Pressable></View>
      <Card style={styles.listCard}>
        {data?.recentInvoices.length ? data.recentInvoices.map((invoice, index) => (
          <Pressable key={invoice.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/invoice/[id]', params: { id: invoice.id } })} style={[styles.listRow, index > 0 && styles.divider]}>
            <View style={styles.rowIcon}><Ionicons name="document-text-outline" size={20} color={theme.colors.primary} /></View>
            <View style={styles.rowCopy}><Text style={styles.rowTitle}>{invoice.invoiceNumber}</Text><Text style={styles.rowMeta}>{invoice.customerName ?? 'Cash customer'} · {invoice.invoiceDate}</Text></View>
            <View style={styles.rowEnd}><Text style={styles.rowAmount}>{formatPaise(invoice.totalPaise)}</Text><Ionicons name="chevron-forward" size={18} color={theme.colors.disabled} /></View>
          </Pressable>
        )) : <Text style={styles.emptyText}>{strings.reports.noInvoices}</Text>}
      </Card>

      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{strings.ux.needsAttention}</Text><Pressable accessibilityRole="button" onPress={() => router.push(routes.catalog)}><Text style={styles.link}>{strings.ux.viewAll}</Text></Pressable></View>
      <Card style={styles.listCard}>
        {data?.lowStockItems.length ? data.lowStockItems.map((item, index) => (
          <Pressable key={item.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/catalog-item/[id]', params: { id: item.id } })} style={[styles.listRow, index > 0 && styles.divider]}>
            <View style={[styles.rowIcon, styles.warningIcon]}><Ionicons name="alert-outline" size={20} color={theme.colors.warning} /></View>
            <View style={styles.rowCopy}><Text style={styles.rowTitle}>{item.name}</Text><Text style={styles.rowMeta}>Low-stock threshold {scaledToInput(item.thresholdScaled)}</Text></View>
            <Text style={styles.stockText}>{scaledToInput(item.currentStockScaled)} {item.unitName ?? ''} {strings.ux.stockLeft}</Text>
          </Pressable>
        )) : <Text style={styles.emptyText}>{strings.reports.noLowStock}</Text>}
      </Card>
    </ScreenContainer>
  );
}

function QuickAction({ icon, label, badge, onPress }: { icon: IconName; label: string; badge?: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.quickPressed]}><View style={styles.quickIcon}><Ionicons name={icon} size={22} color={theme.colors.primary} /></View><Text style={styles.quickLabel}>{label}</Text>{badge ? <Text numberOfLines={1} style={styles.quickBadge}>{badge}</Text> : null}</Pressable>;
}
function Metric({ icon, label, value, tone, onPress }: { icon: IconName; label: string; value: string; tone: 'blue' | 'green' | 'amber' | 'purple'; onPress?: () => void }) {
  const body = <><View style={[styles.metricIcon, styles[`${tone}Tone`]]}><Ionicons name={icon} size={20} color={styles[`${tone}Text`].color} /></View><Text style={styles.metricLabel}>{label}</Text><Text numberOfLines={1} adjustsFontSizeToFit style={styles.metricValue}>{value}</Text></>;
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={styles.metric}>{body}</Pressable> : <View style={styles.metric}>{body}</View>;
}

const styles = StyleSheet.create({
  content: { gap: theme.spacing[4] }, brandHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }, brandMark: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }, brandCopy: { flex: 1 }, brand: { color: theme.colors.textPrimary, fontSize: 26, lineHeight: 32, fontWeight: '700' }, tagline: { color: theme.colors.textSecondary, ...theme.typography.secondary },
  heroAction: { minHeight: 104, padding: theme.spacing[4], flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], backgroundColor: theme.colors.primary, borderRadius: 20 }, heroPressed: { backgroundColor: theme.colors.primaryPressed }, heroIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface }, heroCopy: { flex: 1 }, heroTitle: { color: theme.colors.textOnPrimary, fontSize: 21, lineHeight: 27, fontWeight: '700' }, heroCaption: { color: '#DBEAFE', ...theme.typography.caption, marginTop: theme.spacing[1] },
  sectionTitle: { color: theme.colors.textPrimary, ...theme.typography.sectionTitle }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, link: { color: theme.colors.primary, ...theme.typography.label },
  quickGrid: { flexDirection: 'row', gap: theme.spacing[2] }, quickAction: { minHeight: 112, flex: 1, padding: theme.spacing[3], alignItems: 'center', justifyContent: 'center', gap: theme.spacing[2], backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16 }, quickPressed: { backgroundColor: theme.colors.primarySoft }, quickIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }, quickLabel: { color: theme.colors.textPrimary, textAlign: 'center', ...theme.typography.label }, quickBadge: { color: theme.colors.warning, ...theme.typography.caption },
  periods: { flexDirection: 'row', padding: theme.spacing[1], gap: theme.spacing[1], backgroundColor: theme.colors.border, borderRadius: 12 }, period: { minHeight: theme.layout.minimumTouchTarget, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 9 }, periodActive: { backgroundColor: theme.colors.surface }, periodText: { color: theme.colors.textSecondary, ...theme.typography.label }, periodTextActive: { color: theme.colors.primary, fontWeight: '700' }, customCard: { gap: theme.spacing[3] },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }, metric: { minHeight: 132, flexBasis: '47%', flexGrow: 1, padding: theme.spacing[4], backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 18 }, metricIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing[3] }, metricLabel: { color: theme.colors.textSecondary, ...theme.typography.secondary }, metricValue: { color: theme.colors.textPrimary, ...theme.typography.cardValue, marginTop: theme.spacing[1] }, blueTone: { backgroundColor: '#DBEAFE' }, blueText: { color: '#1D4ED8' }, greenTone: { backgroundColor: '#DCFCE7' }, greenText: { color: '#15803D' }, amberTone: { backgroundColor: '#FEF3C7' }, amberText: { color: '#B45309' }, purpleTone: { backgroundColor: '#F3E8FF' }, purpleText: { color: '#7E22CE' },
  listCard: { padding: 0, overflow: 'hidden' }, listRow: { minHeight: 72, padding: theme.spacing[3], flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }, divider: { borderTopWidth: 1, borderTopColor: theme.colors.border }, rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }, warningIcon: { backgroundColor: '#FEF3C7' }, rowCopy: { flex: 1 }, rowTitle: { color: theme.colors.textPrimary, ...theme.typography.label }, rowMeta: { color: theme.colors.textSecondary, ...theme.typography.caption, marginTop: theme.spacing[1] }, rowEnd: { alignItems: 'flex-end', flexDirection: 'row', gap: theme.spacing[1] }, rowAmount: { color: theme.colors.textPrimary, ...theme.typography.label }, stockText: { color: theme.colors.warning, ...theme.typography.label }, emptyText: { padding: theme.spacing[4], color: theme.colors.textSecondary, ...theme.typography.body },
});
