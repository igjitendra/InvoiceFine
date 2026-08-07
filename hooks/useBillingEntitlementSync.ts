import { useEffect } from "react";

import { restorePlayPurchases } from "@/services/play-billing";

export function useBillingEntitlementSync(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    void restorePlayPurchases().catch(() => {
      // Expo Go, offline startup, and unavailable Play Store keep the local cache.
    });
  }, [enabled]);
}
