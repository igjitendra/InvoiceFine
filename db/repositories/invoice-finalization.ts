import type { SQLiteDatabase } from "expo-sqlite";

import { getDatabase } from "@/db/database";
import { runInTransaction } from "@/db/transaction";
import { calculateInvoice } from "@/lib/invoice-calculations";
import { loadVerticalDetails } from "@/db/repositories/vertical-invoice-details";
import type {
  FinalizationResult,
  FinalizedInvoiceSummary,
  InvoiceRecordStatus,
} from "@/types/invoice-finalization";

type IdRow = { id: string };
type InvoiceRow = {
  id: string;
  invoice_number: string;
  kind: "tax_invoice" | "non_tax_invoice";
  status: InvoiceRecordStatus;
  customer_id: string | null;
  paid_paise: number;
  settlement_discount_paise: number;
};
type BusinessRow = {
  id: string;
  business_name: string;
  gstin: string | null;
  state_code: string | null;
  address: string;
  phone: string;
  email: string | null;
  logo_uri: string | null;
  signature_uri: string | null;
  payment_qr_uri: string | null;
  currency_code: string;
  invoice_prefix: string;
  next_invoice_number: number;
};
type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  state_code: string | null;
  billing_address: string | null;
};
type LineRow = {
  id: string;
  item_id: string | null;
  item_type: "product" | "service";
  quantity_scaled: number;
  unit_price_paise: number;
  discount_paise: number;
  gst_rate_basis_points: number;
};
type StockMovementRow = {
  item_id: string;
  quantity_delta_scaled: number;
};
type SummaryRow = {
  id: string;
  invoice_number: string;
  status: InvoiceRecordStatus;
  customer_name_snapshot: string | null;
  invoice_date: string;
  subtotal_paise: number;
  discount_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  igst_paise: number;
  rounding_paise: number;
  total_paise: number;
  paid_paise: number;
  settlement_discount_paise: number;
};
type SummaryLineRow = {
  description_snapshot: string;
  quantity_scaled: number;
  line_total_paise: number;
};

async function createUuid(database: SQLiteDatabase): Promise<string> {
  const row = await database.getFirstAsync<IdRow>(`
    SELECT lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
      substr(lower(hex(randomblob(2))), 2) || '-' ||
      substr('89ab', abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))), 2) || '-' ||
      lower(hex(randomblob(6))) AS id
  `);
  if (!row) throw new Error("Unable to generate an ID.");
  return row.id;
}

function formatInvoiceNumber(prefix: string, nextNumber: number): string {
  const normalizedPrefix = prefix.trim().toUpperCase();
  if (!/^[A-Z0-9/-]{2,10}$/.test(normalizedPrefix)) {
    throw new Error("Invoice prefix is invalid.");
  }
  if (!Number.isSafeInteger(nextNumber) || nextNumber <= 0) {
    throw new Error("Next invoice number is invalid.");
  }
  return `${normalizedPrefix}-${String(nextNumber).padStart(4, "0")}`;
}

export async function getInvoiceStatus(
  id: string,
): Promise<InvoiceRecordStatus | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ status: InvoiceRecordStatus }>(
    "SELECT status FROM invoices WHERE id = ?",
    id,
  );
  return row?.status ?? null;
}

