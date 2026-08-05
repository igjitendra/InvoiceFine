import { createBackupDocument, validateBackupJson } from "../lib/backup-format";
import { backupTableNames, type BackupTables } from "../types/backup";
const tables = Object.fromEntries(
  backupTableNames.map((name) => [name, []]),
) as BackupTables;
tables.customers = [{ id: "c1", name: "Customer" }];
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
