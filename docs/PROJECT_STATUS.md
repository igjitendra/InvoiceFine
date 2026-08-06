# InvoiceFine Project Status

_Last updated: 2026-08-06_

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
10. Premium onboarding and vertical workflows — 15-step setup, dynamic business mode, Reports tab, Legal & Data hub, Migration 4 vertical details, category-specific invoice forms, transactional draft persistence, finalized display, and PDF export implemented in source; physical-phone verification pending
11. Data safety and restore — underlying integrity/restore source retained, but backup/restore is postponed for this release; active preview controls are replaced by Coming Soon and destructive deletion remains safety-locked
12. Complete light/dark consistency — all remaining static app/component theme colors converted to live palette; Expenses, forms, profiles, invoice/payment screens, selected states, secondary text, and legal/data surfaces corrected; physical-phone verification pending
13. Smart Inline Add — query-aware New Customer/Product/Service actions, modal creation without leaving invoice, automatic select/add, business-mode filtering, category/unit resolution, and atomic opening-stock movements implemented; physical-phone verification pending
14. Professional Product/Service schema and forms — Migration 5, persisted product/service professional fields, progressive Basic/Advanced sections, local image selection, service pricing/duration/staff/checklist, product inventory/accounting/optional details, and safe legacy defaults implemented; physical-phone verification pending
15. Business Template Engine — Migration 6, nine schema-driven vertical templates, category alias resolution, sanitized per-item JSON persistence, cascade cleanup, dynamic catalog fields, and template-aware invoice workflow routing implemented; physical-phone verification pending
16. Invoice speed tools — Migration 7 persistent favorites, favorite/recent-first suggestions, query search, duplicate increment, quick quantity presets, long-press quantity shortcuts, and live sticky total/save summary implemented; physical-phone verification pending
17. Final release stabilization — missing approved native dependencies restored in package manifest, inline string-import runtime fix retained, sticky invoice action respects bottom safe area, automated Termux QA runner and final physical-phone matrix added; production certification still pending phone results
18. Phase 14A Appearance and live theme — System/Light/Dark live switching, Android system following, persisted Small/Medium/Large app text, Compact mode, Card/List catalog preference, dashboard Settings entry, and SQLite KV persistence implemented without a new native dependency; physical-phone verification pending
19. Phase 14B Professional Settings — grouped Business/Appearance/Invoice/Data/Notifications/About hub, business summary, working prefix/page-size/due-day defaults, new-draft due-date integration, persisted notification preferences without delivery claims, locked future data engines, legal/version/support destinations, and updated support contact implemented; physical-phone verification pending

## Reports currently supported

- Monthly Sales — line/area chart
- Monthly Profit — bar chart
- Expense Breakdown — donut
- Top Products — horizontal bars
- Sales by Category — horizontal bars
- Paid vs Pending — donut

Charts use SQLite aggregates and `react-native-svg`; no heavy chart library is approved.

## Theme and interaction

- User-selectable System/Light/Dark theme with instant live palette updates; System follows Android changes
- Persisted Small/Medium/Large app text scaling through the shared AppText surface
- Persisted Compact mode and Card/List catalog density preference
- Material 3-inspired surfaces with WCAG AA core text contrast
- Safe-area/status-bar handling
- native-driver transitions
- accessible reduced-motion skeletons
- swipe actions with accessible alternatives
- optional Expo haptic feedback

## Dependencies requiring Expo CLI

```bash
node node_modules/expo/bin/cli install react-native-svg expo-haptics expo-print expo-sharing
```

Run only when the module is absent from the phone project.

## Verification truth

Source syntax checks and invoice calculation tests have passed during patch construction. The app must not be described as production-ready until the latest combined source passes on the physical phone:

```bash
bash scripts/phone-qa.sh
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
