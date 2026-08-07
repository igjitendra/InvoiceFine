export type PaymentMethod =
  "cash" | "upi" | "card" | "bank_transfer" | "cheque" | "other";
export type PaymentSettlementMode = "keep_due" | "discount_remaining";
export type Payment = {
  id: string;
  invoiceId: string;
  amountPaise: number;
  paymentDate: string;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
};
export type PaymentInput = {
  invoiceId: string;
  amountPaise: number;
  paymentDate: string;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  settlementMode: PaymentSettlementMode;
};
export type PaymentContext = {
  invoiceNumber: string;
  customerName: string | null;
  totalPaise: number;
  paidPaise: number;
  settlementDiscountPaise: number;
  outstandingPaise: number;
};
export type LedgerEntry = {
  id: string;
  date: string;
  kind: "invoice" | "payment" | "discount";
  label: string;
  debitPaise: number;
  creditPaise: number;
};
export type CustomerLedger = {
  customerName: string;
  invoicedPaise: number;
  paidPaise: number;
  discountPaise: number;
  outstandingPaise: number;
  entries: LedgerEntry[];
};
