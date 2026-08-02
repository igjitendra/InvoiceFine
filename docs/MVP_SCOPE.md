# MVP Scope and Boundaries

## Included

### Onboarding and business profile

- business name, address, phone, email
- optional GSTIN and state
- optional logo and signature
- invoice prefix and starting number
- currency fixed to INR for MVP
- tax-enabled or non-tax business mode

### Dashboard

- today's sales
- today's received payments
- today's estimated gross profit
- pending receivables
- total customers
- low-stock product count
- recent invoices

Dashboard queries must be aggregated in SQLite; do not load every row into JavaScript.

### Customers

- create, edit, search, and view
- phone, email, address, GSTIN, state, notes
- customer ledger
- invoice history
- payment history
- outstanding balance

### Catalog

One item model with type `product` or `service`.

Products:

- name, SKU, barcode text, category, brand, unit
- purchase price, selling price, GST rate
- opening and current stock
- low-stock threshold

Services:

- name, unit or pricing mode
- price, GST rate, notes
- no stock tracking

### Invoices

MVP supports:

- GST sales invoice
- non-GST sales invoice
- draft, finalized, partially paid, paid, overdue, and cancelled states
- automatic invoice number
- invoice date and optional due date
- customer
- product/service line items
- quantity, unit price, discount, GST, notes
- optional signature and payment QR image
- PDF, print, and system sharing

Quotation, estimate, proforma invoice, and delivery challan are deferred to Version 2 to keep MVP achievable.

### Payments

- full and partial payment
- cash, UPI, card, bank transfer, cheque, other
- payment date, amount, reference, notes
- customer ledger integration
- outstanding calculation

### Expenses

- categories: rent, salary, fuel, electricity, internet, purchases not tracked as inventory, and miscellaneous
- date, amount, category, payee, notes
- custom categories

### Stock

- opening stock
- stock in adjustment
- stock out from finalized invoices
- manual stock adjustment with reason
- low-stock alert
- immutable stock-movement history

### Reports

MVP:

- daily summary
- monthly summary
- custom date-range summary
- sales
- received payments
- receivables
- COGS
- expenses
- gross and net profit
- low-stock list

Weekly and yearly views can use the same date-range engine after core reports are stable.

## Deferred from MVP

- suppliers and purchase orders
- purchase returns and sales returns
- credit/debit notes
- warehouses
- camera barcode scanner
- multi-user and staff roles
- cloud sync
- Google Drive backup
- Excel import/export
- CRM
- AI reports
- ads and premium billing
- dark theme
- multiple businesses

## Non-goals

- full double-entry accounting
- GST return filing
- payroll
- banking integration
- e-invoicing or e-way bill integration
- guaranteed WhatsApp delivery
- cross-device sync in Version 1
