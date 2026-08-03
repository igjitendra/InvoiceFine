import { PlaceholderScreen } from '@/components/ui/PlaceholderScreen';
import { strings } from '@/constants/strings';

export default function MoreScreen() {
  return (
    <PlaceholderScreen
      description={strings.placeholders.more.description}
      emptyTitle={strings.placeholders.more.title}
      icon="options-outline"
      title={strings.tabs.more}
    />
  );
}
