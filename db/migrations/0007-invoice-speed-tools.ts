export const invoiceSpeedToolsMigration = {
  version: 7,
  name: "invoice_speed_tools",
  sql: `
CREATE TABLE IF NOT EXISTS item_favorites(
 item_id TEXT PRIMARY KEY NOT NULL REFERENCES items(id) ON DELETE CASCADE,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_item_favorites_created ON item_favorites(created_at DESC);
`,
} as const;
