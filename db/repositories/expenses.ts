import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "@/db/database";
import { runInTransaction } from "@/db/transaction";
import { isValidDateRange, isValidLocalDate } from "@/lib/date";
import type { Expense, ExpenseInput, ProfitReport } from "@/types/expense";
type Id = { id: string };
async function uuid(db: SQLiteDatabase) {
  const x = await db.getFirstAsync<Id>(
    `SELECT lower(hex(randomblob(4)))||'-'||lower(hex(randomblob(2)))||'-4'||substr(lower(hex(randomblob(2))),2)||'-'||substr('89ab',abs(random())%4+1,1)||substr(lower(hex(randomblob(2))),2)||'-'||lower(hex(randomblob(6))) id`,
  );
  if (!x) throw new Error("ID error");
  return x.id;
}
async function category(db: SQLiteDatabase, name: string, now: string) {
  const n = name.trim();
  if (!n) throw new Error("Category required");
  const old = await db.getFirstAsync<Id>(
    `SELECT id FROM categories WHERE kind='expense' AND name=? COLLATE NOCASE AND is_archived=0`,
    n,
  );
  if (old) return old.id;
  const id = await uuid(db);
  await db.runAsync(
    `INSERT INTO categories(id,kind,name,is_archived,created_at,updated_at)VALUES(?,'expense',?,0,?,?)`,
    id,
    n,
    now,
    now,
  );
  return id;
}
export async function createExpense(input: ExpenseInput): Promise<string> {
  if (!Number.isSafeInteger(input.amountPaise) || input.amountPaise <= 0)
    throw new Error("Invalid amount");
  if (!isValidLocalDate(input.expenseDate)) throw new Error("Invalid date");
  const db = await getDatabase();
  return runInTransaction(db, async (tx) => {
    const now = new Date().toISOString(),
      id = await uuid(tx),
      categoryId = await category(tx, input.category, now);
    await tx.runAsync(
      `INSERT INTO expenses(id,category_id,expense_date,amount_paise,payee,notes,created_at,updated_at)VALUES(?,?,?,?,?,?,?,?)`,
      id,
      categoryId,
      input.expenseDate,
      input.amountPaise,
      input.payee,
      input.notes,
      now,
      now,
    );
    return id;
  });
}
export async function listExpenses(): Promise<Expense[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    expense_date: string;
    amount_paise: number;
    payee: string | null;
    notes: string | null;
  }>(
    `SELECT e.id,c.name,e.expense_date,e.amount_paise,e.payee,e.notes FROM expenses e JOIN categories c ON c.id=e.category_id ORDER BY e.expense_date DESC,e.created_at DESC`,
  );
  return rows.map((x) => ({
    id: x.id,
    categoryName: x.name,
    expenseDate: x.expense_date,
    amountPaise: x.amount_paise,
    payee: x.payee,
    notes: x.notes,
  }));
}
export async function getProfitReport(
  startDate: string,
  endDate: string,
): Promise<ProfitReport> {
  if (!isValidDateRange(startDate, endDate))
    throw new Error("Invalid date range");
  const db = await getDatabase();
  const sales = await db.getFirstAsync<{ value: number }>(
    `SELECT COALESCE(SUM(taxable_paise),0) value FROM invoices WHERE invoice_date BETWEEN ? AND ? AND status IN('finalized','partially_paid','paid','overdue')`,
    startDate,
    endDate,
  );
  const cogs = await db.getFirstAsync<{ value: number }>(
    `SELECT COALESCE(SUM((ii.cost_price_paise*ii.quantity_scaled+500)/1000),0) value FROM invoice_items ii JOIN invoices i ON i.id=ii.invoice_id WHERE i.invoice_date BETWEEN ? AND ? AND i.status IN('finalized','partially_paid','paid','overdue') AND ii.item_type='product'`,
    startDate,
    endDate,
  );
  const expenses = await db.getFirstAsync<{ value: number }>(
    `SELECT COALESCE(SUM(amount_paise),0) value FROM expenses WHERE expense_date BETWEEN ? AND ?`,
    startDate,
    endDate,
  );
  const revenue = sales?.value ?? 0,
    cost = cogs?.value ?? 0,
    spent = expenses?.value ?? 0;
  return {
    startDate,
    endDate,
    salesRevenuePaise: revenue,
    cogsPaise: cost,
    grossProfitPaise: revenue - cost,
    expensesPaise: spent,
    netProfitPaise: revenue - cost - spent,
  };
}
