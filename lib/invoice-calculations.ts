import { QUANTITY_SCALE } from "./quantity";
import type {
  InvoiceCalculation,
  InvoiceCalculationInput,
  InvoiceLineCalculation,
  InvoiceTaxMode,
} from "../types/invoice";

const BASIS_POINTS_SCALE = 10_000;
const PAISE_PER_RUPEE = 100;
const stateCodePattern = /^(0[1-9]|[1-3][0-9]|[4-8][0-9]|9[0-7])$/;

function requireNonNegativeSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer.`);
  }
}

function addSafe(left: number, right: number, label: string): number {
  const result = left + right;
  if (!Number.isSafeInteger(result)) {
    throw new Error(`${label} exceeds the supported range.`);
  }
  return result;
}

function multiplyDivideRoundHalfUp(
  left: number,
  right: number,
  divisor: number,
  label: string,
): number {
  const product = left * right;
  if (!Number.isSafeInteger(product)) {
    throw new Error(`${label} exceeds the supported range.`);
  }
  return Math.floor((product + Math.floor(divisor / 2)) / divisor);
}

function roundToNearestRupee(paise: number): number {
  const rupees = multiplyDivideRoundHalfUp(
    paise,
    1,
    PAISE_PER_RUPEE,
    "Invoice total",
  );
  const roundedPaise = rupees * PAISE_PER_RUPEE;
  if (!Number.isSafeInteger(roundedPaise)) {
    throw new Error("Invoice total exceeds the supported range.");
  }
  return roundedPaise;
}

function isVerifiedStateCode(value: string | null): value is string {
  return value !== null && stateCodePattern.test(value.trim());
}

export function resolveInvoiceTaxMode(
  kind: InvoiceCalculationInput["kind"],
  businessStateCode: string | null,
  customerStateCode: string | null,
): InvoiceTaxMode {
  if (kind === "non_tax_invoice") return "none";
  if (!isVerifiedStateCode(businessStateCode)) {
    throw new Error(
      "A verified business state code is required for a tax invoice.",
    );
  }
  // Unregistered/cash customers may not have a saved state. Treat the sale as
  // local until an explicit customer state is supplied, while keeping a saved
  // out-of-state code authoritative for IGST.
  const placeOfSupply = isVerifiedStateCode(customerStateCode)
    ? customerStateCode.trim()
    : businessStateCode.trim();
  return businessStateCode.trim() === placeOfSupply
    ? "intra_state"
    : "inter_state";
}

function calculateLine(
  line: InvoiceCalculationInput["lines"][number],
  taxMode: InvoiceTaxMode,
): InvoiceLineCalculation {
  if (line.lineKey.trim().length === 0) {
    throw new Error("Each invoice line requires a key.");
  }
  if (!Number.isSafeInteger(line.quantityScaled) || line.quantityScaled <= 0) {
    throw new Error("Invoice line quantity must be a positive scaled integer.");
  }
  requireNonNegativeSafeInteger(line.unitPricePaise, "Unit price");
  requireNonNegativeSafeInteger(line.discountPaise, "Line discount");
  requireNonNegativeSafeInteger(line.gstRateBasisPoints, "GST rate");
  if (line.gstRateBasisPoints > BASIS_POINTS_SCALE) {
    throw new Error("GST rate cannot exceed 100 percent.");
  }

  const subtotalPaise = multiplyDivideRoundHalfUp(
    line.unitPricePaise,
    line.quantityScaled,
    QUANTITY_SCALE,
    "Line subtotal",
  );
  if (line.discountPaise > subtotalPaise) {
    throw new Error("Line discount cannot exceed the line subtotal.");
  }
  const taxablePaise = subtotalPaise - line.discountPaise;
  const taxPaise =
    taxMode === "none"
      ? 0
      : multiplyDivideRoundHalfUp(
          taxablePaise,
          line.gstRateBasisPoints,
          BASIS_POINTS_SCALE,
          "Line tax",
        );

  let cgstPaise = 0;
  let sgstPaise = 0;
  let igstPaise = 0;
  if (taxMode === "intra_state") {
    cgstPaise = Math.floor(taxPaise / 2);
    sgstPaise = taxPaise - cgstPaise;
  } else if (taxMode === "inter_state") {
    igstPaise = taxPaise;
  }

  return {
    lineKey: line.lineKey,
    subtotalPaise,
    discountPaise: line.discountPaise,
    taxablePaise,
    cgstPaise,
    sgstPaise,
    igstPaise,
    lineTotalPaise: addSafe(taxablePaise, taxPaise, "Line total"),
  };
}

export function calculateInvoice(
  input: InvoiceCalculationInput,
): InvoiceCalculation {
  if (input.lines.length === 0) {
    throw new Error("An invoice requires at least one line.");
  }
  const keys = new Set(input.lines.map((line) => line.lineKey));
  if (keys.size !== input.lines.length) {
    throw new Error("Invoice line keys must be unique.");
  }

  const taxMode = resolveInvoiceTaxMode(
    input.kind,
    input.businessStateCode,
    input.customerStateCode,
  );
  const lines = input.lines.map((line) => calculateLine(line, taxMode));

  let subtotalPaise = 0;
  let discountPaise = 0;
  let taxablePaise = 0;
  let cgstPaise = 0;
  let sgstPaise = 0;
  let igstPaise = 0;
  for (const line of lines) {
    subtotalPaise = addSafe(
      subtotalPaise,
      line.subtotalPaise,
      "Invoice subtotal",
    );
    discountPaise = addSafe(
      discountPaise,
      line.discountPaise,
      "Invoice discount",
    );
    taxablePaise = addSafe(
      taxablePaise,
      line.taxablePaise,
      "Invoice taxable amount",
    );
    cgstPaise = addSafe(cgstPaise, line.cgstPaise, "Invoice CGST");
    sgstPaise = addSafe(sgstPaise, line.sgstPaise, "Invoice SGST");
    igstPaise = addSafe(igstPaise, line.igstPaise, "Invoice IGST");
  }
  const taxPaise = addSafe(
    addSafe(cgstPaise, sgstPaise, "Invoice tax"),
    igstPaise,
    "Invoice tax",
  );
  const unroundedTotalPaise = addSafe(taxablePaise, taxPaise, "Invoice total");
  const totalPaise =
    input.roundToWholeRupee === false
      ? unroundedTotalPaise
      : roundToNearestRupee(unroundedTotalPaise);

  return {
    taxMode,
    lines,
    subtotalPaise,
    discountPaise,
    taxablePaise,
    cgstPaise,
    sgstPaise,
    igstPaise,
    taxPaise,
    unroundedTotalPaise,
    roundingPaise: totalPaise - unroundedTotalPaise,
    totalPaise,
  };
}

export function calculateOutstandingPaise(
  totalPaise: number,
  paidPaise: number,
): number {
  requireNonNegativeSafeInteger(totalPaise, "Invoice total");
  requireNonNegativeSafeInteger(paidPaise, "Paid amount");
  if (paidPaise > totalPaise) {
    throw new Error("Paid amount cannot exceed invoice total.");
  }
  return totalPaise - paidPaise;
}
