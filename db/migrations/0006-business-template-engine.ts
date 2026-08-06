export const businessTemplateEngineMigration = {
  version: 6,
  name: "business_template_engine",
  sql: `
CREATE TABLE IF NOT EXISTS catalog_item_template_data (
  item_id TEXT PRIMARY KEY NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  data_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_catalog_template_id ON catalog_item_template_data(template_id);
`,
} as const;
