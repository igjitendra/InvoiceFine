export type PaymentMethod='cash'|'upi'|'card'|'bank_transfer'|'cheque'|'other';
export type Payment={id:string;invoiceId:string;amountPaise:number;paymentDate:string;method:PaymentMethod;reference:string|null;notes:string|null};
export type PaymentInput={invoiceId:string;amountPaise:number;paymentDate:string;method:PaymentMethod;reference:string|null;notes:string|null};
export type PaymentContext={invoiceNumber:string;customerName:string|null;totalPaise:number;paidPaise:number;outstandingPaise:number};
export type LedgerEntry={id:string;date:string;kind:'invoice'|'payment';label:string;debitPaise:number;creditPaise:number};
export type CustomerLedger={customerName:string;invoicedPaise:number;paidPaise:number;outstandingPaise:number;entries:LedgerEntry[]};
