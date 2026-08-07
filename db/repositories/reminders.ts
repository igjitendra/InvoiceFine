import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "@/db/database";
import { runInTransaction } from "@/db/transaction";
import {
  isValidReminderDateTime,
  nextReminderOccurrence,
} from "@/lib/reminders";
import type {
  ServiceReminder,
  ServiceReminderInput,
  ServiceReminderRecurrence,
  ServiceReminderStatus,
} from "@/types/reminder";

type IdRow = { id: string };
type ReminderRow = {
  id: string;
  customer_id: string;
  customer_name: string;
  item_id: string | null;
  service_name: string | null;
  title: string;
  notes: string | null;
  remind_at: string;
  recurrence: ServiceReminderRecurrence;
  status: ServiceReminderStatus;
  notification_id: string | null;
  last_scheduled_at: string | null;
  created_at: string;
  updated_at: string;
};
type NotificationJob = {
  job_key: string;
  notification_id: string;
  scheduled_for: string;
};
export type NotificationBusinessSummary = {
  dueCount: number;
  duePaise: number;
  lowStockCount: number;
  todaySalesPaise: number;
  todayPaymentsPaise: number;
  weekSalesPaise: number;
  weekPaymentsPaise: number;
};

async function uuid(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<IdRow>(
    "SELECT lower(hex(randomblob(16))) id",
  );
  if (!row) throw new Error("ID generation failed");
  return row.id;
}
function map(row: ReminderRow): ServiceReminder {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    itemId: row.item_id,
    serviceName: row.service_name,
    title: row.title,
    notes: row.notes,
    remindAt: row.remind_at,
    recurrence: row.recurrence,
    status: row.status,
    notificationId: row.notification_id,
    lastScheduledAt: row.last_scheduled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
const select = `SELECT r.id,r.customer_id,c.name customer_name,r.item_id,i.name service_name,r.title,r.notes,r.remind_at,r.recurrence,r.status,r.notification_id,r.last_scheduled_at,r.created_at,r.updated_at FROM service_reminders r JOIN customers c ON c.id=r.customer_id LEFT JOIN items i ON i.id=r.item_id`;
export async function listServiceReminders(): Promise<ServiceReminder[]> {
  const db = await getDatabase(),
    rows = await db.getAllAsync<ReminderRow>(
      `${select} ORDER BY CASE r.status WHEN 'pending' THEN 0 WHEN 'completed' THEN 1 ELSE 2 END,r.remind_at ASC`,
    );
  return rows.map(map);
}
export async function listPendingServiceReminders(): Promise<
  ServiceReminder[]
> {
  const db = await getDatabase(),
    rows = await db.getAllAsync<ReminderRow>(
      `${select} WHERE r.status='pending' ORDER BY r.remind_at ASC`,
    );
  return rows.map(map);
}
export async function createServiceReminder(
  input: ServiceReminderInput,
): Promise<string> {
  const title = input.title.trim();
  if (!title) throw new Error("Title required");
  if (!isValidReminderDateTime(input.remindAt))
    throw new Error("Invalid reminder time");
  const db = await getDatabase();
  return runInTransaction(db, async (tx) => {
    const customer = await tx.getFirstAsync<IdRow>(
      "SELECT id FROM customers WHERE id=? AND is_archived=0",
      input.customerId,
    );
    if (!customer) throw new Error("Customer unavailable");
    if (input.itemId) {
      const item = await tx.getFirstAsync<IdRow>(
        "SELECT id FROM items WHERE id=? AND type='service' AND is_archived=0",
        input.itemId,
      );
      if (!item) throw new Error("Service unavailable");
    }
    const id = await uuid(tx),
      now = new Date().toISOString();
    await tx.runAsync(
      "INSERT INTO service_reminders(id,customer_id,item_id,title,notes,remind_at,recurrence,status,created_at,updated_at)VALUES(?,?,?,?,?,?,?,'pending',?,?)",
      id,
      input.customerId,
      input.itemId,
      title,
      input.notes.trim() || null,
      new Date(input.remindAt).toISOString(),
      input.recurrence,
      now,
      now,
    );
    return id;
  });
}
export async function completeServiceReminder(id: string): Promise<void> {
  const db = await getDatabase();
  await runInTransaction(db, async (tx) => {
    const row = await tx.getFirstAsync<{
      remind_at: string;
      recurrence: ServiceReminderRecurrence;
    }>(
      "SELECT remind_at,recurrence FROM service_reminders WHERE id=? AND status='pending'",
      id,
    );
    if (!row) throw new Error("Reminder unavailable");
    const next = nextReminderOccurrence(
        row.remind_at,
        row.recurrence,
        new Date(),
      ),
      now = new Date().toISOString();
    if (next)
      await tx.runAsync(
        "UPDATE service_reminders SET remind_at=?,notification_id=NULL,last_scheduled_at=NULL,updated_at=? WHERE id=?",
        next,
        now,
        id,
      );
    else
      await tx.runAsync(
        "UPDATE service_reminders SET status='completed',notification_id=NULL,last_scheduled_at=NULL,updated_at=? WHERE id=?",
        now,
        id,
      );
  });
}
export async function cancelServiceReminder(id: string): Promise<void> {
  const db = await getDatabase(),
    result = await db.runAsync(
      "UPDATE service_reminders SET status='cancelled',notification_id=NULL,last_scheduled_at=NULL,updated_at=? WHERE id=? AND status='pending'",
      new Date().toISOString(),
      id,
    );
  if (result.changes !== 1) throw new Error("Reminder unavailable");
}
export async function setReminderNotification(
  id: string,
  notificationId: string | null,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE service_reminders SET notification_id=?,last_scheduled_at=?,updated_at=? WHERE id=?",
    notificationId,
    notificationId ? new Date().toISOString() : null,
    new Date().toISOString(),
    id,
  );
}
export async function listNotificationJobs(): Promise<NotificationJob[]> {
  const db = await getDatabase();
  return db.getAllAsync<NotificationJob>(
    "SELECT job_key,notification_id,scheduled_for FROM notification_jobs",
  );
}
export async function replaceNotificationJob(
  jobKey: string,
  notificationId: string,
  scheduledFor: string,
): Promise<void> {
  const db = await getDatabase(),
    now = new Date().toISOString();
  await db.runAsync(
    "INSERT INTO notification_jobs(job_key,notification_id,scheduled_for,updated_at)VALUES(?,?,?,?) ON CONFLICT(job_key) DO UPDATE SET notification_id=excluded.notification_id,scheduled_for=excluded.scheduled_for,updated_at=excluded.updated_at",
    jobKey,
    notificationId,
    scheduledFor,
    now,
  );
}
export async function deleteNotificationJob(jobKey: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM notification_jobs WHERE job_key=?", jobKey);
}
export async function getNotificationBusinessSummary(): Promise<NotificationBusinessSummary> {
  const db = await getDatabase(),
    today = new Date().toISOString().slice(0, 10),
    weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const start = weekStart.toISOString().slice(0, 10);
  const due = await db.getFirstAsync<{ count: number; amount: number }>(
    "SELECT COUNT(*) count,COALESCE(SUM(total_paise-paid_paise-settlement_discount_paise),0) amount FROM invoices WHERE due_date IS NOT NULL AND due_date<=? AND status IN('finalized','partially_paid','overdue')",
    today,
  );
  const low = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) count FROM items WHERE type='product' AND is_archived=0 AND low_stock_threshold_scaled IS NOT NULL AND current_stock_scaled<=low_stock_threshold_scaled",
  );
  const daily = await db.getFirstAsync<{ sales: number; payments: number }>(
    "SELECT COALESCE((SELECT SUM(total_paise) FROM invoices WHERE invoice_date=? AND status NOT IN('draft','cancelled')),0) sales,COALESCE((SELECT SUM(amount_paise) FROM payments WHERE payment_date=?),0) payments",
    today,
    today,
  );
  const weekly = await db.getFirstAsync<{ sales: number; payments: number }>(
    "SELECT COALESCE((SELECT SUM(total_paise) FROM invoices WHERE invoice_date BETWEEN ? AND ? AND status NOT IN('draft','cancelled')),0) sales,COALESCE((SELECT SUM(amount_paise) FROM payments WHERE payment_date BETWEEN ? AND ?),0) payments",
    start,
    today,
    start,
    today,
  );
  return {
    dueCount: due?.count ?? 0,
    duePaise: due?.amount ?? 0,
    lowStockCount: low?.count ?? 0,
    todaySalesPaise: daily?.sales ?? 0,
    todayPaymentsPaise: daily?.payments ?? 0,
    weekSalesPaise: weekly?.sales ?? 0,
    weekPaymentsPaise: weekly?.payments ?? 0,
  };
}
