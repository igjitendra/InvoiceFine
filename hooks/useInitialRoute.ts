import { useEffect, useState } from 'react';

import { routes } from '@/constants/routes';
import { getBusinessProfile } from '@/db/repositories/business-settings';

type InitialRoute = typeof routes.dashboard | typeof routes.onboarding;

export function useInitialRoute(): InitialRoute | null {
  const [route, setRoute] = useState<InitialRoute | null>(null);

  useEffect(() => {
    let isActive = true;

    void getBusinessProfile().then((profile) => {
      if (isActive) {
        setRoute(profile ? routes.dashboard : routes.onboarding);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  return route;
}
