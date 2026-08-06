export const customerCsvFieldsMigration = {
  version: 8,
  name: "customer_csv_fields",
  sql: `
ALTER TABLE customers ADD COLUMN shipping_address TEXT;
ALTER TABLE customers ADD COLUMN state_name TEXT;
ALTER TABLE customers ADD COLUMN pincode TEXT;
`,
} as const;
