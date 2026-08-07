import {
  calculateInvoice,
  calculateOutstandingPaise,
  resolveInvoiceTaxMode,
} from "../lib/invoice-calculations";

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${String(expected)}, received ${String(actual)}`,
    );
  }
}

function assertThrows(task: () => void, label: string): void {
  let threw = false;
  try {
    task();
  } catch {
    threw = true;
  }
  if (!threw) throw new Error(`${label}: expected an error.`);
}

const intraState = calculateInvoice({
  kind: "tax_invoice",
  businessStateCode: "09",
  customerStateCode: "09",
  roundToWholeRupee: false,
  lines: [
    {
      lineKey: "intra",
      quantityScaled: 1000,
      unitPricePaise: 10_000,
      discountPaise: 1000,
      gstRateBasisPoints: 1800,
    },
  ],
});
assertEqual(intraState.taxMode, "intra_state", "Intra-state mode");
assertEqual(intraState.subtotalPaise, 10_000, "Subtotal");
assertEqual(intraState.discountPaise, 1000, "Discount");
assertEqual(intraState.taxablePaise, 9000, "Taxable amount");
assertEqual(intraState.cgstPaise, 810, "CGST");
assertEqual(intraState.sgstPaise, 810, "SGST");
assertEqual(intraState.igstPaise, 0, "Intra-state IGST");
assertEqual(intraState.totalPaise, 10_620, "Intra-state total");

const interState = calculateInvoice({
  kind: "tax_invoice",
  businessStateCode: "09",
  customerStateCode: "27",
  roundToWholeRupee: false,
  lines: [
    {
      lineKey: "inter",
      quantityScaled: 1000,
      unitPricePaise: 10_000,
      discountPaise: 0,
      gstRateBasisPoints: 1800,
    },
  ],
});
assertEqual(interState.taxMode, "inter_state", "Inter-state mode");
assertEqual(interState.cgstPaise, 0, "Inter-state CGST");
assertEqual(interState.sgstPaise, 0, "Inter-state SGST");
assertEqual(interState.igstPaise, 1800, "IGST");
assertEqual(interState.totalPaise, 11_800, "Inter-state total");

const quantityBoundary = calculateInvoice({
  kind: "non_tax_invoice",
  businessStateCode: null,
  customerStateCode: null,
  roundToWholeRupee: false,
  lines: [
    {
      lineKey: "fractional",
      quantityScaled: 1500,
      unitPricePaise: 199,
      discountPaise: 0,
      gstRateBasisPoints: 1800,
    },
  ],
});
assertEqual(
  quantityBoundary.subtotalPaise,
  299,
  "Half-up quantity multiplication",
);
assertEqual(quantityBoundary.taxPaise, 0, "Non-tax invoice ignores GST");

const oddTax = calculateInvoice({
  kind: "tax_invoice",
  businessStateCode: "09",
  customerStateCode: "09",
  roundToWholeRupee: false,
  lines: [
    {
      lineKey: "odd-tax",
      quantityScaled: 1000,
      unitPricePaise: 101,
      discountPaise: 0,
      gstRateBasisPoints: 500,
    },
  ],
});
assertEqual(oddTax.taxPaise, 5, "Odd tax amount");
assertEqual(oddTax.cgstPaise, 2, "Odd CGST split");
assertEqual(oddTax.sgstPaise, 3, "Odd SGST split");

const roundDown = calculateInvoice({
  kind: "non_tax_invoice",
  businessStateCode: null,
  customerStateCode: null,
  lines: [
    {
      lineKey: "down",
      quantityScaled: 1000,
      unitPricePaise: 101,
      discountPaise: 0,
      gstRateBasisPoints: 0,
    },
  ],
});
assertEqual(roundDown.roundingPaise, -1, "Round-down adjustment");
assertEqual(roundDown.totalPaise, 100, "Rounded-down total");

const roundUp = calculateInvoice({
  kind: "non_tax_invoice",
  businessStateCode: null,
  customerStateCode: null,
  lines: [
    {
      lineKey: "up",
      quantityScaled: 1000,
      unitPricePaise: 150,
      discountPaise: 0,
      gstRateBasisPoints: 0,
    },
  ],
});
assertEqual(roundUp.roundingPaise, 50, "Half-up rupee adjustment");
assertEqual(roundUp.totalPaise, 200, "Half-up rupee total");

assertEqual(
  resolveInvoiceTaxMode("non_tax_invoice", null, null),
  "none",
  "Non-tax mode",
);
assertEqual(
  calculateOutstandingPaise(10_000, 2500),
  7500,
  "Outstanding amount",
);
assertEqual(
  resolveInvoiceTaxMode("tax_invoice", "09", null),
  "intra_state",
  "Missing customer state defaults to local sale",
);
assertThrows(
  () => resolveInvoiceTaxMode("tax_invoice", null, "09"),
  "Missing business state",
);
assertThrows(() => calculateOutstandingPaise(100, 101), "Overpayment");
assertThrows(
  () =>
    calculateInvoice({
      kind: "non_tax_invoice",
      businessStateCode: null,
      customerStateCode: null,
      lines: [
        {
          lineKey: "discount",
          quantityScaled: 1000,
          unitPricePaise: 100,
          discountPaise: 101,
          gstRateBasisPoints: 0,
        },
      ],
    }),
  "Discount above subtotal",
);
assertThrows(
  () =>
    calculateInvoice({
      kind: "non_tax_invoice",
      businessStateCode: null,
      customerStateCode: null,
      lines: [
        {
          lineKey: "duplicate",
          quantityScaled: 1000,
          unitPricePaise: 100,
          discountPaise: 0,
          gstRateBasisPoints: 0,
        },
        {
          lineKey: "duplicate",
          quantityScaled: 1000,
          unitPricePaise: 100,
          discountPaise: 0,
          gstRateBasisPoints: 0,
        },
      ],
    }),
  "Duplicate line keys",
);

console.log("INVOICE_CALCULATION_TESTS=PASS");
