export type CustomerInsightInvoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalPaise: number;
};
export type CustomerInsightPayment = {
  id: string;
  paymentDate: string;
  amountPaise: number;
  method: string;
};
export type CustomerInsights = {
  totalSalesPaise: number;
  receivedPaise: number;
  outstandingPaise: number;
  invoiceCount: number;
  lastInvoice: CustomerInsightInvoice | null;
  lastPayment: CustomerInsightPayment | null;
  outstandingInvoices: Array<{
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    totalPaise: number;
    paidPaise: number;
    outstandingPaise: number;
  }>;
};
