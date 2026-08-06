import type { SQLiteDatabase } from "expo-sqlite";

import type { MigrationRecord } from "@/types/database";

import { initialSchemaMigration } from "./0001-initial-schema";
import { invoicePageSizeMigration } from "./0002-invoice-page-size";
import { premiumOnboardingMigration } from "./0003-premium-onboarding";
import { verticalInvoiceDetailsMigration } from "./0004-vertical-invoice-details";
import { professionalCatalogMigration } from "./0005-professional-catalog";
import { businessTemplateEngineMigration } from "./0006-business-template-engine";
import { invoiceSpeedToolsMigration } from "./0007-invoice-speed-tools";
import { customerCsvFieldsMigration } from "./0008-customer-csv-fields";

export type DatabaseMigration = {
  name: string;
  sql: string;
  version: number;
};

const migrations: readonly DatabaseMigration[] = [
  initialSchemaMigration,
  invoicePageSizeMigration,
  premiumOnboardingMigration,
  verticalInvoiceDetailsMigration,
  professionalCatalogMigration,
  businessTemplateEngineMigration,
  invoiceSpeedToolsMigration,
  customerCsvFieldsMigration,
];

const migrationTableSql = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);
`;

export async function runMigrations(database: SQLiteDatabase): Promise<void> {
  await database.execAsync(migrationTableSql);

  const appliedMigrations = await database.getAllAsync<MigrationRecord>(
    "SELECT version, name, applied_at FROM schema_migrations ORDER BY version ASC",
  );
  const appliedVersions = new Set(
    appliedMigrations.map((migration: MigrationRecord) => migration.version),
  );

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }

    await database.withExclusiveTransactionAsync(
      async (transaction: SQLiteDatabase) => {
        await transaction.execAsync(migration.sql);
        await transaction.runAsync(
          `INSERT INTO schema_migrations (version, name, applied_at)
         VALUES (?, ?, ?)`,
          migration.version,
          migration.name,
          new Date().toISOString(),
        );
        await transaction.execAsync(
          `PRAGMA user_version = ${migration.version}`,
        );
      },
    );
  }
}
