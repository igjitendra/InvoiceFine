# SQLite Data Model

_Last updated: 2026-08-04_

## Storage rules

Text UUID IDs, integer paise, centrally scaled quantities, ISO dates/timestamps, foreign keys, archives for referenced master records, versioned migrations, and transactions for multi-record financial mutations.

## Main tables

### `business_settings`

Business identity/contact/GST, logo/signature/payment QR URIs, invoice prefix/next number, currency, tax setting, and `invoice_page_size` (`a4` or `4x6`, default `a4`). Migration 3 adds business type/category, owner/website/PAN/state/pincode, GST type, invoice template, estimate/quotation prefixes, payment terms/methods, notification preferences, and onboarding completion state.

### `invoice_vertical_details`

Migration 4 stores one workflow-specific JSON snapshot per invoice for repair, agency, freelancer, salon, plumber, AC-service, or general workflows. The row is linked by invoice ID, survives draft finalization, and is removed automatically when its invoice is deleted.

### `customers`

Identity/contact/GST/state/address/notes, archive flag, timestamps.

### `categories` and `units`

Item/expense categories with archive state; units with names/short names/GST code.

### `items`

Product/service type, name, SKU, barcode text, category, brand, unit, purchase/selling price, GST basis points, current scaled stock, low-stock threshold, archive state, timestamps.

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
