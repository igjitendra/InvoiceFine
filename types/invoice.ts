export type InvoiceKind = "tax_invoice" | "non_tax_invoice";
export type InvoiceTaxMode = "none" | "intra_state" | "inter_state";

export type InvoiceCalculationLineInput = {
  lineKey: string;
  quantityScaled: number;
  unitPricePaise: number;
  discountPaise: number;
  gstRateBasisPoints: number;
};

export type InvoiceCalculationInput = {
  kind: InvoiceKind;
  businessStateCode: string | null;
  customerStateCode: string | null;
  lines: InvoiceCalculationLineInput[];
  roundToWholeRupee?: boolean;
};

export type InvoiceLineCalculation = {
  lineKey: string;
  subtotalPaise: number;
  discountPaise: number;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  lineTotalPaise: number;
};

export type InvoiceCalculation = {
  taxMode: InvoiceTaxMode;
  lines: InvoiceLineCalculation[];
  subtotalPaise: number;
  discountPaise: number;
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  taxPaise: number;
  unroundedTotalPaise: number;
  roundingPaise: number;
  totalPaise: number;
};
