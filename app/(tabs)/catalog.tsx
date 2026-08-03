import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';
import { strings } from '@/constants/strings';

export default function CatalogScreen() {
  return (
    <PlaceholderScreen
      description={strings.placeholders.catalog.description}
      emptyTitle={strings.placeholders.catalog.title}
      icon="cube-outline"
      title={strings.tabs.catalog}
    />
  );
}
