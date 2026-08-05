import type { SQLiteDatabase } from "expo-sqlite";

import { getDatabase } from "@/db/database";
import { runInTransaction } from "@/db/transaction";
import { calculateInvoice } from "@/lib/invoice-calculations";
import {
  deleteVerticalDetails,
  loadVerticalDetails,
  saveVerticalDetails,
} from "@/db/repositories/vertical-invoice-details";
import type {
  InvoiceDraft,
  InvoiceDraftInput,
  InvoiceDraftLine,
  InvoiceDraftListItem,
} from "@/types/invoice-draft";

type IdRow = { id: string };
type BusinessRow = {
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
type DraftRow = {
  id: string;
  kind: "tax_invoice" | "non_tax_invoice";
  customer_id: string | null;
  customer_name_snapshot: string | null;
  customer_state_code_snapshot: string | null;
  invoice_date: string;
  due_date: string | null;
  notes: string | null;
  business_state_code_snapshot: string | null;
};
type DraftLineRow = {
  id: string;
  item_id: string | null;
  item_type: "product" | "service";
  description_snapshot: string;
  sku_snapshot: string | null;
  unit_name_snapshot: string | null;
  quantity_scaled: number;
  unit_price_paise: number;
  cost_price_paise: number;
  discount_paise: number;
  gst_rate_basis_points: number;
};
type DraftListRow = {
  id: string;
  invoice_number: string;
  status: import("@/types/invoice-finalization").InvoiceRecordStatus;
  customer_name_snapshot: string | null;
  invoice_date: string;
  total_paise: number;
  updated_at: string;
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

export async function listRecentlySoldItemIds(limit = 6): Promise<string[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<IdRow>(
    `SELECT ii.item_id AS id FROM invoice_items ii
     JOIN invoices i ON i.id = ii.invoice_id
     WHERE ii.item_id IS NOT NULL AND i.status IN ('finalized','partially_paid','paid','overdue')
     GROUP BY ii.item_id ORDER BY MAX(i.updated_at) DESC LIMIT ?`,
    limit,
  );
  return rows.map((row) => row.id);
}

export async function getInvoiceDraftBusinessStateCode(): Promise<
  string | null
> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ state_code: string | null }>(
    "SELECT state_code FROM business_settings LIMIT 1",
  );
  return row?.state_code ?? null;
}

export async function listInvoiceDrafts(): Promise<InvoiceDraftListItem[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<DraftListRow>(
    `SELECT id, invoice_number, status, customer_name_snapshot, invoice_date, total_paise, updated_at
     FROM invoices ORDER BY updated_at DESC`,
  );
  return rows.map((row) => ({
    id: row.id,
    invoiceNumber: row.invoice_number,
    status: row.status,
    customerName: row.customer_name_snapshot,
    invoiceDate: row.invoice_date,
    totalPaise: row.total_paise,
    updatedAt: row.updated_at,
  }));
}

export async function loadInvoiceDraft(
  id: string,
): Promise<InvoiceDraft | null> {
  const database = await getDatabase();
  const draft = await database.getFirstAsync<DraftRow>(
    `SELECT id, kind, customer_id, customer_name_snapshot, customer_state_code_snapshot,
       invoice_date, due_date, notes, business_state_code_snapshot
     FROM invoices WHERE id = ? AND status = 'draft'`,
    id,
  );
  if (!draft) return null;
  const rows = await database.getAllAsync<DraftLineRow>(
    `SELECT id, item_id, item_type, description_snapshot, sku_snapshot, unit_name_snapshot,
       quantity_scaled, unit_price_paise, cost_price_paise, discount_paise, gst_rate_basis_points
     FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC`,
    id,
  );
  const verticalDetails = await loadVerticalDetails(id);
  const lines: InvoiceDraftLine[] = rows.map((row) => ({
    id: row.id,
    itemId: row.item_id,
    itemType: row.item_type,
    description: row.description_snapshot,
    sku: row.sku_snapshot,
    unitName: row.unit_name_snapshot,
    quantityScaled: row.quantity_scaled,
    unitPricePaise: row.unit_price_paise,
    costPricePaise: row.cost_price_paise,
    discountPaise: row.discount_paise,
    gstRateBasisPoints: row.gst_rate_basis_points,
  }));
  return {
    id: draft.id,
    kind: draft.kind,
    customerId: draft.customer_id,
    customerName: draft.customer_name_snapshot,
    customerStateCode: draft.customer_state_code_snapshot,
    invoiceDate: draft.invoice_date,
    dueDate: draft.due_date,
    notes: draft.notes,
    businessStateCode: draft.business_state_code_snapshot,
    lines,
    verticalDetails,
  };
}

