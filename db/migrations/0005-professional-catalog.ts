export const professionalCatalogMigration = {
  version: 5,
  name: "professional_catalog",
  sql: `
ALTER TABLE items ADD COLUMN short_name TEXT;
ALTER TABLE items ADD COLUMN hsn_sac_code TEXT;
ALTER TABLE items ADD COLUMN mrp_paise INTEGER NOT NULL DEFAULT 0 CHECK(mrp_paise >= 0);
ALTER TABLE items ADD COLUMN wholesale_price_paise INTEGER NOT NULL DEFAULT 0 CHECK(wholesale_price_paise >= 0);
ALTER TABLE items ADD COLUMN tax_inclusive INTEGER NOT NULL DEFAULT 0 CHECK(tax_inclusive IN (0, 1));
ALTER TABLE items ADD COLUMN reorder_level_scaled INTEGER NOT NULL DEFAULT 0 CHECK(reorder_level_scaled >= 0);
ALTER TABLE items ADD COLUMN storage_location TEXT;
ALTER TABLE items ADD COLUMN supplier TEXT;
ALTER TABLE items ADD COLUMN description TEXT;
ALTER TABLE items ADD COLUMN image_uri TEXT;
ALTER TABLE items ADD COLUMN weight TEXT;
ALTER TABLE items ADD COLUMN dimensions TEXT;
ALTER TABLE items ADD COLUMN color TEXT;
ALTER TABLE items ADD COLUMN size TEXT;
ALTER TABLE items ADD COLUMN expiry_date TEXT;
ALTER TABLE items ADD COLUMN batch_number TEXT;
ALTER TABLE items ADD COLUMN warranty TEXT;
ALTER TABLE items ADD COLUMN manufacturer TEXT;
ALTER TABLE items ADD COLUMN purchase_account TEXT;
ALTER TABLE items ADD COLUMN sales_account TEXT;
ALTER TABLE items ADD COLUMN cogs_account TEXT;
ALTER TABLE items ADD COLUMN service_pricing_model TEXT NOT NULL DEFAULT 'fixed' CHECK(service_pricing_model IN ('fixed', 'hourly', 'per_visit', 'per_km', 'per_day'));
ALTER TABLE items ADD COLUMN service_duration_minutes INTEGER NOT NULL DEFAULT 0 CHECK(service_duration_minutes >= 0);
ALTER TABLE items ADD COLUMN assigned_staff TEXT;
ALTER TABLE items ADD COLUMN appointment_required INTEGER NOT NULL DEFAULT 0 CHECK(appointment_required IN (0, 1));
ALTER TABLE items ADD COLUMN warranty_days INTEGER NOT NULL DEFAULT 0 CHECK(warranty_days >= 0);
ALTER TABLE items ADD COLUMN checklist_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE items ADD COLUMN internal_notes TEXT;
ALTER TABLE items ADD COLUMN customer_notes TEXT;
CREATE INDEX IF NOT EXISTS idx_items_short_name ON items(short_name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_items_hsn_sac ON items(hsn_sac_code);
`,
} as const;
