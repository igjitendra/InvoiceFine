import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  isNotificationRuntimeSupported,
  syncNotificationSchedule,
} from "@/services/notifications";

type NotificationSubscription = { remove: () => void };

export function useNotificationCoordinator(enabled: boolean) {
  const router = useRouter();
  useEffect(() => {
    if (enabled && isNotificationRuntimeSupported)
      void syncNotificationSchedule().catch(() => undefined);
  }, [enabled]);
  useEffect(() => {
    if (!isNotificationRuntimeSupported) return;
    let active = true;
    let subscription: NotificationSubscription | null = null;
    void import("expo-notifications")
      .then((Notifications) => {
        if (!active) return;
        subscription = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            const kind = response.notification.request.content.data?.kind;
            if (kind === "due_payments") router.push("/(tabs)/invoices");
            else if (kind === "low_stock") router.push("/(tabs)/catalog");
            else if (kind === "daily_report" || kind === "weekly_report")
              router.push("/(tabs)/reports");
            else if (kind === "service_reminder")
              router.push("/settings/reminders");
          },
        );
      })
      .catch(() => undefined);
    return () => {
      active = false;
      subscription?.remove();
    };
  }, [router]);
}
