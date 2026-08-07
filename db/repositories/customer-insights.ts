import { getDatabase } from "@/db/database";
import type { CustomerInsights } from "@/types/customer-insights";
type Totals = {
  total_sales: number;
  received: number;
  outstanding: number;
  invoice_count: number;
};
export async function loadCustomerInsights(
  customerId: string,
): Promise<CustomerInsights> {
  const db = await getDatabase();
  const [totals, lastInvoice, lastPayment] = await Promise.all([
    db.getFirstAsync<Totals>(
      `SELECT COALESCE(SUM(total_paise),0) total_sales,COALESCE(SUM(paid_paise),0) received,COALESCE(SUM(total_paise-paid_paise-settlement_discount_paise),0) outstanding,COUNT(*) invoice_count FROM invoices WHERE customer_id=? AND status NOT IN('draft','cancelled')`,
      customerId,
    ),
    db.getFirstAsync<{
      id: string;
      invoice_number: string;
      invoice_date: string;
      total_paise: number;
    }>(
      `SELECT id,invoice_number,invoice_date,total_paise FROM invoices WHERE customer_id=? AND status NOT IN('draft','cancelled') ORDER BY invoice_date DESC,updated_at DESC LIMIT 1`,
      customerId,
    ),
    db.getFirstAsync<{
      id: string;
      payment_date: string;
      amount_paise: number;
      method: string;
    }>(
      `SELECT id,payment_date,amount_paise,method FROM payments WHERE customer_id=? ORDER BY payment_date DESC,created_at DESC LIMIT 1`,
      customerId,
    ),
  ]);
  return {
    totalSalesPaise: totals?.total_sales ?? 0,
    receivedPaise: totals?.received ?? 0,
    outstandingPaise: totals?.outstanding ?? 0,
    invoiceCount: totals?.invoice_count ?? 0,
    lastInvoice: lastInvoice
      ? {
          id: lastInvoice.id,
          invoiceNumber: lastInvoice.invoice_number,
          invoiceDate: lastInvoice.invoice_date,
          totalPaise: lastInvoice.total_paise,
        }
      : null,
    lastPayment: lastPayment
      ? {
          id: lastPayment.id,
          paymentDate: lastPayment.payment_date,
          amountPaise: lastPayment.amount_paise,
          method: lastPayment.method,
        }
      : null,
  };
}
