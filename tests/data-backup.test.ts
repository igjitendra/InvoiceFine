import { createBackupDocument, validateBackupJson } from "../lib/backup-format";
import type { BackupTables } from "../types/backup";

const tables: BackupTables = {
  business_settings: [],
  customers: [{ id: "c1", name: "Customer" }],
  categories: [],
  units: [],
  items: [],
  invoices: [],
  invoice_items: [],
  payments: [],
  expenses: [],
  stock_movements: [],
  invoice_vertical_details: [],
  schema_migrations: [],
};
const backup = createBackupDocument({
  createdAt: "2026-08-05T00:00:00.000Z",
  appVersion: "1.0.0",
  schemaVersion: 4,
  tables,
});
const json = JSON.stringify(backup);
if (!validateBackupJson(json).valid) throw new Error("Valid backup rejected");
const changed = json.replace("Customer", "Changed");
if (validateBackupJson(changed).valid)
  throw new Error("Changed backup accepted");
if (validateBackupJson("{bad").valid) throw new Error("Invalid JSON accepted");
console.log("DATA_BACKUP_FORMAT_TESTS=PASS");
