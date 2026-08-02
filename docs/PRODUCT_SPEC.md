# InvoiceFine — Product Specification

## Product vision

An offline-first invoicing and business-management app for Indian small shops and service professionals. It should feel simpler than traditional accounting software while still producing professional invoices and trustworthy business records.

## Target users

- grocery and medical shops
- mobile, hardware, and electronics shops
- boutiques and salons
- computer repair, AC service, printing, plumbing, and electrical businesses
- CSC/VLE operators
- freelancers and small agencies

## Core promise

Create invoices quickly, track who owes money, monitor stock and expenses, and understand business performance without needing a computer or constant internet.

## Release strategy

### Version 1 — MVP

Focus on one business, one device, and offline local data:

- business setup
- dashboard
- customers and ledger
- products and services
- GST and non-GST sales invoices
- payments and outstanding balances
- expenses
- stock movements and low-stock alerts
- professional A4 PDF
- system sharing and printing
- daily and monthly reports
- local backup/export foundation if feasible after core stability

### Version 2 — Pro

- quotation and estimate workflow
- proforma invoice and delivery challan
- purchase orders and suppliers
- purchases and purchase returns
- sales returns
- credit and debit notes
- barcode scanning
- advanced inventory and warehouses
- richer reports and charts
- controlled import/export

### Version 3 — Business

- staff and roles
- multiple businesses or branches
- multi-device and cloud sync
- Google Drive or managed cloud backup
- CRM
- advanced analytics
- dark theme
- premium invoice templates
- AI-assisted reports only with explicit privacy design and online-service consent

## Important product decisions

- The MVP is not a complete accounting system.
- One app installation manages one business profile.
- Business data is local and offline-first.
- Finalized financial records are auditable.
- Payments are separate records connected to invoices.
- Products affect stock; services do not.
- Profit uses cost of goods sold and expenses, not raw purchases alone.
- WhatsApp sharing uses the operating-system share sheet.

## Monetization direction

Do not implement monetization in the first engineering milestone. Validate the product first.

Possible later model:

- useful free tier
- one-time premium unlock
- paid backup/sync subscription
- premium invoice themes
- advanced reports and import/export

Avoid ads inside invoice creation and payment workflows.

## Success criteria for MVP

A new user can:

1. create a business profile
2. add a customer
3. add a product or service
4. create and finalize a correct invoice
5. generate and share an A4 PDF
6. record full or partial payment
7. view customer outstanding balance
8. see stock decrease for sold products
9. record an expense
10. view daily/monthly sales, COGS, expenses, and net profit

All ten workflows must work offline and survive app restart.
