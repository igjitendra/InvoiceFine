# MVP Scope and Boundaries

_Last updated: 2026-08-04_

## Included and implemented in source

### Business setup

One business profile with identity/contact/GST settings, logo/signature/payment QR, invoice numbering, INR, and invoice page size (A4 default or 4 × 6).

### Dashboard

Action-first dashboard with date periods, sales, received, receivables, net profit, recent invoices, low stock, and primary shortcuts. Queries aggregate in SQLite.

### Customers

Create/edit/search/archive, business insights, invoice/payment recency, contact actions, outstanding and ledger.

### Catalog and stock

Products/services, name/SKU/barcode text/category/brand/unit, purchase/selling price, GST, current stock, low-stock threshold, recently sold ordering, stock movements, and archive confirmation.

### Invoices

GST/non-GST drafts, customer and product/service lines, scaled quantities, price/discount/tax/notes, automatic numbering, finalization, stock deduction, cancellation/reversal, PDF/print/share, and statuses through cancelled.

### Payments and expenses

Full/partial payments, methods/reference/notes, overpayment protection, customer ledger, expense categories, and date-range profit.

### Reports

Daily/month/custom summaries plus six SVG charts: monthly sales, monthly profit, expense breakdown, top products, sales by category, and paid vs pending. Data is aggregate-only.

### UX quality

Automatic light/dark theme, Material 3-inspired cards, skeletons, animations, haptics, responsive 360dp layout, accessibility labels/states, swipe actions with alternatives, empty/loading/error states.

## Current release boundary

- one business
- one device
- offline local SQLite
- no account/backend/cloud sync
- system share sheet rather than guaranteed WhatsApp delivery
- no complete double-entry accounting or GST filing

## Deferred

- suppliers and purchase orders
- purchase/sales returns and credit/debit notes
- warehouses
- camera barcode scanning
- staff roles
- cloud sync/Google Drive
- multiple businesses
- CRM
- online AI reports
- monetization
- controlled import/export until a safe restore design is approved
- premium invoice themes

## Explicit non-goals

Payroll, banking integration, GST return filing, e-invoicing/e-way bills, guaranteed delivery through a third-party messaging app, and cross-device sync in MVP.
