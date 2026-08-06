# InvoiceFine Final Physical-Phone QA

_Last updated: 2026-08-06_

Automated checks are necessary but do not prove Android runtime behavior. Run `bash scripts/phone-qa.sh`, then complete this checklist on the target phone with Wi-Fi/mobile data disabled for the offline pass.

## 1. Upgrade and cold start

- [ ] Copy the existing app data/device state before testing.
- [ ] Install/update without clearing app data.
- [ ] Existing customers, products, drafts, invoices, payments, expenses, images, and settings remain available.
- [ ] Migrations 1–7 complete without a startup loop or database reset.
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
