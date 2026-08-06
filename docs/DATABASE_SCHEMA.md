# SQLite Data Model

_Last updated: 2026-08-06_

## Storage rules

Text UUID IDs, integer paise, centrally scaled quantities, ISO dates/timestamps, foreign keys, archives for referenced master records, versioned migrations, and transactions for multi-record financial mutations.

## Appearance preference store

Phase 14A uses Expo SQLite KV Store in its separate `ExpoSQLiteStorage` database, not the transactional business database. The versioned key `invoicefine.appearance.v1` stores a validated JSON object containing theme (`system`, `light`, or `dark`), font size (`small`, `medium`, or `large`), compact-mode state, and catalog view (`card` or `list`). Invalid or unreadable values fall back safely to System/Medium/Comfortable/Card defaults. This does not increment the business schema migration version.

## Selected CSV export model

Phase 14E performs read-only `SELECT` queries over existing tables. Transactional date filters apply to invoices, payments, and expenses; archived filtering applies to customers and catalog/stock records. Paise and scaled quantities are converted only in exported text, never in SQLite. No table, trigger, index, or migration is added, so the latest schema remains version 8.

## Main tables

### `business_settings`

Business identity/contact/GST, logo/signature/payment QR URIs, invoice prefix/next number, currency, tax setting, and `invoice_page_size` (`a4` or `4x6`, default `a4`). Migration 3 adds business type/category, owner/website/PAN/state/pincode, GST type, invoice template, estimate/quotation prefixes, payment terms/methods, notification preferences, and onboarding completion state. Phase 14B exposes existing invoice prefix, page size and payment-term columns as working settings and stores notification choices in the existing JSON column; it does not add a migration, so the latest business schema is version 8 after the Customer CSV field migration.

### `invoice_vertical_details`

Migration 4 stores one workflow-specific JSON snapshot per invoice for repair, agency, freelancer, salon, plumber, AC-service, or general workflows. The row is linked by invoice ID, survives draft finalization, and is removed automatically when its invoice is deleted.

### `customers`

Identity/contact/GST/state/billing and shipping addresses/notes, archive flag, timestamps. Migration 8 adds `shipping_address`, `state_name`, and `pincode` for customer CSV round-tripping.

### `categories` and `units`

Item/expense categories with archive state; units with names/short names/GST code.

### `items`

Product/service type, name/short name, SKU, barcode, HSN/SAC, category, brand and unit; purchase/selling/MRP/wholesale price, tax-inclusive mode and GST basis points; current/opening stock through stock movements, low-stock and reorder thresholds, storage location and supplier; description, local image URI and physical attributes; accounting mappings and optional expiry/batch/warranty/manufacturer data; service pricing model, duration, staff, appointment requirement, warranty days, checklist JSON and internal/customer notes; archive state and timestamps. Migration 5 adds professional fields with safe defaults for existing rows. Phase 14D imports into these existing columns, creates missing item categories/units transactionally, and records product opening stock in `stock_movements`; it adds no migration, so the latest schema remains version 8.

### `catalog_item_template_data`

Migration 6 stores one schema-driven business-template payload per catalog item: item relation, template ID, sanitized JSON field values, and timestamps. Rows cascade-delete with their catalog item. Supported templates are Medical, Garment, Mobile/Electronics, Repair, Salon, Agency, Freelancer, Restaurant/Food, and CSC/VLE.

### `item_favorites`

Migration 7 stores persistent favorite catalog item IDs with creation timestamps. Favorites are ranked before recently sold suggestions and cascade-delete with their item.

### `invoices`

Unique number; tax/non-tax kind; draft/finalized/partially-paid/paid/overdue/cancelled status; customer/date; complete customer and business snapshots; subtotal/discount/taxable/CGST/SGST/IGST/rounding/total/paid paise; notes; finalization and audit timestamps.

### `invoice_items`

Invoice relation, optional catalog relation, type and description/SKU/unit snapshots, scaled quantity, unit/cost/discount/tax values, line tax/total values, order.

### `payments`

Invoice/customer relation, paise amount, date, method, reference/notes, timestamps.

### `expenses`

Expense category/date/amount/payee/notes, timestamps.

### `stock_movements`

Item, movement type, scaled delta, reference, reason, occurrence/audit time. Finalization and cancellation use auditable sale/reversal entries.

### `schema_migrations`

Applied migration version/name/time. Never reset a user database to upgrade.

## Required transaction invariants

Finalization validates a draft, allocates one number, stores snapshots/totals, mutates eligible product stock, writes movements, and advances numbering atomically.

Payment validates amount/outstanding, inserts payment, and updates paid/status atomically with conflict protection.

Cancellation preserves history and reverses eligible stock atomically; invoices with payments follow cancellation restrictions.

## Aggregate query rule

Dashboard/report repositories perform SQL grouping/summing and return bounded datasets. Full tables must not be loaded into JavaScript for cards or charts.

## Follow-up database policy

A negative-stock finalization policy must be explicitly approved and tested. Backup/export requires a versioned manifest, integrity validation, transactional restore, and rollback design before implementation.
