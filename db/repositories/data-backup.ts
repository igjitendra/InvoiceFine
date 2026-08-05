import { getDatabase } from "@/db/database";
import { createBackupDocument } from "@/lib/backup-format";
import {
  backupTableNames,
  type BackupDocument,
  type BackupRow,
  type BackupTables,
} from "@/types/backup";
export async function createLocalDataBackup(): Promise<BackupDocument> {
  const db = await getDatabase();
  const integrity = await db.getFirstAsync<{ integrity_check: string }>(
    "PRAGMA integrity_check",
  );
  if (integrity?.integrity_check !== "ok")
    throw new Error("SQLite integrity check failed.");
  const version = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const entries: Partial<BackupTables> = {};
  for (const name of backupTableNames) {
    entries[name] = await db.getAllAsync<BackupRow>(
      `SELECT * FROM "${name}" ORDER BY rowid ASC`,
    );
  }
  const tables: BackupTables = {
    business_settings: entries.business_settings ?? [],
    customers: entries.customers ?? [],
    categories: entries.categories ?? [],
    units: entries.units ?? [],
    items: entries.items ?? [],
    invoices: entries.invoices ?? [],
    invoice_items: entries.invoice_items ?? [],
    payments: entries.payments ?? [],
    expenses: entries.expenses ?? [],
    stock_movements: entries.stock_movements ?? [],
    invoice_vertical_details: entries.invoice_vertical_details ?? [],
    schema_migrations: entries.schema_migrations ?? [],
  };
  return createBackupDocument({
    createdAt: new Date().toISOString(),
    appVersion: "1.0.0",
    schemaVersion: version?.user_version ?? 0,
    tables,
  });
}
