import {
  backupTableNames,
  type BackupDocument,
  type BackupTables,
  type BackupValidation,
} from "../types/backup";
export function checksumText(value: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
function source(input: {
  createdAt: string;
  appVersion: string;
  schemaVersion: number;
  sqliteIntegrity: "ok";
  tableCounts: BackupDocument["tableCounts"];
  tables: BackupTables;
}) {
  return JSON.stringify({
    format: "invoicefine-backup",
    formatVersion: 1,
    createdAt: input.createdAt,
    appVersion: input.appVersion,
    schemaVersion: input.schemaVersion,
    sqliteIntegrity: input.sqliteIntegrity,
    checksumAlgorithm: "fnv1a32",
    tableCounts: input.tableCounts,
    tables: input.tables,
  });
}
export function createBackupDocument(input: {
  createdAt: string;
  appVersion: string;
  schemaVersion: number;
  tables: BackupTables;
}): BackupDocument {
  const tableCounts = Object.fromEntries(
    backupTableNames.map((name) => [name, input.tables[name].length]),
  ) as BackupDocument["tableCounts"];
  const base = { ...input, sqliteIntegrity: "ok" as const, tableCounts };
  return {
    format: "invoicefine-backup",
    formatVersion: 1,
    ...base,
    checksumAlgorithm: "fnv1a32",
    checksum: checksumText(source(base)),
  };
}
export function isBackupRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function validateBackupJson(json: string): BackupValidation {
  try {
    const value: unknown = JSON.parse(json);
    if (
      !isBackupRecord(value) ||
      value.format !== "invoicefine-backup" ||
      value.formatVersion !== 1
    )
      return { valid: false, reason: "Unsupported backup format." };
    if (
      typeof value.createdAt !== "string" ||
      typeof value.appVersion !== "string" ||
      typeof value.schemaVersion !== "number" ||
      value.sqliteIntegrity !== "ok" ||
      value.checksumAlgorithm !== "fnv1a32" ||
      typeof value.checksum !== "string" ||
      !isBackupRecord(value.tableCounts) ||
      !isBackupRecord(value.tables)
    )
      return { valid: false, reason: "Backup manifest is incomplete." };
    for (const name of backupTableNames) {
      const rows = value.tables[name];
      if (
        !Array.isArray(rows) ||
        typeof value.tableCounts[name] !== "number" ||
        rows.length !== value.tableCounts[name]
      )
        return { valid: false, reason: `Table count mismatch: ${name}` };
      for (const row of rows) {
        if (!isBackupRecord(row))
          return { valid: false, reason: `Invalid row: ${name}` };
        for (const cell of Object.values(row)) {
          if (
            cell !== null &&
            typeof cell !== "string" &&
            typeof cell !== "number"
          )
            return { valid: false, reason: `Invalid cell: ${name}` };
        }
      }
    }
    const checkSource = JSON.stringify({
      format: "invoicefine-backup",
      formatVersion: 1,
      createdAt: value.createdAt,
      appVersion: value.appVersion,
      schemaVersion: value.schemaVersion,
      sqliteIntegrity: "ok",
      checksumAlgorithm: "fnv1a32",
      tableCounts: value.tableCounts,
      tables: value.tables,
    });
    if (checksumText(checkSource) !== value.checksum)
      return { valid: false, reason: "Backup checksum does not match." };
    return {
      valid: true,
      reason: "Backup structure and checksum are valid.",
      schemaVersion: value.schemaVersion,
      createdAt: value.createdAt,
    };
  } catch {
    return { valid: false, reason: "Backup is not valid JSON." };
  }
}

export function parseBackupDocument(json: string): {
  document: BackupDocument | null;
  validation: BackupValidation;
} {
  const validation = validateBackupJson(json);
  if (!validation.valid) return { document: null, validation };
  const value: unknown = JSON.parse(json);
  if (!isBackupRecord(value))
    return {
      document: null,
      validation: { valid: false, reason: "Backup root is invalid." },
    };
  return { document: value as BackupDocument, validation };
}
