import type { SQLiteDatabase } from "expo-sqlite";
import { getDatabase } from "@/db/database";
import { runInTransaction } from "@/db/transaction";
import { isValidLocalDate } from "@/lib/date";
import type {
  CustomerLedger,
  LedgerEntry,
  Payment,
  PaymentContext,
  PaymentInput,
  PaymentMethod,
} from "@/types/payment";
type Id = { id: string };
type Inv = {
  id: string;
  invoice_number: string;
  status: string;
  customer_id: string | null;
  customer_name_snapshot: string | null;
  total_paise: number;
  paid_paise: number;
};
type PayRow = {
  id: string;
  invoice_id: string;
  amount_paise: number;
  payment_date: string;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
};
async function uuid(db: SQLiteDatabase) {
  const x = await db.getFirstAsync<Id>(
    `SELECT lower(hex(randomblob(4)))||'-'||lower(hex(randomblob(2)))||'-4'||substr(lower(hex(randomblob(2))),2)||'-'||substr('89ab',abs(random())%4+1,1)||substr(lower(hex(randomblob(2))),2)||'-'||lower(hex(randomblob(6))) id`,
  );
  if (!x) throw new Error("ID error");
  return x.id;
}
export async function getPaymentContext(
  id: string,
): Promise<PaymentContext | null> {
  const db = await getDatabase();
  const x = await db.getFirstAsync<Inv>(
    `SELECT id,invoice_number,status,customer_id,customer_name_snapshot,total_paise,paid_paise FROM invoices WHERE id=? AND status NOT IN('draft','cancelled')`,
    id,
  );
  return x
    ? {
        invoiceNumber: x.invoice_number,
        customerName: x.customer_name_snapshot,
        totalPaise: x.total_paise,
        paidPaise: x.paid_paise,
        outstandingPaise: x.total_paise - x.paid_paise,
      }
    : null;
}
export async function recordPayment(input: PaymentInput): Promise<string> {
  const db = await getDatabase();
  return runInTransaction(db, async (tx) => {
    if (!Number.isSafeInteger(input.amountPaise) || input.amountPaise <= 0)
      throw new Error("Invalid amount");
    if (!isValidLocalDate(input.paymentDate)) throw new Error("Invalid date");
    const inv = await tx.getFirstAsync<Inv>(
      `SELECT id,invoice_number,status,customer_id,customer_name_snapshot,total_paise,paid_paise FROM invoices WHERE id=?`,
      input.invoiceId,
    );
    if (
      !inv ||
      !["finalized", "partially_paid", "overdue"].includes(inv.status)
    )
      throw new Error("Invoice unavailable");
    const outstanding = inv.total_paise - inv.paid_paise;
    if (input.amountPaise > outstanding) throw new Error("Overpayment");
    const id = await uuid(tx),
      now = new Date().toISOString();
    await tx.runAsync(
      `INSERT INTO payments(id,invoice_id,customer_id,amount_paise,payment_date,method,reference,notes,created_at,updated_at)VALUES(?,?,?,?,?,?,?,?,?,?)`,
      id,
      input.invoiceId,
      inv.customer_id,
      input.amountPaise,
      input.paymentDate,
      input.method,
      input.reference,
      input.notes,
      now,
      now,
    );
    const paid = inv.paid_paise + input.amountPaise,
      status = paid === inv.total_paise ? "paid" : "partially_paid";
    const u = await tx.runAsync(
      `UPDATE invoices SET paid_paise=?,status=?,updated_at=? WHERE id=? AND paid_paise=?`,
      paid,
      status,
      now,
      input.invoiceId,
      inv.paid_paise,
    );
    if (u.changes !== 1) throw new Error("Payment conflict");
    return id;
  });
}
export async function listInvoicePayments(
  invoiceId: string,
): Promise<Payment[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PayRow>(
    `SELECT id,invoice_id,amount_paise,payment_date,method,reference,notes FROM payments WHERE invoice_id=? ORDER BY payment_date DESC,created_at DESC`,
    invoiceId,
  );
  return rows.map((x) => ({
    id: x.id,
    invoiceId: x.invoice_id,
    amountPaise: x.amount_paise,
    paymentDate: x.payment_date,
    method: x.method,
    reference: x.reference,
    notes: x.notes,
  }));
}
export async function loadCustomerLedger(
  customerId: string,
): Promise<CustomerLedger | null> {
  const db = await getDatabase();
  const c = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM customers WHERE id=?`,
    customerId,
  );
  if (!c) return null;
  const invoices = await db.getAllAsync<{
    id: string;
    invoice_number: string;
    invoice_date: string;
    total_paise: number;
    paid_paise: number;
  }>(
    `SELECT id,invoice_number,invoice_date,total_paise,paid_paise FROM invoices WHERE customer_id=? AND status NOT IN('draft','cancelled') ORDER BY invoice_date`,
    customerId,
  );
  const pays = await db.getAllAsync<{
    id: string;
    payment_date: string;
    amount_paise: number;
    invoice_id: string;
  }>(
    `SELECT id,payment_date,amount_paise,invoice_id FROM payments WHERE customer_id=? ORDER BY payment_date`,
    customerId,
  );
  const entries: LedgerEntry[] = [
    ...invoices.map((x) => ({
      id: x.id,
      date: x.invoice_date,
      kind: "invoice" as const,
      label: x.invoice_number,
      debitPaise: x.total_paise,
      creditPaise: 0,
    })),
    ...pays.map((x) => ({
      id: x.id,
      date: x.payment_date,
      kind: "payment" as const,
      label: "Payment received",
      debitPaise: 0,
      creditPaise: x.amount_paise,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const invoiced = invoices.reduce((n, x) => n + x.total_paise, 0),
    paid = pays.reduce((n, x) => n + x.amount_paise, 0);
  return {
    customerName: c.name,
    invoicedPaise: invoiced,
    paidPaise: paid,
    outstandingPaise: invoiced - paid,
    entries,
  };
}
