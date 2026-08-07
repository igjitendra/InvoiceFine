import { createInvoiceHtml } from "../services/pdf/invoice-html";
import type { InvoicePdfData } from "../types/invoice-pdf";

function assertIncludes(value: string, expected: string, label: string): void {
  if (!value.includes(expected))
    throw new Error(`${label}: missing ${expected}`);
}
function assertExcludes(value: string, expected: string, label: string): void {
  if (value.includes(expected))
    throw new Error(`${label}: unexpectedly found ${expected}`);
}

const base: InvoicePdfData = {
  kind: "non_tax_invoice",
  invoiceNumber: "INV-0001",
  invoiceDate: "2026-08-07",
  dueDate: "2026-08-07",
  customerName: "Test Customer",
  customerAddress: "Unnao, Uttar Pradesh",
  customerGstin: "09ABCDE1234F1Z5",
  businessName: "Pandit Khera Store",
  businessAddress: "Pandit Khera",
  businessPhone: "9999999999",
  businessGstin: "09ABCDE1234F1Z5",
  businessLogoUri: "data:image/png;base64,LOGO",
  businessSignatureUri: "data:image/png;base64,SIGNATURE",
  subtotalPaise: 23_000,
  discountPaise: 0,
  cgstPaise: 0,
  sgstPaise: 0,
  igstPaise: 0,
  roundingPaise: 0,
  totalPaise: 23_000,
  paidPaise: 20_000,
  settlementDiscountPaise: 0,
  notes: "Test invoice",
  pageSize: "4x6",
  verticalDetails: null,
  lines: [
    {
      description: "LED bulb",
      sku: "BULB-9W",
      unit: "pcs",
      quantityScaled: 2000,
      unitPricePaise: 11_500,
      discountPaise: 0,
      gstRateBasisPoints: 1800,
      lineTotalPaise: 23_000,
    },
  ],
};

const nonTax = createInvoiceHtml(base);
assertIncludes(nonTax, "Pandit Khera Store", "Business name");
assertIncludes(nonTax, "data:image/png;base64,LOGO", "Business logo");
assertIncludes(nonTax, "data:image/png;base64,SIGNATURE", "Signature");
assertIncludes(nonTax, "Authorized signature", "Signature label");
assertIncludes(nonTax, "<span>Paid</span><span>₹200.00", "Partial paid amount");
assertIncludes(nonTax, "<span>Balance due</span><span>₹30.00", "Balance due");
assertExcludes(nonTax, "<th>GST</th>", "Non-tax GST column");
assertExcludes(nonTax, "GSTIN:", "Non-tax GST identities");
assertExcludes(nonTax, ">18%</td>", "Non-tax GST rate");

const tax = createInvoiceHtml({
  ...base,
  kind: "tax_invoice",
  subtotalPaise: 20_000,
  cgstPaise: 1800,
  sgstPaise: 1800,
  totalPaise: 23_600,
  paidPaise: 20_000,
  lines: [{ ...base.lines[0]!, lineTotalPaise: 23_600 }],
});
assertIncludes(tax, "TAX INVOICE", "Tax invoice heading");
assertIncludes(tax, "<th>GST</th>", "Tax GST column");
assertIncludes(tax, ">18%</td>", "Tax GST rate");
assertIncludes(tax, "<span>CGST</span><span>₹18.00", "CGST total");
assertIncludes(tax, "<span>SGST</span><span>₹18.00", "SGST total");
assertIncludes(tax, "<span>Balance due</span><span>₹36.00", "Tax balance due");

const settled = createInvoiceHtml({
  ...base,
  settlementDiscountPaise: 3000,
});
assertIncludes(
  settled,
  "<span>Payment discount</span><span>₹30.00",
  "Payment discount",
);
assertIncludes(
  settled,
  "<span>Balance due</span><span>₹0.00",
  "Settled balance",
);

console.log("INVOICE_PDF_IDENTITY=PASS");
console.log("NON_TAX_PDF_GST_HIDDEN=PASS");
console.log("TAX_PDF_TOTALS=PASS");
console.log("PARTIAL_PAYMENT_PDF=PASS");
console.log("PAYMENT_DISCOUNT_PDF=PASS");
