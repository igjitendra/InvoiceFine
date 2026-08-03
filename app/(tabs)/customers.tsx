import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';
import { strings } from '@/constants/strings';

export default function CustomersScreen() {
  return (
    <PlaceholderScreen
      description={strings.placeholders.customers.description}
      emptyTitle={strings.placeholders.customers.title}
      icon="people-outline"
      title={strings.tabs.customers}
    />
  );
}
