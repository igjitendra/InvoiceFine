import { Redirect } from 'expo-router';

import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useInitialRoute } from '@/hooks/useInitialRoute';

export default function IndexRoute() {
  const initialRoute = useInitialRoute();

  if (initialRoute === null) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingState />
      </ScreenContainer>
    );
  }

  return <Redirect href={initialRoute} />;
}
