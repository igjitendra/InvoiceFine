# InvoiceFine Final Physical-Phone QA

_Last updated: 2026-08-06_

Automated checks are necessary but do not prove Android runtime behavior. Run `bash scripts/phone-qa.sh`, save the complete terminal output, then complete this checklist on the target phone with Wi-Fi/mobile data disabled for the offline pass.

## Test evidence

- Device/model:
- Android version:
- Expo Go or preview-build version:
- Test date/time:
- Installed as fresh or upgrade:
- Source ZIP SHA-256:
- `AUTOMATED_PHONE_QA` result:
- Tester:
- Blockers/evidence links:

## 1. Upgrade and cold start

- [ ] Copy the existing app data/device state before testing.
- [ ] Install/update without clearing app data.
- [ ] Existing customers, products, drafts, invoices, payments, expenses, images, and settings remain available.
- [ ] Migrations 1–9 complete without a startup loop or database reset.
- [ ] Force-stop and reopen three times; no render error appears.
- [ ] Rotate request is ignored because portrait orientation is intentional.

## 2. Onboarding and settings

- [ ] Complete all onboarding steps on a fresh test install.
- [ ] Product, Service, and Both modes change catalog/invoice choices correctly.
- [ ] Business category activates the correct Business Template Engine fields.
- [ ] A4 and 4×6 selections persist from onboarding and Business Profile.
- [ ] Image picker requests photos only; camera and microphone are not requested.
- [ ] Settings → Appearance opens from Dashboard Settings and More.
- [ ] System Default follows Android theme changes while the app remains open.
- [ ] Light and Dark apply immediately without restarting.
- [ ] Small/Medium/Large update app text and keep primary actions visible.
- [ ] Compact mode reduces spacing without shrinking required touch targets.
- [ ] Card/List catalog preference changes density without breaking search/swipe/archive.
- [ ] Theme, font size, compact mode, and catalog view survive force-stop/restart.

## 2A. Professional Settings

- [ ] Dashboard and Reports gear buttons open Settings.
- [ ] Business summary reflects current profile, GST, logo/signature/QR and prefixes.
- [ ] Appearance opens and preserves all Phase 14A behavior.
- [ ] Change Invoice Prefix, A4/4×6 and Default Due Days; force-stop/reopen and verify persistence.
- [ ] Create a new invoice and verify its due date; reopen an existing draft and confirm its saved date is unchanged.
- [ ] Save notification preferences; confirm Android permission is requested only after pressing Enable Notifications.
- [ ] Customer/Product/Service CSV, service reminders and encrypted backup/restore are active; Delete Local Data, default notes, terms and watermarks remain visibly planned/locked.
- [ ] Privacy, Terms, Version/Changelog, Licenses and support email open correctly.

## 2B. Customer, Product and Service CSV

- [ ] Save each sample to Downloads, reopen it, and confirm smart mapping.
- [ ] Confirm manual mapping cycles through valid fields and returns to Ignore.
- [ ] Preview files with more than 20 rows; only the first 20 render while totals cover all rows.
- [ ] Test Product Skip/Update/Create with duplicate SKU and duplicate barcode.
- [ ] Import a product with a new category/unit and opening stock; confirm one category, one unit, current stock, and one opening movement.
- [ ] Test Service Skip/Update/Create with duplicate SKU.
- [ ] Import a service without SAC; confirm success and pending-classification count.
- [ ] Test invalid negative price/stock, GST over 100, pricing model, duration and warranty rows.
- [ ] Share the error/warning CSV and open it in a spreadsheet/text app.
- [ ] Force-stop/reopen and verify imported products and services remain available.

## 2C. Selected CSV exports

- [ ] Open Settings → Import & Export → Selected CSV Exports.
- [ ] Verify live counts for Customers, Products, Services, Expenses, Payments, Invoices, and Stock.
- [ ] Select multiple datasets, choose Downloads once, and confirm one file per non-empty selection.
- [ ] Select exactly one dataset and verify Android sharing; confirm sharing is disabled for zero/multiple selections.
- [ ] Compare All time, This month, and Financial year invoice/payment/expense exports.
- [ ] Toggle Include archived and verify only master-data/stock counts change.
- [ ] Open CSVs containing Hindi/Unicode, commas, quotes, and line breaks.
- [ ] Verify INR values, GST percentages, quantities, paid/outstanding, and stock-at-cost are readable.
- [ ] Select an empty dataset and verify the clear no-records/skipped message.
- [ ] Reopen the app and confirm no source records were modified by export.

## 2D. Encrypted backup and restore

