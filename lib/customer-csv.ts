import { createCsv, parseCsv } from "./csv";
import type { Customer } from "../types/customer";
import type {
  CustomerCsvField,
  CustomerCsvMapping,
  CustomerImportRow,
} from "../types/customer-csv";
export const customerCsvFields: CustomerCsvField[] = [
  "name",
  "phone",
  "email",
  "gstin",
  "billingAddress",
  "shippingAddress",
  "stateName",
  "stateCode",
  "pincode",
  "notes",
];
export const customerCsvLabels: Record<CustomerCsvField, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
  gstin: "GSTIN",
  billingAddress: "Billing Address",
  shippingAddress: "Shipping Address",
  stateName: "State",
  stateCode: "State Code",
  pincode: "Pincode",
  notes: "Notes",
};
const aliases: Record<CustomerCsvField, string[]> = {
  name: ["name", "customername", "customer"],
  phone: [
    "phone",
    "mobile",
    "mobileno",
    "phonenumber",
    "contact",
    "contactnumber",
  ],
  email: ["email", "emailaddress"],
  gstin: ["gstin", "gstnumber", "gstno"],
  billingAddress: ["billingaddress", "address"],
  shippingAddress: ["shippingaddress", "deliveryaddress"],
  stateName: ["state", "statename"],
  stateCode: ["statecode", "gststatecode"],
  pincode: ["pincode", "pin", "postalcode", "zipcode"],
  notes: ["notes", "note", "remarks"],
};
const key = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");
export function autoMapCustomerColumns(headers: string[]): CustomerCsvMapping {
  const result: CustomerCsvMapping = {};
  for (const h of headers) {
    const k = key(h);
    result[h] = customerCsvFields.find((f) => aliases[f].includes(k)) ?? null;
  }
  return result;
}
export function parseCustomerCsv(text: string, mapping?: CustomerCsvMapping) {
  const rows = parseCsv(text);
  const headers = (rows[0] ?? []).map((v) => v.trim());
  const active = mapping ?? autoMapCustomerColumns(headers);
  const parsed: CustomerImportRow[] = rows.slice(1).map((cells, index) => {
    const values = Object.fromEntries(
      customerCsvFields.map((f) => [f, ""]),
    ) as Record<CustomerCsvField, string>;
    headers.forEach((h, i) => {
      const f = active[h];
      if (f) values[f] = (cells[i] ?? "").trim();
    });
    const errors: string[] = [];
    if (!values.name) errors.push("Name is required");
    if (values.phone && !/^\d{10}$/.test(values.phone))
      errors.push("Phone must be 10 digits");
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      errors.push("Email is invalid");
    if (
      values.gstin &&
      !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(
        values.gstin.toUpperCase(),
      )
    )
      errors.push("GSTIN is invalid");
    if (values.stateCode && !/^\d{2}$/.test(values.stateCode))
      errors.push("State code is invalid");
    if (values.pincode && !/^\d{6}$/.test(values.pincode))
      errors.push("Pincode is invalid");
    return { rowNumber: index + 2, values, errors };
  });
  return { headers, mapping: active, rows: parsed };
}
export const customerSampleCsv = createCsv([
  [
    "Name",
    "Phone",
    "Email",
    "GSTIN",
    "BillingAddress",
    "ShippingAddress",
    "State",
    "StateCode",
    "Pincode",
    "Notes",
  ],
  [
    "Rahul Traders",
    "9876543210",
    "rahul@email.com",
    "09ABCDE1234F1Z5",
    "Kanpur",
    "Kanpur",
    "Uttar Pradesh",
    "09",
    "208001",
    "Regular Customer",
  ],
]);
export function exportCustomersCsv(customers: Customer[]): string {
  return createCsv([
    [
      "Name",
      "Phone",
      "Email",
      "GSTIN",
      "BillingAddress",
      "ShippingAddress",
      "State",
      "StateCode",
      "Pincode",
      "Notes",
    ],
    ...customers.map((c) => [
      c.name,
      c.phone ?? "",
      c.email ?? "",
      c.gstin ?? "",
      c.billingAddress ?? "",
      c.shippingAddress ?? "",
      c.stateName ?? "",
      c.stateCode ?? "",
      c.pincode ?? "",
      c.notes ?? "",
    ]),
  ]);
}
export function errorReportCsv(rows: CustomerImportRow[]): string {
  return createCsv([
    ["Row", "Name", "Phone", "Errors"],
    ...rows
      .filter((r) => r.errors.length)
      .map((r) => [
        String(r.rowNumber),
        r.values.name,
        r.values.phone,
        r.errors.join("; "),
      ]),
  ]);
}
