import { getDatabase } from "@/db/database";
import type { NotificationPreference } from "@/types/onboarding";
import type { InvoiceSettings, NotificationSettings } from "@/types/settings";

const businessSettingsId = "primary-business";
const dueDayOptions = new Set([0, 7, 15, 30]);
const notificationOptions = new Set<NotificationPreference>([
  "low_stock",
  "due_payments",
  "backup_reminder",
  "daily_report",
  "weekly_report",
]);

type InvoiceSettingsRow = {
  invoice_prefix: string;
  next_invoice_number: number;
  invoice_page_size: "a4" | "4x6";
  payment_terms_days: number;
};

export async function getInvoiceSettings(): Promise<InvoiceSettings | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<InvoiceSettingsRow>(
    `SELECT invoice_prefix, next_invoice_number, invoice_page_size,
            payment_terms_days
     FROM business_settings
     WHERE id = ?`,
    businessSettingsId,
  );
  return row
    ? {
        invoicePrefix: row.invoice_prefix,
        nextInvoiceNumber: row.next_invoice_number,
        invoicePageSize: row.invoice_page_size,
        defaultDueDays: row.payment_terms_days,
      }
    : null;
}

export async function saveInvoiceSettings(
  input: Pick<
    InvoiceSettings,
    "invoicePrefix" | "invoicePageSize" | "defaultDueDays"
  >,
): Promise<void> {
  const prefix = input.invoicePrefix.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9\-_/]{0,11}$/.test(prefix)) {
    throw new Error("Invalid invoice prefix.");
  }
  if (!dueDayOptions.has(input.defaultDueDays)) {
    throw new Error("Invalid default due days.");
  }
  const database = await getDatabase();
  const result = await database.runAsync(
    `UPDATE business_settings
     SET invoice_prefix = ?, invoice_page_size = ?, payment_terms_days = ?,
         updated_at = ?
     WHERE id = ?`,
    prefix,
    input.invoicePageSize,
    input.defaultDueDays,
    new Date().toISOString(),
    businessSettingsId,
  );
  if (result.changes !== 1)
    throw new Error("Business settings are unavailable.");
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    notification_preferences_json: string;
  }>(
    `SELECT notification_preferences_json
     FROM business_settings
     WHERE id = ?`,
    businessSettingsId,
  );
  if (!row) return { preferences: [] };
  try {
    const parsed: unknown = JSON.parse(row.notification_preferences_json);
    return {
      preferences: Array.isArray(parsed)
        ? parsed.filter(
            (item): item is NotificationPreference =>
              typeof item === "string" &&
              notificationOptions.has(item as NotificationPreference),
          )
        : [],
    };
  } catch {
    return { preferences: [] };
  }
}

export async function saveNotificationSettings(
  preferences: NotificationPreference[],
): Promise<void> {
  const sanitized = [...new Set(preferences)].filter((item) =>
    notificationOptions.has(item),
  );
  const database = await getDatabase();
  const result = await database.runAsync(
    `UPDATE business_settings
     SET notification_preferences_json = ?, updated_at = ?
     WHERE id = ?`,
    JSON.stringify(sanitized),
    new Date().toISOString(),
    businessSettingsId,
  );
  if (result.changes !== 1)
    throw new Error("Business settings are unavailable.");
}