- [ ] Open Settings → Import & Export → Encrypted Backup & Restore.
- [ ] Confirm short and mismatched passwords are rejected.
- [ ] Create a backup and select a user-controlled Android folder.
- [ ] Confirm the saved file ends in `.ifb` and does not expose customer text when opened.
- [ ] Keep the original app open; verify export did not modify record counts.
- [ ] Choose the `.ifb`, enter a wrong password, and confirm current records remain unchanged.
- [ ] Modify one character in a copied `.ifb`; confirm authentication fails before preview.
- [ ] Enter the correct password; confirm created time, schema 9 and record count preview.
- [ ] Cancel at the final destructive warning; confirm current records remain unchanged.
- [ ] On test data only, confirm restore and verify profile, customers, catalog, templates, favorites, invoices, payments, expenses, stock and service reminders.
- [ ] Verify restored reminder native IDs are replaced and notifications are not duplicated.
- [ ] Force a restore constraint failure in a test build and confirm full rollback.
- [ ] Test picker cancellation, denied folder permission, low storage and a large database.
- [ ] Confirm password never appears in app storage, logs, the `.ifb` header or Settings.
- [ ] Verify the warning that local image files are not embedded; URI references alone may not recover after device loss.

## 2E. Notifications and service reminders

- [ ] Fresh install/upgrade opens without an unsolicited notification permission prompt.
- [ ] Tap Enable Notifications; grant permission and verify Business Reminders and Customer Service Reminders channels in Android settings.
- [ ] Send a test notification in foreground and background.
- [ ] Enable Due Payments and Low Stock with matching data; verify one schedule each and no duplicates after reopening.
- [ ] Enable Daily Summary and Weekly Report; verify 8 PM and Monday 9 AM schedule behavior.
- [ ] Create one-time and recurring reminders with customer, optional service, notes, future date and time.
- [ ] Complete one-time reminder; verify history. Complete recurring reminder; verify next valid occurrence.
- [ ] Cancel a pending reminder and confirm it no longer fires.
- [ ] Create an overdue test reminder through date/time passage and confirm the OVERDUE state remains visible.
- [ ] Tap due, stock, summary, and service notifications; verify destination screens.
- [ ] Reboot the phone and verify future scheduled reminders remain registered.
- [ ] Change timezone and check displayed/scheduled local time before relying on production reminders.
- [ ] Deny permission once; confirm preferences/reminders remain saved and no delivery claim is shown.

## 3. Zero-navigation invoice workflow

- [ ] Start a new invoice and enter dates/notes.
- [ ] Search a missing customer, create it inline, and confirm automatic selection.
- [ ] Search a missing product, create it inline with opening stock, and confirm automatic line addition.
- [ ] Create a service inline and confirm duration persistence.
- [ ] Cancel every inline sheet once; draft state must remain unchanged.
- [ ] Add the same item twice; one line remains and quantity increments.
- [ ] Favorite/unfavorite an item; favorite remains after app restart.
- [ ] Favorites rank before recent items; recent items rank before alphabetical items.
- [ ] Test ×1/×2/×5/×10, manual decimal quantity, and long-press minus/plus.
- [ ] Sticky total/save bar remains above Android gesture/navigation area and keyboard.
- [ ] Save, close, reopen, edit, and finalize exactly once.

## 4. Catalog and templates

- [ ] Create/edit one professional Product with HSN, MRP, wholesale, tax-inclusive, inventory, image, accounting, and optional fields.
- [ ] Create/edit one professional Service with SAC, pricing model, duration, staff, appointment, checklist, and notes.
- [ ] Verify Medical, Garment, Mobile, Repair, Salon, Agency, Freelancer, Restaurant, and CSC/VLE template fields using test records.
- [ ] Archive actions require confirmation and archived rows leave active lists.

## 5. Financial integrity

- [ ] Finalizing a product invoice reduces stock exactly once.
- [ ] Repeated finalize tap does not allocate two invoice numbers or stock movements.
- [ ] Cancel eligible invoice and verify stock reversal exactly once.
- [ ] Record partial payment, final payment, and rejected overpayment.
- [ ] Customer ledger and receivables match invoice/payment totals.
- [ ] Add expense and confirm gross/net profit reports.

## 6. PDF and sharing

- [ ] Generate A4 PDF; one invoice uses one page and content is not clipped.
- [ ] Generate 4×6 PDF; page dimensions and text are usable.
- [ ] Print and share both sizes through Android chooser.
- [ ] Logo, QR, signature, customer address, GST, totals, and notes render correctly.
- [ ] Sharing cancellation returns safely to the invoice.

## 7. UI, accessibility, and resilience

- [ ] Test at 360dp width and the phone's normal display/font scaling.
- [ ] Test light and dark mode across Dashboard, Invoice, Customer, Catalog, Reports, Expenses, More, and Legal.
- [ ] Keyboard does not hide focused inputs or primary actions.
- [ ] Android back closes modal/sheet before leaving its parent screen.
- [ ] TalkBack announces buttons, selected states, quantities, errors, totals, and favorites.
- [ ] Swipe actions do not block vertical scrolling and button alternatives remain available.
- [ ] Offline cold start, create/edit/finalize, reports, and PDF generation work without network.
- [ ] No customer/business data appears in Metro logs or screenshots used for support.

## Release decision

- [ ] All automated checks pass.
- [ ] Every required physical-phone item above passes or has a documented blocker.
- [ ] Upgrade install preserves real test data.
- [ ] A signed preview build passes the offline matrix.
- [ ] Production build/signing starts only after these gates pass.
