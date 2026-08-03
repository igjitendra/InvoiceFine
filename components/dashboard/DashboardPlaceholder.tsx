import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/constants/strings';
import { theme } from '@/constants/theme';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { MoneyText } from '@/components/ui/MoneyText';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

const metrics = [
  strings.dashboard.metrics.sales,
  strings.dashboard.metrics.received,
  strings.dashboard.metrics.receivables,
  strings.dashboard.metrics.stock,
] as const;

export function DashboardPlaceholder() {
  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{strings.dashboard.eyebrow}</Text>
        <Text style={styles.title}>{strings.dashboard.title}</Text>
        <Text style={styles.description}>{strings.dashboard.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.dashboard.summaryTitle}</Text>
        <View style={styles.metricGrid}>
          {metrics.map((label) => (
            <Card key={label} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{label}</Text>
              <MoneyText value={strings.common.notAvailable} />
              <Text style={styles.metricCaption}>
                {strings.dashboard.metricPlaceholder}
              </Text>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.dashboard.recentTitle}</Text>
        <Card>
          <EmptyState
            description={strings.dashboard.emptyDescription}
            icon="receipt-outline"
            title={strings.dashboard.emptyTitle}
          />
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing[5],
  },
  header: {
    gap: theme.spacing[2],
  },
  eyebrow: {
    color: theme.colors.primary,
    ...theme.typography.eyebrow,
  },
  title: {
    color: theme.colors.textPrimary,
    ...theme.typography.screenTitle,
  },
  description: {
    maxWidth: 560,
    color: theme.colors.textSecondary,
    ...theme.typography.body,
  },
  section: {
    gap: theme.spacing[3],
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    ...theme.typography.sectionTitle,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  metricCard: {
    minWidth: 140,
    flexBasis: '46%',
    flexGrow: 1,
    gap: theme.spacing[2],
  },
  metricLabel: {
    minHeight: 40,
    color: theme.colors.textSecondary,
    ...theme.typography.secondary,
  },
  metricCaption: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
  },
});
