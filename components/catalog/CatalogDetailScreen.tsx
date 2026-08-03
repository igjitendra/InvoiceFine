import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { strings } from '@/constants/strings';
import { useCatalogItem } from '@/hooks/useCatalogItem';
import { CatalogForm } from './CatalogForm';

export function CatalogDetailScreen({ id }: { id: string }) {
  const { item, loading, error, retry } = useCatalogItem(id);
  if (loading) return <ScreenContainer scroll={false}><LoadingState /></ScreenContainer>;
  if (error || !item) return <ScreenContainer scroll={false}><EmptyState title={strings.catalog.detailErrorTitle} description={strings.catalog.detailErrorDescription} icon="warning-outline" actionLabel={strings.common.retry} onAction={retry} /></ScreenContainer>;
  return <CatalogForm item={item} />;
}