export async function finalizeInvoice(id: string): Promise<FinalizationResult> {
  const database = await getDatabase();
  return runInTransaction(database, async (transaction) => {
    const invoice = await transaction.getFirstAsync<InvoiceRow>(
      `SELECT id, invoice_number, kind, status, customer_id, paid_paise
       FROM invoices WHERE id = ?`,
      id,
    );
    if (!invoice) throw new Error("Invoice is unavailable.");
    if (invoice.status === "finalized") {
      return { invoiceNumber: invoice.invoice_number, alreadyFinalized: true };
    }
    if (invoice.status !== "draft")
      throw new Error("Only a draft invoice can be finalized.");

    const business = await transaction.getFirstAsync<BusinessRow>(
      `SELECT id, business_name, gstin, state_code, address, phone, email, logo_uri,
        signature_uri, payment_qr_uri, currency_code, invoice_prefix, next_invoice_number
       FROM business_settings LIMIT 1`,
    );
    if (!business) throw new Error("Business profile is required.");
    const customer = invoice.customer_id
      ? await transaction.getFirstAsync<CustomerRow>(
          `SELECT id, name, phone, email, gstin, state_code, billing_address
           FROM customers WHERE id = ? AND is_archived = 0`,
          invoice.customer_id,
        )
      : null;
    if (invoice.customer_id && !customer)
      throw new Error("Selected customer is unavailable.");

    const lines = await transaction.getAllAsync<LineRow>(
      `SELECT id, item_id, item_type, quantity_scaled, unit_price_paise,
        discount_paise, gst_rate_basis_points
       FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC`,
      id,
    );
    const calculation = calculateInvoice({
      kind: invoice.kind,
      businessStateCode: business.state_code,
      customerStateCode: customer?.state_code ?? null,
      lines: lines.map((line) => ({
        lineKey: line.id,
        quantityScaled: line.quantity_scaled,
        unitPricePaise: line.unit_price_paise,
        discountPaise: line.discount_paise,
        gstRateBasisPoints: line.gst_rate_basis_points,
      })),
    });

    const timestamp = new Date().toISOString();
    const invoiceNumber = formatInvoiceNumber(
      business.invoice_prefix,
      business.next_invoice_number,
    );

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const calculatedLine = calculation.lines[index];
      if (!line || !calculatedLine) {
        throw new Error("Invoice line calculation is unavailable.");
      }
      await transaction.runAsync(
        `UPDATE invoice_items SET taxable_paise = ?, cgst_paise = ?, sgst_paise = ?,
          igst_paise = ?, line_total_paise = ? WHERE id = ? AND invoice_id = ?`,
        calculatedLine.taxablePaise,
        calculatedLine.cgstPaise,
        calculatedLine.sgstPaise,
        calculatedLine.igstPaise,
        calculatedLine.lineTotalPaise,
        line.id,
        id,
      );
      if (line.item_type !== "product") continue;
      if (!line.item_id)
        throw new Error("A product line must reference a catalog product.");
      const updated = await transaction.runAsync(
        `UPDATE items SET current_stock_scaled = current_stock_scaled - ?, updated_at = ?
         WHERE id = ? AND type = 'product' AND is_archived = 0`,
        line.quantity_scaled,
        timestamp,
        line.item_id,
      );
      if (updated.changes !== 1) throw new Error("A product is unavailable.");
      await transaction.runAsync(
        `INSERT INTO stock_movements (
          id, item_id, type, quantity_delta_scaled, reference_type, reference_id,
          reason, occurred_at, created_at
        ) VALUES (?, ?, 'sale', ?, 'invoice', ?, NULL, ?, ?)`,
        await createUuid(transaction),
        line.item_id,
        -line.quantity_scaled,
        id,
        timestamp,
        timestamp,
      );
    }

    const updatedInvoice = await transaction.runAsync(
      `UPDATE invoices SET invoice_number = ?, status = 'finalized',
        customer_name_snapshot = ?, customer_phone_snapshot = ?, customer_email_snapshot = ?,
        customer_gstin_snapshot = ?, customer_state_code_snapshot = ?,
        customer_billing_address_snapshot = ?, business_name_snapshot = ?,
        business_gstin_snapshot = ?, business_state_code_snapshot = ?,
        business_address_snapshot = ?, business_phone_snapshot = ?, business_email_snapshot = ?,
        business_logo_uri_snapshot = ?, business_signature_uri_snapshot = ?,
        business_payment_qr_uri_snapshot = ?, currency_code_snapshot = ?, subtotal_paise = ?,
        discount_paise = ?, taxable_paise = ?, cgst_paise = ?, sgst_paise = ?,
        igst_paise = ?, rounding_paise = ?, total_paise = ?, finalized_at = ?, updated_at = ?
       WHERE id = ? AND status = 'draft'`,
      invoiceNumber,
      customer?.name ?? null,
      customer?.phone ?? null,
      customer?.email ?? null,
      customer?.gstin ?? null,
      customer?.state_code ?? null,
      customer?.billing_address ?? null,
      business.business_name,
      business.gstin,
      business.state_code,
      business.address,
      business.phone,
      business.email,
      business.logo_uri,
      business.signature_uri,
      business.payment_qr_uri,
      business.currency_code,
      calculation.subtotalPaise,
      calculation.discountPaise,
      calculation.taxablePaise,
      calculation.cgstPaise,
      calculation.sgstPaise,
      calculation.igstPaise,
      calculation.roundingPaise,
      calculation.totalPaise,
      timestamp,
      timestamp,
      id,
    );
    if (updatedInvoice.changes !== 1)
      throw new Error("Invoice finalization did not complete.");

    const numbering = await transaction.runAsync(
      `UPDATE business_settings SET next_invoice_number = next_invoice_number + 1,
        updated_at = ? WHERE id = ? AND next_invoice_number = ?`,
      timestamp,
      business.id,
      business.next_invoice_number,
    );
    if (numbering.changes !== 1)
      throw new Error("Invoice number allocation did not complete.");
    return { invoiceNumber, alreadyFinalized: false };
  });
}

