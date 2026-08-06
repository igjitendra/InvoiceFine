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

### Phase 10B.1 — Vertical Workflow Foundation — source implemented

Migration 4 adds one-to-one, cascade-safe vertical details for draft and finalized invoices, plus typed workflow/category resolution.

### Phase 10B.2 — Vertical Invoice Integration — source implemented

Repair, digital agency, freelancer, salon, plumber, and AC-service fields now appear in the invoice builder according to the saved category. Details save inside the draft transaction, reload during editing, remain linked after finalization, render on finalized invoice screens, and export in A4/4×6 PDFs. Dedicated persistence, cascade, calculation-regression, and PDF tests pass. Physical-phone verification remains required.

## Next planned work

### Phase 11A — Integrity-Checked JSON Export — source implemented

The Legal & Data screen now performs SQLite integrity validation, exports all business tables with schema version and table counts, adds a deterministic corruption checksum, previews the manifest, and shares JSON through the Android share sheet. Text sharing is size-limited to avoid Android intent failures. No destructive operation is enabled.

### Phase 11B.1 — Atomic JSON Restore — source implemented

A pasted InvoiceFine JSON backup now receives checksum, row-cell, table-count, schema-version, and business-profile preflight validation. Restore stays disabled until the current database has been prepared and shared as a safety backup and the user types `RESTORE`. Replacement runs in one exclusive transaction with deferred foreign keys, trusted live-schema columns, foreign-key checks, SQLite integrity checks, and automatic rollback on any failure. Logo, QR, and signature image files are not bundled; only their saved URI references are restored. Physical-phone recovery verification remains required.

### Phase 11B.2 — Native File Import/Export — postponed

Backup/restore is postponed for the current release. Error-producing preview controls are hidden and replaced by an explicit Coming Soon state; Delete Local Data remains safety-locked. Existing backup/restore source is retained for later verified work. Native `.json` files must eventually use exact Expo SDK 57-compatible `expo-file-system` and `expo-document-picker` versions rather than guessed APIs.

Remaining design requirements:

- user-controlled export package
- encrypted/signed backup format
- manifest/schema/app version
- integrity validation
- conflict-safe restore preview
- restore transaction and rollback
- explicit confirmation and test matrix

Do not implement export without restore and integrity checks in the same approved scope.

### Phase 12A — Complete Light/Dark UI Consistency — source implemented

All remaining direct `theme.colors` usage in app/components was removed. Expenses, Add Expense, Catalog form, Business Profile, Customer details, Finalized Invoice, Payments, Customer Ledger, startup/placeholder states, image fields, and dashboard placeholder now consume the live palette. Selected controls use solid accessible states, secondary text contrast was raised, soft-surface text tokens were added, and unfinished backup controls are disabled. Source audit reports zero static theme-color files and WCAG AA palette contrast; physical-phone visual verification remains required.

### Phase 12B — Release stabilization — not started

- negative-stock policy and finalization guard
- pagination/large-data performance audit
- clean and upgraded database migration tests
- complete TalkBack/large-font/360dp review
- development/preview Android build
- full physical E2E checklist
- permission/privacy review
- crash and error-path review without customer-data logging

### Phase 13A — Smart Inline Add — source implemented

Invoice customer and item selectors now expose query-aware create actions. A customer can be created in a theme-safe modal and immediately selected without leaving the draft. Products and services can be created in-place and immediately appended as invoice lines; available create actions respect Product/Service/Both business mode. New category and unit text is resolved transactionally, and product opening stock creates a matching opening stock movement in the same catalog transaction. Physical-phone modal, keyboard, and state-retention verification remains required.

### Phase 13B — Professional Product/Service schema and forms — source implemented

