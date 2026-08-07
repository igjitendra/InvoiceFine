import { equal, match, doesNotMatch } from "./assertions";
import { verticalDetailEntries } from "../lib/vertical-details";
import { createInvoiceHtml } from "../services/pdf/invoice-html";
import { createEmptyVerticalDetails } from "../types/vertical-workflow";
import type { InvoicePdfData } from "../types/invoice-pdf";

const details = createEmptyVerticalDetails("repair");
details.imei = "123456789012345";
details.model = "Example Phone";
details.problem = "Display not working";
details.technician = "Team A";

const rows = verticalDetailEntries(details);
equal(
  rows.some((row) => row.label === "IMEI" && row.value === details.imei),
  true,
);
equal(
  rows.some((row) => row.label === "Problem"),
  true,
);
equal(
  rows.some((row) => row.label === "Warranty"),
  false,
);

const invoice: InvoicePdfData = {
  kind: "non_tax_invoice",
  invoiceNumber: "INV-0001",
  invoiceDate: "2026-08-05",
  dueDate: null,
  customerName: "Customer",
  customerAddress: null,
  customerGstin: null,
  businessName: "Repair Shop",
  businessAddress: "India",
  businessPhone: "9999999999",
  businessGstin: null,
  businessLogoUri: null,
  businessSignatureUri: null,
  subtotalPaise: 10000,
  discountPaise: 0,
  cgstPaise: 0,
  sgstPaise: 0,
  igstPaise: 0,
  roundingPaise: 0,
  totalPaise: 10000,
  paidPaise: 0,
  settlementDiscountPaise: 0,
  notes: null,
  pageSize: "a4",
  verticalDetails: details,
  lines: [
    {
      description: "Repair service",
      sku: null,
      unit: "job",
      quantityScaled: 1000,
      unitPricePaise: 10000,
      discountPaise: 0,
      gstRateBasisPoints: 0,
      lineTotalPaise: 10000,
    },
  ],
};
const html = createInvoiceHtml(invoice);
match(html, /Repair details/);
match(html, /123456789012345/);
match(html, /Display not working/);
doesNotMatch(html, />Warranty</);
console.log("VERTICAL_INVOICE_TESTS=PASS");