export async function saveInvoiceDraft(
  input: InvoiceDraftInput,
): Promise<string> {
  const database = await getDatabase();
  return runInTransaction(database, async (transaction) => {
    const business = await transaction.getFirstAsync<BusinessRow>(
      `SELECT business_name, gstin, state_code, address, phone, email, logo_uri,
         signature_uri, payment_qr_uri, currency_code FROM business_settings LIMIT 1`,
    );
    if (!business) throw new Error("Business profile is required.");
    const customer = input.customerId
      ? await transaction.getFirstAsync<CustomerRow>(
          `SELECT id, name, phone, email, gstin, state_code, billing_address
           FROM customers WHERE id = ? AND is_archived = 0`,
          input.customerId,
        )
      : null;
    if (input.customerId && !customer)
      throw new Error("Selected customer is unavailable.");

    const calculation = calculateInvoice({
      kind: input.kind,
      businessStateCode: business.state_code,
      customerStateCode: customer?.state_code ?? null,
      lines: input.lines.map((line) => ({
        lineKey: line.id,
        quantityScaled: line.quantityScaled,
        unitPricePaise: line.unitPricePaise,
        discountPaise: line.discountPaise,
        gstRateBasisPoints: line.gstRateBasisPoints,
      })),
    });
    const timestamp = new Date().toISOString();
    const id = input.id ?? (await createUuid(transaction));
    const existing = input.id
      ? await transaction.getFirstAsync<IdRow>(
          `SELECT id FROM invoices WHERE id = ? AND status = 'draft'`,
          input.id,
        )
      : null;
    if (input.id && !existing) throw new Error("Draft is unavailable.");

    const values = [
      input.kind,
      customer?.id ?? null,
      input.invoiceDate,
      input.dueDate,
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
      input.notes,
      timestamp,
    ] as const;

    if (existing) {
      await transaction.runAsync(
        `UPDATE invoices SET kind=?, customer_id=?, invoice_date=?, due_date=?,
          customer_name_snapshot=?, customer_phone_snapshot=?, customer_email_snapshot=?,
          customer_gstin_snapshot=?, customer_state_code_snapshot=?, customer_billing_address_snapshot=?,
          business_name_snapshot=?, business_gstin_snapshot=?, business_state_code_snapshot=?,
          business_address_snapshot=?, business_phone_snapshot=?, business_email_snapshot=?,
          business_logo_uri_snapshot=?, business_signature_uri_snapshot=?,
          business_payment_qr_uri_snapshot=?, currency_code_snapshot=?, subtotal_paise=?,
          discount_paise=?, taxable_paise=?, cgst_paise=?, sgst_paise=?, igst_paise=?,
          rounding_paise=?, total_paise=?, notes=?, updated_at=? WHERE id=? AND status='draft'`,
        ...values,
        id,
      );
      await transaction.runAsync(
        "DELETE FROM invoice_items WHERE invoice_id = ?",
        id,
      );
    } else {
      await transaction.runAsync(
        `INSERT INTO invoices (
          id, invoice_number, kind, status, customer_id, invoice_date, due_date,
          customer_name_snapshot, customer_phone_snapshot, customer_email_snapshot,
          customer_gstin_snapshot, customer_state_code_snapshot, customer_billing_address_snapshot,
          business_name_snapshot, business_gstin_snapshot, business_state_code_snapshot,
          business_address_snapshot, business_phone_snapshot, business_email_snapshot,
          business_logo_uri_snapshot, business_signature_uri_snapshot,
          business_payment_qr_uri_snapshot, currency_code_snapshot, subtotal_paise,
          discount_paise, taxable_paise, cgst_paise, sgst_paise, igst_paise,
          rounding_paise, total_paise, paid_paise, notes, finalized_at, created_at, updated_at
        ) VALUES (
          ?, ?, ?, 'draft', ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NULL, ?, ?
        )`,
        id,
        `DRAFT-${id}`,
        ...values.slice(0, 29),
        timestamp,
        timestamp,
      );
    }

    for (let index = 0; index < input.lines.length; index += 1) {
      const line = input.lines[index];
      const calculated = calculation.lines[index];
      if (!line || !calculated)
        throw new Error("Invoice line calculation is unavailable.");
      const persistedLineId = await createUuid(transaction);
      await transaction.runAsync(
        `INSERT INTO invoice_items (
          id, invoice_id, item_id, item_type, description_snapshot, sku_snapshot,
          unit_name_snapshot, unit_short_name_snapshot, quantity_scaled, unit_price_paise,
          cost_price_paise, discount_paise, gst_rate_basis_points, taxable_paise,
          cgst_paise, sgst_paise, igst_paise, line_total_paise, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        persistedLineId,
        id,
        line.itemId,
        line.itemType,
        line.description,
        line.sku,
        line.unitName,
        line.quantityScaled,
        line.unitPricePaise,
        line.costPricePaise,
        line.discountPaise,
        line.gstRateBasisPoints,
        calculated.taxablePaise,
        calculated.cgstPaise,
        calculated.sgstPaise,
        calculated.igstPaise,
        calculated.lineTotalPaise,
        index,
      );
    }
    if (input.verticalDetails)
      await saveVerticalDetails(transaction, id, input.verticalDetails);
    else await deleteVerticalDetails(transaction, id);
    return id;
  });
}