Migration 5 expands catalog records with persisted HSN/SAC, MRP and wholesale pricing, tax-inclusive mode, reorder level, storage/supplier, descriptions and images, physical product attributes, accounting mappings, expiry/batch/warranty/manufacturer data, service pricing model and duration, staff/appointment settings, warranty days, checklist templates, and internal/customer notes. Product and Service forms reveal only relevant sections, keep advanced fields collapsed by default, preserve stock adjustments as movements, and safely default existing catalog rows. Inline service creation now persists duration. Physical-phone form, picker, keyboard, and migration verification remains required.

### Phase 13C — Business Template Engine — source implemented

A schema-driven engine now resolves Medical, Garment, Mobile/Electronics, Repair, Salon, Agency, Freelancer, Restaurant/Food, and CSC/VLE businesses from onboarding category aliases. Each template exposes relevant product/service fields without duplicating entire forms. Migration 6 stores sanitized per-item template JSON with cascade deletion. The catalog form loads and persists template fields, and invoice workflow selection reuses the template workflow while retaining existing vertical invoice snapshots. Physical-phone category switching, migration, keyboard, and create/edit verification remains required.

### Phase 13D — Suggestions, favorites, quick quantity, sticky summary — source implemented

Invoice item selection now ranks persistent favorites first, recently sold items second, and the remaining catalog alphabetically while retaining query search and inline creation. Favorites are stored in Migration 7 and cascade-delete with items. Invoice lines provide ×1/×2/×5/×10 presets, long-press minus resets to one, long-press plus sets ten, and duplicate selection still increments quantity. A theme-aware sticky bottom summary keeps item count, live total, and Save/Update action visible while the draft scrolls. Physical-phone touch, keyboard, safe-area, and small-screen verification remains required.

### Phase 14A — Appearance and live theme — source implemented

System Default, Light, and Dark preferences now resolve through a root Appearance provider and update the live palette immediately. System Default follows Android color-scheme changes. Small, Medium, and Large font preferences scale app text through the shared AppText component. Compact mode reduces shared screen, input, button, tab, and catalog spacing, while Card/List preference changes catalog density. Preferences are validated and persisted in Expo SQLite KV Store so Expo Go remains supported without MMKV/native build dependencies. Physical-phone theme switching, large-font clipping, persistence, and 360dp verification remain required.

### Phase 14B — Professional Settings information architecture — source implemented

A dedicated Settings hub now groups Business, Appearance, Invoice, Data, Notifications, and About. Business summarizes the existing profile/GST/branding setup and links to the complete editor. Invoice settings provide working prefix, A4/4×6, and default due-day controls; new drafts consume the saved due-day default. Automatic numbering and current round-off behavior are shown accurately, while notes, terms, watermarks, CSV tools, encrypted recovery, and customer reminders remain visibly disabled/planned until their engines are implemented. Notification preferences persist without requesting Android permission or claiming delivery. About provides privacy, terms, version/changelog, licenses, and support at jitendraeditiz@gmail.com. The business schema advances to Migration 8 in Phase 14C.

### Final release stabilization and phone QA — source prepared

The release manifest now includes every approved native dependency used by source code, inline sheets retain their runtime string imports, and the sticky invoice action accounts for Android bottom safe area. `scripts/phone-qa.sh` provides one-command Termux checks for dependency resolution, Expo config, strict TypeScript, migrations 1–7, repository regressions, calculations, template workflows, backup-format/restore, unsafe TypeScript, and runtime import mistakes. `docs/PHONE_QA_FINAL.md` separates physical Android verification from source checks. Production certification remains blocked until the checklist passes on an upgrade install and signed preview build.

### Later, only after approval

- WhatsApp-oriented receipt workflow through system sharing
- invoice themes
- controlled CSV/Excel import/export
- suppliers/purchases/returns
- barcode camera scanning
- cloud sync/multi-device/multi-business

## Completion standard

A phase is complete only after source checks and phone TypeScript pass, affected workflows are runtime-tested, and documentation reflects actual behavior. Never convert a sandbox/parser result into a physical-device claim.
