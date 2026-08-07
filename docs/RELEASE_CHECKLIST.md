# InvoiceFine Android Release Checklist

_Last updated: 2026-08-06_

InvoiceFine is not production-ready until every required gate passes on a physical Android development/preview build.

## Automated gates

Run once from `~/InvoiceFine`:

```bash
bash scripts/phone-qa.sh
```

- [ ] Required Expo/native dependencies resolve from `node_modules`
- [ ] Expo public configuration loads
- [ ] Strict TypeScript passes
- [ ] Clean and every-version upgrade matrix for Migrations 1–9 passes
- [ ] Invoice calculation, vertical workflow, template, backup-format, and restore tests pass
- [ ] Runtime strings/theme import audit passes
- [ ] fresh database reaches schema version 9
- [ ] databases starting at every version 1–8 upgrade without reset/data loss
- [ ] migration rerun is idempotent and schema registry remains exactly 1–9
- [ ] no unsafe TypeScript suppression
- [ ] no business SQL outside `db/`
- [ ] approved dependencies only and Expo-compatible versions

## Dependency/runtime gates

- [ ] `react-native-svg` resolves and all six charts render
- [ ] `expo-haptics` resolves; unsupported devices fail silently without blocking actions
- [ ] PDF print/share modules work in target build
- [ ] Expo configuration contains no unsupported StatusBar prop or accidental permission

## Ten business workflows

1. [ ] Complete/edit onboarding including A4 and 4 × 6 selection.
2. [ ] Create/edit/search/archive customer; call/WhatsApp/ledger paths behave safely.
3. [ ] Create/edit/search/archive product/service; verify low/out-of-stock states.
4. [ ] Create multi-item draft using inline create, favorites/recent suggestions, quantity presets/long-press controls, sticky summary, and resume after restart.
5. [ ] Finalize once; verify invoice number, snapshots, stock, and duplicate-tap protection.
6. [ ] Generate/print/share one A4 and one 4 × 6 invoice.
7. [ ] Record partial/final payments and block overpayment.
8. [ ] Verify ledger, receivables, paid/pending status.
9. [ ] Add expense and verify COGS/gross/net date-range results.
10. [ ] Verify dashboard and all six report charts, tap filters, and clear filter.

## UI/accessibility

- [ ] 360dp and common phone widths
- [ ] light and dark theme
- [ ] status bar, safe area, tabs, and gesture footer
- [ ] keyboard/focused fields/save actions
- [ ] 44-point targets
- [ ] TalkBack labels, states, errors, loading, and chart meaning
- [ ] reduced-motion skeleton behavior
- [ ] swipe actions do not block vertical scrolling and have alternatives
- [ ] archive confirmation, cancel, success, and error paths

## Data safety

- [ ] negative-stock policy approved and enforced
- [ ] finalization/payment/cancellation conflict paths tested
- [ ] no real data in logs, fixtures, screenshots, or support ZIPs
- [ ] Android backup behavior matches `docs/BACKUP_STRATEGY.md`
- [ ] uninstall/clear-data warning is documented
- [ ] encrypted `.ifb` database backup/restore is active; Delete Local Data remains locked

## Phase 14G encrypted backup/restore gates

- [ ] `expo-crypto` and `@noble/hashes` resolve with strict TypeScript
- [ ] Password shorter than 8 or mismatched confirmation is rejected
- [ ] Export writes only `.ifb`, never raw database JSON
- [ ] SQLite integrity passes before encryption and source records remain unchanged
- [ ] Schema-9 tables, templates, favorites and service reminders are represented
- [ ] Wrong password, changed header and changed ciphertext all fail before mutation
- [ ] Correct password shows created date, schema and record count before restore
- [ ] Different schema version and invalid business-profile count are rejected
- [ ] Confirmed restore is atomic and rolls back after a forced constraint failure
- [ ] Notification native IDs are cleared and schedules rebuild after restore
- [ ] Large-dataset encryption/decryption remains responsive on the target phone
- [ ] Low-storage, picker cancellation and interrupted save leave database unchanged
- [ ] Password is absent from logs, files, SQLite and settings storage
- [ ] Local image references are retained; non-embedded image-file limitation is visible

## Phase 14F notification/reminder gates

