import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { syncNotificationSchedule } from "@/services/notifications";

export function useNotificationCoordinator(enabled: boolean) {
  const router = useRouter();
  useEffect(() => {
    if (enabled) void syncNotificationSchedule().catch(() => undefined);
  }, [enabled]);
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
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
    return () => subscription.remove();
  }, [router]);
}
