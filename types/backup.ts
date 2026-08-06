export type BackupCell = string | number | null;
export type BackupRow = Record<string, BackupCell>;
export const backupTableNames = [
  "business_settings",
  "customers",
  "categories",
  "units",
  "items",
  "invoices",
  "invoice_items",
  "payments",
  "expenses",
  "stock_movements",
  "invoice_vertical_details",
  "catalog_item_template_data",
  "item_favorites",
  "service_reminders",
  "notification_jobs",
  "schema_migrations",
] as const;
export type BackupTableName = (typeof backupTableNames)[number];
export type BackupTables = Record<BackupTableName, BackupRow[]>;
export type BackupDocument = {
  format: "invoicefine-backup";
  formatVersion: 1;
  createdAt: string;
  appVersion: string;
  schemaVersion: number;
  sqliteIntegrity: "ok";
  checksumAlgorithm: "fnv1a32";
  checksum: string;
  tableCounts: Record<BackupTableName, number>;
  tables: BackupTables;
};
export type BackupValidation = {
  valid: boolean;
  reason: string;
  schemaVersion?: number;
  createdAt?: string;
};
export type EncryptedBackupEnvelope = {
  format: "invoicefine-encrypted-backup";
  formatVersion: 1;
  appVersion: string;
  createdAt: string;
  schemaVersion: number;
  cipher: "AES-256-GCM";
  kdf: "PBKDF2-HMAC-SHA256";
  iterations: 210000;
  salt: string;
  sealedData: string;
};
