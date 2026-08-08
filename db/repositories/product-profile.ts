import type { SQLiteDatabase } from "expo-sqlite";

import { getDatabase } from "@/db/database";
import { runInTransaction } from "@/db/transaction";
import type {
  ProductProfile,
  ProductSaleHistory,
  ProductStockMovement,
} from "@/types/product-profile";

type IdRow = { id: string };
type SaleRow = {
  invoice_id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string | null;
  quantity_scaled: number;
  sales_paise: number;
  status: ProductSaleHistory["status"];
};
type MovementRow = {
  id: string;
  type: ProductStockMovement["type"];
  quantity_delta_scaled: number;
  reason: string | null;
  occurred_at: string;
  invoice_id: string | null;
  invoice_number: string | null;
};

async function createUuid(database: SQLiteDatabase): Promise<string> {
  const row = await database.getFirstAsync<IdRow>(`
    SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
      substr(lower(hex(randomblob(2))), 2) || '-' ||
      substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
      lower(hex(randomblob(6))) AS id
  `);
  if (!row) throw new Error("Unable to generate a stock movement ID.");
  return row.id;
}

export async function loadProductProfile(itemId: string): Promise<ProductProfile> {
  const db = await getDatabase();
  const [sales, movements] = await Promise.all([
    db.getAllAsync<SaleRow>(
      `SELECT i.id invoice_id,i.invoice_number,i.invoice_date,
        i.customer_name_snapshot customer_name,SUM(ii.quantity_scaled) quantity_scaled,
        SUM(ii.line_total_paise) sales_paise,i.status
       FROM invoice_items ii JOIN invoices i ON i.id=ii.invoice_id
       WHERE ii.item_id=? AND i.status IN('finalized','partially_paid','paid','overdue')
       GROUP BY i.id,i.invoice_number,i.invoice_date,i.customer_name_snapshot,i.status
       ORDER BY i.invoice_date DESC,i.updated_at DESC`,
      itemId,
    ),
    db.getAllAsync<MovementRow>(
      `SELECT sm.id,sm.type,sm.quantity_delta_scaled,sm.reason,sm.occurred_at,
        CASE WHEN sm.reference_type='invoice' THEN sm.reference_id ELSE NULL END invoice_id,
        i.invoice_number
       FROM stock_movements sm
       LEFT JOIN invoices i ON sm.reference_type='invoice' AND i.id=sm.reference_id
       WHERE sm.item_id=? ORDER BY sm.occurred_at DESC,sm.created_at DESC LIMIT 100`,
      itemId,
    ),
  ]);
  return {
    totalSoldScaled: sales.reduce((sum, row) => sum + row.quantity_scaled, 0),
    totalSalesPaise: sales.reduce((sum, row) => sum + row.sales_paise, 0),
    saleCount: sales.length,
    sales: sales.map((row) => ({
      invoiceId: row.invoice_id,
      invoiceNumber: row.invoice_number,
      invoiceDate: row.invoice_date,
      customerName: row.customer_name,
      quantityScaled: row.quantity_scaled,
      salesPaise: row.sales_paise,
      status: row.status,
    })),
    movements: movements.map((row) => ({
      id: row.id,
      type: row.type,
      quantityDeltaScaled: row.quantity_delta_scaled,
      reason: row.reason,
      occurredAt: row.occurred_at,
      invoiceId: row.invoice_id,
      invoiceNumber: row.invoice_number,
    })),
  };
}

export async function addProductStock(
  itemId: string,
  quantityScaled: number,
  reason: string,
): Promise<void> {
  if (!Number.isSafeInteger(quantityScaled) || quantityScaled <= 0)
    throw new Error("Stock quantity must be greater than zero.");
  const db = await getDatabase();
  await runInTransaction(db, async (transaction) => {
    const timestamp = new Date().toISOString();
    const updated = await transaction.runAsync(
      `UPDATE items SET current_stock_scaled=current_stock_scaled+?,updated_at=?
       WHERE id=? AND type='product' AND is_archived=0`,
      quantityScaled,
      timestamp,
      itemId,
    );
    if (updated.changes !== 1) throw new Error("Product is unavailable.");
    await transaction.runAsync(
      `INSERT INTO stock_movements(
        id,item_id,type,quantity_delta_scaled,reference_type,reference_id,reason,occurred_at,created_at
       ) VALUES(?,?,'manual_in',?,'item',?,?,?,?)`,
      await createUuid(transaction),
      itemId,
      quantityScaled,
      itemId,
      reason.trim() || "Stock added",
      timestamp,
      timestamp,
    );
  });
}
