# Implementation Plan for AI-Assisted Development

## Rule

Complete one milestone at a time. Do not ask AI to build the entire app in one prompt.

## Milestone 0 — Repository and tooling

- create Expo TypeScript project
- configure Expo Router
- add project instructions and docs
- configure strict TypeScript
- configure NativeWind only after verifying compatibility
- add basic lint/typecheck scripts
- create folder structure
- build app shell with safe areas and status bar

Acceptance: app opens on a physical Android device with no route or TypeScript errors.

## Milestone 1 — Design system and navigation

- theme tokens
- centralized strings
- reusable Button, Input, Card, EmptyState, LoadingState, MoneyText
- bottom tabs
- professional dashboard placeholder
- keyboard and footer-safe screen container

Acceptance: all screens respect status bar, safe area, footer, spacing, and narrow Android width.

## Milestone 2 — SQLite foundation

- database initialization
- foreign keys
- migration runner
- initial schema
- repository interfaces
- transaction helper
- synthetic seed data for development only

Acceptance: migrations are repeatable and data survives restart.

## Milestone 3 — Business onboarding

- business profile form
- GST mode
- invoice numbering settings
- logo/signature selection if compatible

Acceptance: profile saves, reloads, validates, and can be edited.

## Milestone 4 — Customers

- customer list/search
- add/edit customer
- customer detail
- empty/error/loading states

Acceptance: customer CRUD works offline without raw SQL in screens.

## Milestone 5 — Products and services

- unified item repository
- product/service forms
- categories and units
- product stock settings
- catalog search/filter

Acceptance: products and services are clearly distinguished and survive restart.

## Milestone 6 — Invoice calculations

- currency helpers using integer paise
- subtotal, discount, GST, rounding, and total
- intra-state CGST/SGST versus inter-state IGST rules based on verified inputs
- unit tests for boundaries

Acceptance: deterministic tests cover tax and rounding cases.

## Milestone 7 — Invoice draft UI

- choose customer
- add products/services
- edit quantity/price/discount
- live totals
- notes and due date
- save draft

Acceptance: draft can be resumed after app restart.

## Milestone 8 — Finalization and stock

- transaction-based finalization
- atomic invoice number allocation
- item snapshots
- stock-out movements
- cancellation and reversal rules

Acceptance: repeated taps cannot create duplicate finalized invoices or duplicate stock movements.

## Milestone 9 — PDF, print, and share

- professional A4 invoice HTML
- page-break handling
- logo/signature/QR configuration
- PDF generation
- system share sheet
- print action

Acceptance: multi-item invoice produces a readable A4 PDF and shares without exposing temporary debug data.

## Milestone 10 — Payments and ledger

- partial/full payments
- invoice payment status
- customer ledger
- receivables

Acceptance: outstanding equals invoice total minus valid payments and persists correctly.

## Milestone 11 — Expenses and profit

- expense categories and forms
- COGS from sold item cost snapshots
- gross profit and net profit
- date-range query engine

Acceptance: report calculations have unit/integration tests and use paise.

## Milestone 12 — Dashboard and reports

- aggregated dashboard queries
- daily/monthly/custom reports
- recent invoices
- low-stock list
- report empty/error/loading states

Acceptance: dashboard does not read all database records into JavaScript.

## Milestone 13 — Quality and release preparation

- permission review
- accessibility review
- Android narrow-screen review
- keyboard/status bar/footer review
- database migration test
- backup strategy decision
- development/preview build
- manual end-to-end test checklist

Acceptance: the ten MVP success workflows in `PRODUCT_SPEC.md` pass on a physical Android device.
