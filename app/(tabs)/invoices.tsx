import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';
import { strings } from '@/constants/strings';

export default function InvoicesScreen() {
  return (
    <PlaceholderScreen
      description={strings.placeholders.invoices.description}
      emptyTitle={strings.placeholders.invoices.title}
      icon="receipt-outline"
      title={strings.tabs.invoices}
    />
  );
}
