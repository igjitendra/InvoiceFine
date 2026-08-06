export type InvoicePageSize = "a4" | "4x6";

export type BusinessProfile = {
  id: string;
  businessName: string;
  gstin: string | null;
  stateCode: string | null;
  address: string;
  phone: string;
  email: string | null;
  logoUri: string | null;
  signatureUri: string | null;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  taxEnabled: boolean;
  currencyCode: "INR";
  invoicePageSize: InvoicePageSize;
  createdAt: string;
  updatedAt: string;
};

export type BusinessProfileInput = Omit<
  BusinessProfile,
  "id" | "currencyCode" | "createdAt" | "updatedAt"
>;

export type BusinessProfileFormValues = {
  businessName: string;
  gstin: string;
  stateCode: string;
  address: string;
  phone: string;
  email: string;
  logoUri: string | null;
  signatureUri: string | null;
  invoicePrefix: string;
  nextInvoiceNumber: string;
  taxEnabled: boolean;
  invoicePageSize: InvoicePageSize;
};
