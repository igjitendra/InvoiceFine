import type { InvoiceRecordStatus } from "./invoice-finalization";

export type ProductSaleHistory = {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string | null;
  quantityScaled: number;
  salesPaise: number;
  status: InvoiceRecordStatus;
};

export type ProductStockMovement = {
  id: string;
  type: "opening" | "sale" | "sale_reversal" | "manual_in" | "manual_out" | "adjustment";
  quantityDeltaScaled: number;
  reason: string | null;
  occurredAt: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
};

export type ProductProfile = {
  totalSoldScaled: number;
  totalSalesPaise: number;
  saleCount: number;
  sales: ProductSaleHistory[];
  movements: ProductStockMovement[];
};
