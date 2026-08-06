import * as SQLite from "expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";

import { runMigrations } from "./migrations";

const databaseName = "invoicefine.db";

let databasePromise: Promise<SQLiteDatabase> | null = null;

async function openConfiguredDatabase(): Promise<SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync(databaseName);

  try {
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;
    `);
    await runMigrations(database);
    return database;
  } catch (error) {
    await database.closeAsync();
    throw error;
  }
}

export function getDatabase(): Promise<SQLiteDatabase> {
  if (databasePromise === null) {
    databasePromise = openConfiguredDatabase().catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

export async function initializeDatabase(): Promise<void> {
  await getDatabase();
}
