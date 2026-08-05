import type { InvoiceRecordStatus } from "./invoice-finalization";
import type { InvoiceKind } from "./invoice";
import type { VerticalInvoiceDetails } from "./vertical-workflow";

export type InvoiceDraftLine = {
  id: string;
  itemId: string | null;
  itemType: "product" | "service";
  description: string;
  sku: string | null;
  unitName: string | null;
  quantityScaled: number;
  unitPricePaise: number;
  costPricePaise: number;
  discountPaise: number;
  gstRateBasisPoints: number;
};

export type InvoiceDraft = {
  id: string;
  kind: InvoiceKind;
  customerId: string | null;
  customerName: string | null;
  customerStateCode: string | null;
  invoiceDate: string;
  dueDate: string | null;
  notes: string | null;
  businessStateCode: string | null;
  lines: InvoiceDraftLine[];
  verticalDetails: VerticalInvoiceDetails | null;
};

export type InvoiceDraftInput = {
  id?: string;
  kind: InvoiceKind;
  customerId: string | null;
  invoiceDate: string;
  dueDate: string | null;
  notes: string | null;
  lines: InvoiceDraftLine[];
  verticalDetails: VerticalInvoiceDetails | null;
};

export type InvoiceDraftListItem = {
  id: string;
  invoiceNumber: string;
  status: InvoiceRecordStatus;
  customerName: string | null;
  invoiceDate: string;
  totalPaise: number;
  updatedAt: string;
};
