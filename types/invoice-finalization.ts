import type { VerticalInvoiceDetails } from "./vertical-workflow";

export type InvoiceRecordStatus =
  "draft" | "finalized" | "partially_paid" | "paid" | "overdue" | "cancelled";

export type FinalizedInvoiceLine = {
  description: string;
  quantityScaled: number;
  lineTotalPaise: number;
};

export type FinalizedInvoiceSummary = {
  id: string;
  invoiceNumber: string;
  status: InvoiceRecordStatus;
  customerName: string | null;
  invoiceDate: string;
  subtotalPaise: number;
  discountPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  roundingPaise: number;
  totalPaise: number;
  paidPaise: number;
  lines: FinalizedInvoiceLine[];
  verticalDetails: VerticalInvoiceDetails | null;
};

export type FinalizationResult = {
  invoiceNumber: string;
  alreadyFinalized: boolean;
};
