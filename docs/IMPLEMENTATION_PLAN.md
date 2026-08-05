# InvoiceFine Implementation Plan

_Last updated: 2026-08-04_

## Delivery rule

Work one bounded milestone/phase at a time. Dependencies, migrations, destructive behavior, external services, and scope expansion require explicit approval.

## Core MVP milestones — implemented in source

- [x] M0 Repository/tooling and Expo Router shell
- [x] M1 Design system and five-tab navigation
- [x] M2 SQLite initialization, migrations, repositories, transactions
- [x] M3 Business onboarding/profile
- [x] M4 Customers
- [x] M5 Products/services/catalog
- [x] M6 Invoice calculation engine and regression tests
- [x] M7 Invoice draft workflow
- [x] M8 Finalization, numbering, stock, cancellation/reversal
- [x] M9 A4/4 × 6 PDF, print, share, profile setting
- [x] M10 Full/partial payments and customer ledger
- [x] M11 Expenses, COGS, gross/net profit
- [x] M12 Aggregate dashboard and reports
- [x] M13 Quality/release-preparation foundation

Implemented does not mean release-certified. Physical release gates remain open.

## UX modernization phases

### Phase 1 — Action Dashboard — implemented

Brand identity, Create Invoice hero, quick actions, actionable recent invoices and low-stock rows.

### Phase 2 — Faster Invoice Builder — implemented

Search by name/SKU/barcode/brand, recently sold items, one-tap quantity controls, duplicate selection increment.

### Phase 3 — Visual Catalog — implemented

Product/service identity, stock states, price/SKU/brand/category, filters, FAB, one-tap edit.

### Phase 4 — Customer Business Profile — implemented

Sales, received, outstanding, invoice/payment recency, call, WhatsApp deep link, edit, ledger.

### Phase 5 — SVG Reports and Theme — implemented

Reusable line/bar/donut/horizontal-bar components, six aggregate charts, tap filters, light/dark theme, A11y states.

### Phase 6 — Interaction Polish — implemented

Dashboard/catalog/report skeletons, reduced-motion support, native-driver press/fade feedback.

### Phase 7 — Fast Actions and Haptics — source implemented

Catalog swipe Edit/Archive with confirmation, invoice swipe Open, primary-action haptics. Requires `expo-haptics` installed through Expo CLI and physical Android verification.

### Phase 8 — Code Quality and Runtime Stability — source implemented

Recent Reports, Catalog, Invoice, chart, gesture, haptic, and aggregate-query files were converted from compressed one-line source to readable formatted TypeScript. A light/dark-safe app-level render error boundary with retry was added. Business calculations, SQL behavior, dependencies, and schema were not changed. Physical-phone TypeScript and runtime verification remain required.

### Phase 9 — Coral Visual Theme — source implemented

A high-contrast coral identity, larger typography, rounded cards, theme-aware shared controls, tabs, Dashboard, Customers, Catalog, Invoices, More, and Reports were aligned for light/dark mode. Phone screenshots then drove a correction: More title/subtitle spacing was rebuilt, Invoice draft and its selection modal now update colors live, and the Customer form was split into readable contact, tax/billing, and notes cards. Physical-phone visual re-verification remains required.

### Phase 10A — Premium Onboarding Foundation — source implemented

Fifteen focused setup screens now capture business type/category, identity, contact and tax details, invoice template/page size, future-ready currency choice, prefixes, payment terms/methods, UPI QR, signature, notification preferences, permission guidance, and a ready summary. Product/Service/Both changes the Catalog tab label and filters available catalog and invoice items. Reports is now a bottom tab; settings remain reachable from Reports. Legal and local-data policy pages are included. Camera permission remains disabled during onboarding.

### Phase 10B — Vertical Business Workflows — not started

Add repair, agency, freelancer, salon, plumber, and AC-service fields through versioned schema, invoice snapshots, edit forms, PDF output, validation, and tests. Do not add UI-only fields that would be lost during finalization.

## Next planned work

### Phase 11 — Data safety and portability — not started

Design before coding:

- user-controlled export package
- encrypted/signed backup format
- manifest/schema/app version
- integrity validation
- conflict-safe restore preview
- restore transaction and rollback
- explicit confirmation and test matrix

Do not implement export without restore and integrity checks in the same approved scope.

### Phase 12 — Release stabilization — not started

- negative-stock policy and finalization guard
- pagination/large-data performance audit
- clean and upgraded database migration tests
- complete TalkBack/large-font/360dp review
- development/preview Android build
- full physical E2E checklist
- permission/privacy review
- crash and error-path review without customer-data logging

### Later, only after approval

- WhatsApp-oriented receipt workflow through system sharing
- invoice themes
- controlled CSV/Excel import/export
- suppliers/purchases/returns
- barcode camera scanning
- cloud sync/multi-device/multi-business

## Completion standard

A phase is complete only after source checks and phone TypeScript pass, affected workflows are runtime-tested, and documentation reflects actual behavior. Never convert a sandbox/parser result into a physical-device claim.
