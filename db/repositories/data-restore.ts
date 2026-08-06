import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "@/db/database";
import { runInTransaction } from "@/db/transaction";
import { validateBackupJson } from "@/lib/backup-format";
import type {
  BackupDocument,
  BackupRow,
  BackupTableName,
} from "@/types/backup";
const restoreOrder = [
  "business_settings",
  "customers",
  "categories",
  "units",
  "items",
  "catalog_item_template_data",
  "item_favorites",
  "invoices",
  "invoice_items",
  "invoice_vertical_details",
  "payments",
  "expenses",
  "stock_movements",
  "service_reminders",
  "notification_jobs",
] as const satisfies readonly BackupTableName[];
const deleteOrder = [...restoreOrder].reverse();
type ColumnInfo = { name: string; notnull: number };
function quote(value: string) {
  if (!/^[a-z_]+$/.test(value)) throw new Error("Unsafe database identifier.");
  return `"${value}"`;
}
function validCell(value: unknown): value is string | number | null {
  return (
    value === null || typeof value === "string" || typeof value === "number"
  );
}
async function schemaVersion(database: SQLiteDatabase) {
  const row = await database.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  return row?.user_version ?? 0;
}
export async function preflightRestore(
  document: BackupDocument,
): Promise<void> {
  const validation = validateBackupJson(JSON.stringify(document));
  if (!validation.valid) throw new Error(validation.reason);
  const db = await getDatabase();
  const current = await schemaVersion(db);
  if (document.schemaVersion !== current)
    throw new Error(
      `Backup schema ${document.schemaVersion} does not match app schema ${current}.`,
    );
  if (document.tables.business_settings.length !== 1)
    throw new Error("Backup must contain exactly one business profile.");
}
async function insertRows(
  transaction: SQLiteDatabase,
  table: BackupTableName,
  rows: BackupRow[],
) {
  if (!rows.length) return;
  const info = await transaction.getAllAsync<ColumnInfo>(
    `PRAGMA table_info(${quote(table)})`,
  );
  if (!info.length) throw new Error(`Table is unavailable: ${table}`);
  const columns = info.map((column) => column.name);
  for (const row of rows) {
    for (const column of columns) {
      if (!(column in row))
        throw new Error(`Backup row is missing ${table}.${column}`);
      if (!validCell(row[column]))
        throw new Error(`Backup cell is invalid: ${table}.${column}`);
    }
    const sql = `INSERT INTO ${quote(table)} (${columns.map(quote).join(",")}) VALUES (${columns.map(() => "?").join(",")})`;
    await transaction.runAsync(
      sql,
      ...columns.map((column) => row[column] ?? null),
    );
  }
}
export async function restoreLocalDataBackup(
  document: BackupDocument,
): Promise<void> {
  await preflightRestore(document);
  const db = await getDatabase();
  await runInTransaction(db, async (transaction) => {
    await transaction.execAsync("PRAGMA defer_foreign_keys=ON");
    for (const table of deleteOrder)
      await transaction.runAsync(`DELETE FROM ${quote(table)}`);
    for (const table of restoreOrder)
      await insertRows(transaction, table, document.tables[table]);
    await transaction.runAsync("DELETE FROM notification_jobs");
    await transaction.runAsync(
      "UPDATE service_reminders SET notification_id=NULL,last_scheduled_at=NULL",
    );
    const foreignKeys = await transaction.getAllAsync<
      Record<string, string | number | null>
    >("PRAGMA foreign_key_check");
    if (foreignKeys.length)
      throw new Error("Restored data failed foreign-key validation.");
    const integrity = await transaction.getFirstAsync<{
      integrity_check: string;
    }>("PRAGMA integrity_check");
    if (integrity?.integrity_check !== "ok")
      throw new Error("Restored database failed integrity validation.");
  });
}
