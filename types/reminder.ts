export type ServiceReminderRecurrence =
  "none" | "monthly" | "quarterly" | "half_yearly" | "yearly";

export type ServiceReminderStatus = "pending" | "completed" | "cancelled";

export type ServiceReminder = {
  id: string;
  customerId: string;
  customerName: string;
  itemId: string | null;
  serviceName: string | null;
  title: string;
  notes: string | null;
  remindAt: string;
  recurrence: ServiceReminderRecurrence;
  status: ServiceReminderStatus;
  notificationId: string | null;
  lastScheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ServiceReminderInput = {
  customerId: string;
  itemId: string | null;
  title: string;
  notes: string;
  remindAt: string;
  recurrence: ServiceReminderRecurrence;
};

export type NotificationPermissionState =
  "granted" | "denied" | "undetermined" | "unsupported";
export type NotificationSyncSummary = {
  scheduled: number;
  cancelled: number;
  overdue: number;
};
