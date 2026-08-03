export const invoicePageSizeMigration = {
  version: 2,
  name: 'invoice_page_size',
  sql: `ALTER TABLE business_settings ADD COLUMN invoice_page_size TEXT NOT NULL DEFAULT 'a4' CHECK (invoice_page_size IN ('a4', '4x6'));`,
} as const;