- [ ] SDK 57 Expo Go starts without evaluating `expo-notifications` and shows a development-build-required state
- [ ] Expo Go can save preferences/reminder data but does not claim or attempt notification delivery
- [ ] Notification delivery gates are completed in an InvoiceFine development/preview build
- [ ] No notification permission prompt appears merely from launching the app
- [ ] Enable Notifications creates both Android channels and requests permission once
- [ ] Denied permission leaves preferences/reminders saved without claiming delivery
- [ ] Due-payment and low-stock summaries schedule only when matching records exist
- [ ] Daily 8 PM and Monday 9 AM summary preferences schedule without duplicates
- [ ] Test Notification displays while foregrounded and in background
- [ ] Service reminder customer/service/date/time/notes/recurrence persist through Migration 9
- [ ] One-time Complete moves to history; recurring Complete advances to the next valid date
- [ ] Cancel removes the native scheduled notification and preserves history
- [ ] Overdue reminders remain visible and are not silently discarded
- [ ] Notification taps route to Invoices, Catalog, Reports, or Service Reminders
- [ ] No Expo/device push token API or cloud registration exists
- [ ] Exact-alarm, reboot persistence, battery optimization, and timezone changes are tested on Android

## Phase 14E selected-export gates

- [ ] Selecting any combination of the seven datasets saves one CSV per non-empty selection
- [ ] Share is enabled only when exactly one dataset is selected
- [ ] All time, This month, and Financial year counts match exported invoice/payment/expense rows
- [ ] Include archived affects only customers, products, services, and stock
- [ ] Rupees show two decimals; GST and quantities are human-readable rather than raw integers
- [ ] Invoice export includes status, taxes, paid, and outstanding values
- [ ] Stock export includes current/low/reorder quantities, status, and stock-at-cost value
- [ ] Commas, quotes, Unicode, and line breaks open correctly in a spreadsheet
- [ ] Empty datasets are skipped with a clear message
- [ ] Export queries do not modify, archive, or delete local data

## Phase 14C–14D CSV gates

- [ ] Customer, Product, and Service CSV routes open from Settings → Data
- [ ] Samples save through the Android folder picker and reopen through Document Picker
- [ ] Smart aliases map common columns and manual mapping can return a column to Ignore
- [ ] First 20 rows show valid, warning, and failed states before import
- [ ] Negative numeric values, empty names, invalid GST rates, and invalid service models fail validation
- [ ] Duplicate phone/SKU/barcode Skip, Update, and Create policies behave as labeled
- [ ] Missing item categories and units are created without duplicates
- [ ] New product opening stock creates exactly one matching stock movement
- [ ] Service rows without SAC import and appear in the pending-classification summary
- [ ] Error/warning reports share as readable UTF-8 CSV
- [ ] Existing data and stock remain unchanged after a fatal transaction error

## Phase 14B Settings gates

- [ ] Dashboard and Reports Settings buttons open the grouped Settings hub
- [ ] Business summary matches saved profile, GST, branding and prefixes
- [ ] Editing the complete Business Profile returns safely without data loss
- [ ] Invoice prefix, A4/4×6 and due-day defaults persist after restart
- [ ] A new invoice receives the saved default due date; existing drafts keep their own date
- [ ] Notification choices persist; Android permission is requested only from the explicit Enable action
- [ ] Customer/Product/Service CSV, service reminders and encrypted recovery open; notes, terms and watermark controls remain clearly non-active
- [ ] Privacy, Terms, Version/Changelog and support email destinations work
- [ ] Encrypted backup/restore opens; Delete Local Data remains safety-locked

## Phase 14A appearance gates

- [ ] System Default follows Android light/dark changes while the app is open
- [ ] Light and Dark selections update immediately without restart
- [ ] Theme, font size, compact mode, and catalog view survive force-stop/restart
- [ ] Small/Medium/Large affect all app text without clipping critical actions
- [ ] Compact mode preserves 44-point touch targets and keyboard access
- [ ] Card/List catalog modes update immediately and preserve search/swipe/archive behavior
- [ ] Appearance remains readable at 360dp and Android large display/font scaling

## Phase 13 workflow gates

- [ ] Inline Customer/Product/Service forms open without render errors and preserve draft state
- [ ] Professional Product/Service fields round-trip through Migration 5
- [ ] Nine Business Template Engine categories resolve and persist through Migration 6
- [ ] Favorites persist and cascade correctly through Migration 7
- [ ] Sticky invoice summary remains above keyboard and Android gesture/navigation area
- [ ] `docs/PHONE_QA_FINAL.md` is completed with evidence/blockers

## Build gate

- [ ] create development/preview Android build
- [ ] install on physical device
- [ ] repeat all workflows offline
- [ ] restart app/device during persistence tests
- [ ] verify upgrade install preserves data
- [ ] only then prepare production signing/build
