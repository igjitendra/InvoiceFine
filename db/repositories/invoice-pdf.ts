import { getDatabase } from "@/db/database";
import type { InvoicePdfData, InvoicePdfLine } from "@/types/invoice-pdf";
import { loadVerticalDetails } from "@/db/repositories/vertical-invoice-details";
type Row = {
  kind: "tax_invoice" | "non_tax_invoice";
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  customer_name_snapshot: string | null;
  customer_billing_address_snapshot: string | null;
  customer_gstin_snapshot: string | null;
  business_name_snapshot: string;
  business_address_snapshot: string;
  business_phone_snapshot: string;
  business_gstin_snapshot: string | null;
  business_logo_uri_snapshot: string | null;
  business_signature_uri_snapshot: string | null;
  subtotal_paise: number;
  discount_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  igst_paise: number;
  rounding_paise: number;
  total_paise: number;
  paid_paise: number;
  settlement_discount_paise: number;
  notes: string | null;
  invoice_page_size: "a4" | "4x6";
};
type Line = {
  description_snapshot: string;
  sku_snapshot: string | null;
  unit_name_snapshot: string | null;
  quantity_scaled: number;
  unit_price_paise: number;
  discount_paise: number;
  gst_rate_basis_points: number;
  line_total_paise: number;
};
export async function loadInvoicePdfData(
  id: string,
): Promise<InvoicePdfData | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Row>(
    `SELECT i.kind,i.invoice_number,i.invoice_date,i.due_date,i.customer_name_snapshot,i.customer_billing_address_snapshot,i.customer_gstin_snapshot,i.business_name_snapshot,i.business_address_snapshot,i.business_phone_snapshot,i.business_gstin_snapshot,i.business_logo_uri_snapshot,i.business_signature_uri_snapshot,i.subtotal_paise,i.discount_paise,i.cgst_paise,i.sgst_paise,i.igst_paise,i.rounding_paise,i.total_paise,i.paid_paise,i.settlement_discount_paise,i.notes,b.invoice_page_size FROM invoices i CROSS JOIN business_settings b WHERE i.id=? AND i.status<>'draft' LIMIT 1`,
    id,
  );
  if (!row) return null;
  const verticalDetails = await loadVerticalDetails(id);
  const lines = await db.getAllAsync<Line>(
    `SELECT description_snapshot,sku_snapshot,unit_name_snapshot,quantity_scaled,unit_price_paise,discount_paise,gst_rate_basis_points,line_total_paise FROM invoice_items WHERE invoice_id=? ORDER BY sort_order`,
    id,
  );
  return {
    kind: row.kind,
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    customerName: row.customer_name_snapshot,
    customerAddress: row.customer_billing_address_snapshot,
    customerGstin: row.customer_gstin_snapshot,
    businessName: row.business_name_snapshot,
    businessAddress: row.business_address_snapshot,
    businessPhone: row.business_phone_snapshot,
    businessGstin: row.business_gstin_snapshot,
    businessLogoUri: row.business_logo_uri_snapshot,
    businessSignatureUri: row.business_signature_uri_snapshot,
    subtotalPaise: row.subtotal_paise,
    discountPaise: row.discount_paise,
    cgstPaise: row.cgst_paise,
    sgstPaise: row.sgst_paise,
    igstPaise: row.igst_paise,
    roundingPaise: row.rounding_paise,
    totalPaise: row.total_paise,
    paidPaise: row.paid_paise,
    settlementDiscountPaise: row.settlement_discount_paise,
    notes: row.notes,
    pageSize: row.invoice_page_size,
    verticalDetails,
    lines: lines.map((x): InvoicePdfLine => ({
      description: x.description_snapshot,
      sku: x.sku_snapshot,
      unit: x.unit_name_snapshot,
      quantityScaled: x.quantity_scaled,
      unitPricePaise: x.unit_price_paise,
      discountPaise: x.discount_paise,
      gstRateBasisPoints: x.gst_rate_basis_points,
      lineTotalPaise: x.line_total_paise,
    })),
  };
}
