# InvoiceFine Project Status

_Last updated: 2026-08-04_

## Product identity

**InvoiceFine — Pocket ERP for Indian Small Business**

Android-first, offline-first invoicing, stock, payments, expenses, customer ledger, PDF, and business reporting for one business on one device.

## Implementation status

### Core milestones

Milestones 0–13 are implemented in source:

- Expo/Router shell and strict TypeScript
- design system/navigation
- SQLite migrations/repositories
- onboarding/business profile
- customers
- products/services
- deterministic invoice calculations
- invoice drafts
- atomic finalization, numbering, stock, and cancellation
- A4/4 × 6 PDF, print, and sharing
- payments and customer ledger
- expenses, COGS, gross/net profit
- aggregate dashboard/reports
- quality/release documentation foundation

### UX phases

1. Action-first dashboard — implemented
2. Faster invoice builder — implemented
3. Visual catalog cards — implemented
4. Customer business profile — implemented
5. Reusable SVG visual reports — implemented
6. Skeletons and interaction polish — implemented
7. Swipe fast actions and haptics — implemented in source; physical-phone verification pending
8. Code quality and runtime stability — recent minified source formatted and app render error boundary added; physical-phone verification pending
9. Coral visual theme — larger typography, rounded surfaces, centralized accessible light/dark palette, and main-tab screen conversion; More header overlap and Invoice/Customer live light-mode readability corrected from phone screenshots; physical-phone re-verification pending
10. Premium onboarding foundation — 15-step setup, business-mode persistence, dynamic Products/Services/Catalog and Reports tabs, business-mode item filtering, premium preferences, and Legal & Data hub implemented in source; vertical-specific invoice fields and physical-phone verification pending

## Reports currently supported

- Monthly Sales — line/area chart
- Monthly Profit — bar chart
- Expense Breakdown — donut
- Top Products — horizontal bars
- Sales by Category — horizontal bars
- Paid vs Pending — donut

Charts use SQLite aggregates and `react-native-svg`; no heavy chart library is approved.

## Theme and interaction

- Automatic light/dark theme
- Material 3-inspired surfaces and contrast
- Safe-area/status-bar handling
- native-driver transitions
- accessible reduced-motion skeletons
- swipe actions with accessible alternatives
- optional Expo haptic feedback

## Dependencies requiring Expo CLI

```bash
node node_modules/expo/bin/cli install react-native-svg
node node_modules/expo/bin/cli install expo-haptics
```

Run only when the module is absent from the phone project.

## Verification truth

Source syntax checks and invoice calculation tests have passed during patch construction. The app must not be described as production-ready until the latest combined source passes on the physical phone:

```bash
node node_modules/typescript/bin/tsc --noEmit
node node_modules/expo/bin/cli config --type public
node --import tsx tests/invoice-calculations.test.ts
```

The latest dark-mode, skeleton, swipe, and haptic behavior also requires physical runtime confirmation.

## Known follow-up risks

- Prevent or explicitly confirm invoice finalization that would make product stock negative.
- Run a clean-database and upgrade-migration test without data reset.
- Validate every report chart with empty, single-point, and large datasets.
- Validate 360dp width, large fonts, TalkBack, keyboard, light/dark switching, and Android gesture navigation.
- Validate Expo development/preview build, not only Expo Go.
- Design encrypted export/import together before implementing backup/restore.
- Confirm no real customer data or credentials are included in support ZIPs.

## Not yet production-certified

No production readiness claim is allowed until `docs/RELEASE_CHECKLIST.md` passes on a physical Android development/preview build.
