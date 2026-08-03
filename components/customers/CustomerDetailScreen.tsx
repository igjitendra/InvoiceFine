import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { strings } from '@/constants/strings';
import { useCustomer } from '@/hooks/useCustomer';

import { CustomerForm } from './CustomerForm';

type CustomerDetailScreenProps = { id: string };

export function CustomerDetailScreen({ id }: CustomerDetailScreenProps) {
  const { customer, error, loading, retry } = useCustomer(id);
  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error || !customer) {
    return (
      <ScreenContainer scroll={false}>
        <EmptyState
          title={strings.customers.detailErrorTitle}
          description={strings.customers.detailErrorDescription}
          icon="warning-outline"
          actionLabel={strings.common.retry}
          onAction={retry}
        />
      </ScreenContainer>
    );
  }
  return <CustomerForm customer={customer} />;
}
