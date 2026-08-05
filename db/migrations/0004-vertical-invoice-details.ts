export const verticalInvoiceDetailsMigration = {
  version: 4,
  name: "vertical_invoice_details",
  sql: `CREATE TABLE IF NOT EXISTS invoice_vertical_details(invoice_id TEXT PRIMARY KEY NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,workflow TEXT NOT NULL CHECK(workflow IN ('repair','agency','freelancer','salon','plumber','ac_service','general')),details_json TEXT NOT NULL DEFAULT '{}',created_at TEXT NOT NULL,updated_at TEXT NOT NULL);CREATE INDEX IF NOT EXISTS idx_vertical_details_workflow ON invoice_vertical_details(workflow);`,
} as const;
