export const notificationsRemindersMigration = {
  version: 9,
  name: "notifications_reminders",
  sql: `
CREATE TABLE IF NOT EXISTS service_reminders(
  id TEXT PRIMARY KEY NOT NULL,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT,
  remind_at TEXT NOT NULL,
  recurrence TEXT NOT NULL DEFAULT 'none' CHECK(recurrence IN ('none','monthly','quarterly','half_yearly','yearly')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','completed','cancelled')),
  notification_id TEXT,
  last_scheduled_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_reminders_due ON service_reminders(status,remind_at);
CREATE INDEX IF NOT EXISTS idx_service_reminders_customer ON service_reminders(customer_id,created_at DESC);

CREATE TABLE IF NOT EXISTS notification_jobs(
  job_key TEXT PRIMARY KEY NOT NULL,
  notification_id TEXT NOT NULL,
  scheduled_for TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`,
} as const;
