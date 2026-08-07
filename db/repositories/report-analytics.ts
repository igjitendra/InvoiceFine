import { getDatabase } from "@/db/database";
import { getProfitReport } from "./expenses";
import { isValidDateRange } from "@/lib/date";
import type {
  ExpenseBreakdown,
  MonthlyBusinessPoint,
  PaymentStatusBreakdown,
  ReportAnalytics,
  SalesCategory,
  TopProduct,
} from "@/types/report-analytics";
export async function loadReportAnalytics(
  startDate: string,
  endDate: string,
): Promise<ReportAnalytics> {
  if (!isValidDateRange(startDate, endDate))
    throw new Error("Invalid date range");
  const db = await getDatabase();
  const [
    summary,
    salesRows,
    costRows,
    expenseRows,
    breakdownRows,
    productRows,
    categoryRows,
    paymentRow,
  ] = await Promise.all([
    getProfitReport(startDate, endDate),
    db.getAllAsync<{ month: string; value: number }>(
      `SELECT substr(invoice_date,1,7) month,COALESCE(SUM(taxable_paise),0)value FROM invoices WHERE invoice_date BETWEEN ? AND ? AND status IN('finalized','partially_paid','paid','overdue') GROUP BY substr(invoice_date,1,7) ORDER BY month`,
      startDate,
      endDate,
    ),
    db.getAllAsync<{ month: string; value: number }>(
      `SELECT substr(i.invoice_date,1,7) month,COALESCE(SUM((ii.cost_price_paise*ii.quantity_scaled+500)/1000),0)value FROM invoice_items ii JOIN invoices i ON i.id=ii.invoice_id WHERE i.invoice_date BETWEEN ? AND ? AND i.status IN('finalized','partially_paid','paid','overdue') AND ii.item_type='product' GROUP BY substr(i.invoice_date,1,7) ORDER BY month`,
      startDate,
      endDate,
    ),
    db.getAllAsync<{ month: string; value: number }>(
      `SELECT substr(expense_date,1,7) month,COALESCE(SUM(amount_paise),0)value FROM expenses WHERE expense_date BETWEEN ? AND ? GROUP BY substr(expense_date,1,7) ORDER BY month`,
      startDate,
      endDate,
    ),
    db.getAllAsync<{ category: string; amount_paise: number }>(
      `SELECT c.name category,SUM(e.amount_paise)amount_paise FROM expenses e JOIN categories c ON c.id=e.category_id WHERE e.expense_date BETWEEN ? AND ? GROUP BY e.category_id,c.name ORDER BY amount_paise DESC LIMIT 8`,
      startDate,
      endDate,
    ),
    db.getAllAsync<{
      item_id: string | null;
      name: string;
      quantity_scaled: number;
      sales_paise: number;
    }>(
      `SELECT ii.item_id,ii.description_snapshot name,SUM(ii.quantity_scaled)quantity_scaled,SUM(ii.line_total_paise)sales_paise FROM invoice_items ii JOIN invoices i ON i.id=ii.invoice_id WHERE i.invoice_date BETWEEN ? AND ? AND i.status IN('finalized','partially_paid','paid','overdue') GROUP BY ii.item_id,ii.description_snapshot ORDER BY sales_paise DESC LIMIT 5`,
      startDate,
      endDate,
    ),
    db.getAllAsync<{ category: string; sales_paise: number }>(
      `SELECT COALESCE(c.name,'Uncategorized')category,SUM(ii.taxable_paise)sales_paise FROM invoice_items ii JOIN invoices i ON i.id=ii.invoice_id LEFT JOIN items it ON it.id=ii.item_id LEFT JOIN categories c ON c.id=it.category_id WHERE i.invoice_date BETWEEN ? AND ? AND i.status IN('finalized','partially_paid','paid','overdue') GROUP BY COALESCE(c.name,'Uncategorized') ORDER BY sales_paise DESC LIMIT 8`,
      startDate,
      endDate,
    ),
    db.getFirstAsync<{ paid_paise: number; pending_paise: number }>(
      `SELECT COALESCE(SUM(paid_paise),0)paid_paise,COALESCE(SUM(total_paise-paid_paise-settlement_discount_paise),0)pending_paise FROM invoices WHERE invoice_date BETWEEN ? AND ? AND status IN('finalized','partially_paid','paid','overdue')`,
      startDate,
      endDate,
    ),
  ]);
  const months = new Set(
    [...salesRows, ...costRows, ...expenseRows].map((x) => x.month),
  );
  const monthly: MonthlyBusinessPoint[] = [...months].sort().map((month) => {
    const sales = salesRows.find((x) => x.month === month)?.value ?? 0,
      cost = costRows.find((x) => x.month === month)?.value ?? 0,
      expense = expenseRows.find((x) => x.month === month)?.value ?? 0;
    return { month, salesPaise: sales, profitPaise: sales - cost - expense };
  });
  const expenses: ExpenseBreakdown[] = breakdownRows.map((x) => ({
    category: x.category,
    amountPaise: x.amount_paise,
  }));
  const topProducts: TopProduct[] = productRows.map((x) => ({
    itemId: x.item_id,
    name: x.name,
    quantityScaled: x.quantity_scaled,
    salesPaise: x.sales_paise,
  }));
  const salesByCategory: SalesCategory[] = categoryRows.map((x) => ({
    category: x.category,
    salesPaise: x.sales_paise,
  }));
  const paymentStatus: PaymentStatusBreakdown = {
    paidPaise: paymentRow?.paid_paise ?? 0,
    pendingPaise: paymentRow?.pending_paise ?? 0,
  };
  return {
    summary,
    monthly,
    expenses,
    topProducts,
    salesByCategory,
    paymentStatus,
  };
}
