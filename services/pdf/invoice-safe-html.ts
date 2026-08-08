import type { InvoicePdfData } from "@/types/invoice-pdf";

const escapeHtml = (value: string | null | undefined) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ] ?? character,
  );
const money = (paise: number) => `INR ${(paise / 100).toFixed(2)}`;

export function createSafeInvoiceHtml(data: InvoicePdfData): string {
  const rows = data.lines
    .map(
      (line, index) =>
        `<tr><td>${index + 1}</td><td>${escapeHtml(line.description)}</td><td>${(
          line.quantityScaled / 1000
        ).toFixed(3)}</td><td>${money(line.unitPricePaise)}</td><td>${money(
          line.lineTotalPaise,
        )}</td></tr>`,
    )
    .join("");
  const taxPaise = data.cgstPaise + data.sgstPaise + data.igstPaise;
  const balancePaise = Math.max(
    0,
    data.totalPaise - data.paidPaise - data.settlementDiscountPaise,
  );
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:sans-serif;color:#111;padding:16px}h1{font-size:22px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #bbb;padding:6px;text-align:left}.totals{margin-top:16px;text-align:right}.totals div{margin:5px 0}</style></head><body><h1>${escapeHtml(
    data.businessName,
  )}</h1><h2>${data.kind === "tax_invoice" ? "TAX INVOICE" : "INVOICE"} ${escapeHtml(
    data.invoiceNumber,
  )}</h2><div>Date: ${escapeHtml(data.invoiceDate)}</div><div>Customer: ${escapeHtml(
    data.customerName || "Cash customer",
  )}</div><table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div>Subtotal: ${money(
    data.subtotalPaise,
  )}</div><div>Tax: ${money(taxPaise)}</div><div><b>Total: ${money(
    data.totalPaise,
  )}</b></div><div>Paid: ${money(data.paidPaise)}</div><div>Balance due: ${money(
    balancePaise,
  )}</div></div></body></html>`;
}
