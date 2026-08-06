# InvoiceFine — Product Specification

_Last updated: 2026-08-04_

## Vision

**Pocket ERP for Indian Small Business:** fast mobile billing, customers, stock, payments, expenses, PDFs, and trustworthy performance insight without requiring a computer or continuous internet.

## Target users

Small shops, repair/service businesses, boutiques/salons, CSC/VLE operators, freelancers, and small agencies in India.

## Core promise

Create a correct invoice quickly, know who owes money, track product stock and expenses, and understand sales/profit from one Android phone.

## Product principles

- offline-first and private by default
- action-first rather than accounting-menu-first
- business records are auditable
- integer/scaled arithmetic for financial trust
- one-tap common actions with confirmation for destructive actions
- useful on 360dp Android screens
- light/dark Material 3-inspired interface

## Version 1 — current MVP

Business profile, action dashboard, customers/ledger, visual product/service catalog, GST/non-GST invoices, atomic stock effects, payments, expenses, A4/4 × 6 PDF/print/share, aggregate reports with reusable SVG charts, skeletons, accessibility, swipe actions, and haptics.

## Version 2 candidates

Backup/export/restore, invoice themes, quotations/estimates/proforma/delivery challan, suppliers/purchases, returns, credit/debit notes, camera barcode scan, richer inventory, controlled import/export.

## Version 3 candidates

Staff/roles, multiple businesses/branches, cloud sync, multi-device, CRM, premium features, and privacy-designed online AI assistance.

## Financial decisions

Payments remain separate from invoice totals. Products affect stock; services do not. Profit uses sales revenue minus sold-item cost snapshots minus expenses. Finalized invoices are not silently edited.

## MVP success workflows

A new user can complete business setup; add/search/edit/archive customer and catalog records; create/resume/finalize an invoice; generate selected-size PDF; record payments; inspect ledger/outstanding; verify stock effects; record expense; and inspect aggregate dashboard/report results after restart.

All workflows must pass offline on a physical Android development/preview build before production readiness.