export async function cancelFinalizedInvoice(id: string): Promise<boolean> {
  const database = await getDatabase();
  return runInTransaction(database, async (transaction) => {
    const invoice = await transaction.getFirstAsync<InvoiceRow>(
      `SELECT id, invoice_number, kind, status, customer_id, paid_paise
       FROM invoices WHERE id = ?`,
      id,
    );
    if (!invoice) throw new Error("Invoice is unavailable.");
    if (invoice.status === "cancelled") return false;
    if (invoice.status !== "finalized")
      throw new Error("Only an unpaid finalized invoice can be cancelled.");
    if (invoice.paid_paise !== 0)
      throw new Error("An invoice with payments cannot be cancelled.");

    const movements = await transaction.getAllAsync<StockMovementRow>(
      `SELECT item_id, quantity_delta_scaled FROM stock_movements
       WHERE reference_type = 'invoice' AND reference_id = ? AND type = 'sale'`,
      id,
    );
    const timestamp = new Date().toISOString();
    for (const movement of movements) {
      const reversalQuantity = -movement.quantity_delta_scaled;
      if (reversalQuantity <= 0)
        throw new Error("Stock reversal quantity is invalid.");
      await transaction.runAsync(
        "UPDATE items SET current_stock_scaled = current_stock_scaled + ?, updated_at = ? WHERE id = ?",
        reversalQuantity,
        timestamp,
        movement.item_id,
      );
      await transaction.runAsync(
        `INSERT INTO stock_movements (
          id, item_id, type, quantity_delta_scaled, reference_type, reference_id,
          reason, occurred_at, created_at
        ) VALUES (?, ?, 'sale_reversal', ?, 'invoice', ?, 'Invoice cancellation', ?, ?)`,
        await createUuid(transaction),
        movement.item_id,
        reversalQuantity,
        id,
        timestamp,
        timestamp,
      );
    }
    const result = await transaction.runAsync(
      `UPDATE invoices SET status = 'cancelled', updated_at = ?
       WHERE id = ? AND status = 'finalized'`,
      timestamp,
      id,
    );
    if (result.changes !== 1)
      throw new Error("Invoice cancellation did not complete.");
    return true;
  });
}

export async function loadFinalizedInvoiceSummary(
  id: string,
): Promise<FinalizedInvoiceSummary | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<SummaryRow>(
    `SELECT id, invoice_number, status, customer_name_snapshot, invoice_date,
      subtotal_paise, discount_paise, cgst_paise, sgst_paise, igst_paise,
      rounding_paise, total_paise, paid_paise, settlement_discount_paise
     FROM invoices WHERE id = ? AND status <> 'draft'`,
    id,
  );
  if (!row) return null;
  const lineRows = await database.getAllAsync<SummaryLineRow>(
    `SELECT description_snapshot, quantity_scaled, line_total_paise
     FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC`,
    id,
  );
  const verticalDetails = await loadVerticalDetails(id);
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    status: row.status,
    customerName: row.customer_name_snapshot,
    invoiceDate: row.invoice_date,
    subtotalPaise: row.subtotal_paise,
    discountPaise: row.discount_paise,
    cgstPaise: row.cgst_paise,
    sgstPaise: row.sgst_paise,
    igstPaise: row.igst_paise,
    roundingPaise: row.rounding_paise,
    totalPaise: row.total_paise,
    paidPaise: row.paid_paise,
    settlementDiscountPaise: row.settlement_discount_paise,
    verticalDetails,
    lines: lineRows.map((line) => ({
      description: line.description_snapshot,
      quantityScaled: line.quantity_scaled,
      lineTotalPaise: line.line_total_paise,
    })),
  };
}
