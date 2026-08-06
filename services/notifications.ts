import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getNotificationSettings } from "@/db/repositories/app-settings";
import {
  deleteNotificationJob,
  getNotificationBusinessSummary,
  listNotificationJobs,
  listPendingServiceReminders,
  replaceNotificationJob,
  setReminderNotification,
} from "@/db/repositories/reminders";
import type {
  NotificationPermissionState,
  NotificationSyncSummary,
} from "@/types/reminder";

const businessChannel = "business-reminders",
  serviceChannel = "service-reminders";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
export async function prepareNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(businessChannel, {
    name: "Business reminders",
    description: "Due payments, low stock and business summaries",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: "default",
    vibrationPattern: [0, 220, 120, 220],
    lightColor: "#D93632",
  });
  await Notifications.setNotificationChannelAsync(serviceChannel, {
    name: "Customer service reminders",
    description: "Scheduled customer follow-ups and recurring services",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 250, 120, 250],
    lightColor: "#D93632",
  });
}
function state(status: string): NotificationPermissionState {
  return status === "granted"
    ? "granted"
    : status === "denied"
      ? "denied"
      : "undetermined";
}
export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  return state((await Notifications.getPermissionsAsync()).status);
}
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  await prepareNotificationChannels();
  return state((await Notifications.requestPermissionsAsync()).status);
}
export async function sendTestNotification(): Promise<void> {
  await prepareNotificationChannels();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "InvoiceFine notifications are ready",
      body: "Business and service reminders can now be delivered on this device.",
      sound: "default",
      data: { kind: "notification_test" },
    },
    trigger: null,
  });
}
async function cancel(id: string | null) {
  if (!id) return false;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
    return true;
  } catch {
    return false;
  }
}
export async function cancelAllInvoiceFineNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelReminderNotification(
  id: string | null,
): Promise<void> {
  await cancel(id);
}
function nextTime(hour: number, minute: number, weekday?: number) {
  const now = new Date(),
    next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (weekday === undefined) {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else {
    const delta = (weekday - next.getDay() + 7) % 7;
    next.setDate(next.getDate() + (delta === 0 && next <= now ? 7 : delta));
  }
  return next;
}
async function schedule(
  title: string,
  body: string,
  date: Date,
  kind: string,
  channelId: string,
  reminderId?: string,
) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
      data: { kind, reminderId: reminderId ?? "" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId,
    },
  });
}
const inr = (paise: number) => `₹${(paise / 100).toFixed(2)}`;
export async function syncNotificationSchedule(): Promise<NotificationSyncSummary> {
  const permission = await getNotificationPermissionState();
  if (permission !== "granted")
    return { scheduled: 0, cancelled: 0, overdue: 0 };
  await prepareNotificationChannels();
  let scheduled = 0,
    cancelled = 0,
    overdue = 0;
  const jobs = await listNotificationJobs();
  for (const job of jobs) {
    if (await cancel(job.notification_id)) cancelled++;
    await deleteNotificationJob(job.job_key);
  }
  const reminders = await listPendingServiceReminders();
  for (const reminder of reminders) {
    if (await cancel(reminder.notificationId)) cancelled++;
    await setReminderNotification(reminder.id, null);
  }
  const settings = await getNotificationSettings(),
    summary = await getNotificationBusinessSummary();
  const createJob = async (
    key: string,
    title: string,
    body: string,
    date: Date,
    kind: string,
  ) => {
    const id = await schedule(title, body, date, kind, businessChannel);
    await replaceNotificationJob(key, id, date.toISOString());
    scheduled++;
  };
  if (settings.preferences.includes("due_payments") && summary.dueCount > 0)
    await createJob(
      "due_payments",
      "Payments are due",
      `${summary.dueCount} invoice${summary.dueCount === 1 ? "" : "s"} · ${inr(summary.duePaise)} outstanding`,
      nextTime(9, 0),
      "due_payments",
    );
  if (settings.preferences.includes("low_stock") && summary.lowStockCount > 0)
    await createJob(
      "low_stock",
      "Low stock needs attention",
      `${summary.lowStockCount} product${summary.lowStockCount === 1 ? "" : "s"} reached the low-stock level`,
      nextTime(9, 15),
      "low_stock",
    );
  if (settings.preferences.includes("daily_report"))
    await createJob(
      "daily_report",
      "Daily business summary",
      `Sales ${inr(summary.todaySalesPaise)} · Payments ${inr(summary.todayPaymentsPaise)}`,
      nextTime(20, 0),
      "daily_report",
    );
  if (settings.preferences.includes("weekly_report"))
    await createJob(
      "weekly_report",
      "Weekly business report",
      `Sales ${inr(summary.weekSalesPaise)} · Payments ${inr(summary.weekPaymentsPaise)}`,
      nextTime(9, 0, 1),
      "weekly_report",
    );
  for (const reminder of reminders) {
    const date = new Date(reminder.remindAt);
    if (date.getTime() <= Date.now()) {
      overdue++;
      continue;
    }
    const id = await schedule(
      reminder.title,
      `${reminder.customerName}${reminder.serviceName ? ` · ${reminder.serviceName}` : ""}`,
      date,
      "service_reminder",
      serviceChannel,
      reminder.id,
    );
    await setReminderNotification(reminder.id, id);
    scheduled++;
  }
  return { scheduled, cancelled, overdue };
}
