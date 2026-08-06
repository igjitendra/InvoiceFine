import type { SQLiteDatabase } from "expo-sqlite";

type TransactionTask<TResult> = (
  transaction: SQLiteDatabase,
) => Promise<TResult>;

export async function runInTransaction<TResult>(
  database: SQLiteDatabase,
  task: TransactionTask<TResult>,
): Promise<TResult> {
  let outcome: { value: TResult } | undefined;

  await database.withExclusiveTransactionAsync(
    async (transaction: SQLiteDatabase) => {
      outcome = { value: await task(transaction) };
    },
  );

  if (outcome === undefined) {
    throw new Error("The database transaction did not complete.");
  }

  return outcome.value;
}
