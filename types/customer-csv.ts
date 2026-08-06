export type CustomerCsvField =
  | "name"
  | "phone"
  | "email"
  | "gstin"
  | "billingAddress"
  | "shippingAddress"
  | "stateName"
  | "stateCode"
  | "pincode"
  | "notes";
export type CustomerCsvMapping = Record<string, CustomerCsvField | null>;
export type DuplicatePhonePolicy = "skip" | "update" | "create";
export type CustomerImportRow = {
  rowNumber: number;
  values: Record<CustomerCsvField, string>;
  errors: string[];
};
export type CustomerImportSummary = {
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
};
