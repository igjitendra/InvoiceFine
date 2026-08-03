export const initialSchemaMigration = {
  version: 1,
  name: 'initial_schema',
  sql: `
CREATE TABLE IF NOT EXISTS business_settings (
  id TEXT PRIMARY KEY NOT NULL,
  business_name TEXT NOT NULL,
  gstin TEXT,
  state_code TEXT,
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  logo_uri TEXT,
  signature_uri TEXT,
  payment_qr_uri TEXT,
  invoice_prefix TEXT NOT NULL DEFAULT 'INV',
  next_invoice_number INTEGER NOT NULL DEFAULT 1 CHECK (next_invoice_number > 0),
  tax_enabled INTEGER NOT NULL DEFAULT 0 CHECK (tax_enabled IN (0, 1)),
  currency_code TEXT NOT NULL DEFAULT 'INR',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  gstin TEXT,
  state_code TEXT,
  billing_address TEXT,
  notes TEXT,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('item', 'expense')),
  name TEXT NOT NULL,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  gst_unit_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('product', 'service')),
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  brand TEXT,
  unit_id TEXT REFERENCES units(id) ON DELETE SET NULL,
  purchase_price_paise INTEGER NOT NULL DEFAULT 0 CHECK (purchase_price_paise >= 0),
  selling_price_paise INTEGER NOT NULL DEFAULT 0 CHECK (selling_price_paise >= 0),
  gst_rate_basis_points INTEGER NOT NULL DEFAULT 0 CHECK (gst_rate_basis_points >= 0),
  current_stock_scaled INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold_scaled INTEGER,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (type = 'product' OR current_stock_scaled = 0),
  CHECK (low_stock_threshold_scaled IS NULL OR low_stock_threshold_scaled >= 0)
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('tax_invoice', 'non_tax_invoice')),
  status TEXT NOT NULL CHECK (
    status IN ('draft', 'finalized', 'partially_paid', 'paid', 'overdue', 'cancelled')
  ),
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  invoice_date TEXT NOT NULL,
  due_date TEXT,
  customer_name_snapshot TEXT,
  customer_phone_snapshot TEXT,
  customer_email_snapshot TEXT,
  customer_gstin_snapshot TEXT,
  customer_state_code_snapshot TEXT,
  customer_billing_address_snapshot TEXT,
  business_name_snapshot TEXT NOT NULL,
  business_gstin_snapshot TEXT,
  business_state_code_snapshot TEXT,
  business_address_snapshot TEXT NOT NULL DEFAULT '',
  business_phone_snapshot TEXT NOT NULL DEFAULT '',
  business_email_snapshot TEXT,
  business_logo_uri_snapshot TEXT,
  business_signature_uri_snapshot TEXT,
  business_payment_qr_uri_snapshot TEXT,
  currency_code_snapshot TEXT NOT NULL DEFAULT 'INR',
  subtotal_paise INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_paise >= 0),
  discount_paise INTEGER NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  taxable_paise INTEGER NOT NULL DEFAULT 0 CHECK (taxable_paise >= 0),
  cgst_paise INTEGER NOT NULL DEFAULT 0 CHECK (cgst_paise >= 0),
  sgst_paise INTEGER NOT NULL DEFAULT 0 CHECK (sgst_paise >= 0),
  igst_paise INTEGER NOT NULL DEFAULT 0 CHECK (igst_paise >= 0),
  rounding_paise INTEGER NOT NULL DEFAULT 0,
  total_paise INTEGER NOT NULL DEFAULT 0 CHECK (total_paise >= 0),
  paid_paise INTEGER NOT NULL DEFAULT 0 CHECK (paid_paise >= 0),
  notes TEXT,
  finalized_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (paid_paise <= total_paise)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY NOT NULL,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_id TEXT REFERENCES items(id) ON DELETE SET NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'service')),
  description_snapshot TEXT NOT NULL,
  sku_snapshot TEXT,
  unit_name_snapshot TEXT,
  unit_short_name_snapshot TEXT,
  quantity_scaled INTEGER NOT NULL CHECK (quantity_scaled > 0),
  unit_price_paise INTEGER NOT NULL CHECK (unit_price_paise >= 0),
  cost_price_paise INTEGER NOT NULL DEFAULT 0 CHECK (cost_price_paise >= 0),
  discount_paise INTEGER NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  gst_rate_basis_points INTEGER NOT NULL DEFAULT 0 CHECK (gst_rate_basis_points >= 0),
  taxable_paise INTEGER NOT NULL DEFAULT 0 CHECK (taxable_paise >= 0),
  cgst_paise INTEGER NOT NULL DEFAULT 0 CHECK (cgst_paise >= 0),
  sgst_paise INTEGER NOT NULL DEFAULT 0 CHECK (sgst_paise >= 0),
  igst_paise INTEGER NOT NULL DEFAULT 0 CHECK (igst_paise >= 0),
  line_total_paise INTEGER NOT NULL DEFAULT 0 CHECK (line_total_paise >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0)
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY NOT NULL,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  payment_date TEXT NOT NULL,
  method TEXT NOT NULL CHECK (
    method IN ('cash', 'upi', 'card', 'bank_transfer', 'cheque', 'other')
  ),
  reference TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  expense_date TEXT NOT NULL,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  payee TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY NOT NULL,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (
    type IN ('opening', 'sale', 'sale_reversal', 'manual_in', 'manual_out', 'adjustment')
  ),
  quantity_delta_scaled INTEGER NOT NULL CHECK (quantity_delta_scaled <> 0),
  reference_type TEXT,
  reference_id TEXT,
  reason TEXT,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invoices_date_status
  ON invoices(invoice_date, status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer
  ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice
  ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_date
  ON payments(customer_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date_category
  ON expenses(expense_date, category_id);
CREATE INDEX IF NOT EXISTS idx_items_name
  ON items(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_items_sku
  ON items(sku);
CREATE INDEX IF NOT EXISTS idx_items_barcode
  ON items(barcode);
CREATE INDEX IF NOT EXISTS idx_items_archived
  ON items(is_archived);
CREATE INDEX IF NOT EXISTS idx_stock_movements_item_date
  ON stock_movements(item_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_customers_name
  ON customers(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_customers_phone
  ON customers(phone);
`,
} as const;
