import type { SQLiteDatabase } from "expo-sqlite";

import { monetization } from "@/constants/monetization";
import { getDatabase } from "@/db/database";
import { getMonetizationStatus } from "@/lib/monetization-storage";
import type { FreeLimitKind, FreeUsage } from "@/types/monetization";

export class FreePlanLimitError extends Error {
  constructor(readonly kind: FreeLimitKind) {
    super(`FREE_PLAN_${kind.toUpperCase()}_LIMIT`);
    this.name = "FreePlanLimitError";
  }
}
function localDayBounds(now: Date): [string, string] {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return [start.toISOString(), end.toISOString()];
}
export async function loadFreeUsage(
  database?: SQLiteDatabase,
  now = new Date(),
): Promise<FreeUsage> {
  const db = database ?? (await getDatabase());
  const [start, end] = localDayBounds(now);
  const [invoice, customer, catalog] = await Promise.all([
    db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) count FROM invoices WHERE created_at>=? AND created_at<?",
      start,
      end,
    ),
    db.getFirstAsync<{ count: number }>("SELECT COUNT(*) count FROM customers"),
    db.getFirstAsync<{ count: number }>("SELECT COUNT(*) count FROM items"),
  ]);
  return {
    invoiceToday: invoice?.count ?? 0,
    customerTotal: customer?.count ?? 0,
    catalogTotal: catalog?.count ?? 0,
  };
}
export async function assertCanCreate(
  kind: FreeLimitKind,
  database?: SQLiteDatabase,
  now = new Date(),
): Promise<void> {
  if (getMonetizationStatus(now).isPro) return;
  const usage = await loadFreeUsage(database, now);
  const blocked =
    kind === "invoice"
      ? usage.invoiceToday >= monetization.freeDailyInvoiceLimit
      : kind === "customer"
        ? usage.customerTotal >= monetization.freeCustomerLimit
        : usage.catalogTotal >= monetization.freeCatalogLimit;
  if (blocked) throw new FreePlanLimitError(kind);
}
