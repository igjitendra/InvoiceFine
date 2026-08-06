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
- [ ] Migrations 1–7 and all repository regression tests pass
- [ ] Invoice calculation, vertical workflow, template, backup-format, and restore tests pass
- [ ] Runtime strings/theme import audit passes
- [ ] fresh database reaches latest migration
- [ ] existing database upgrades without reset/data loss
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
- [ ] export/import is not advertised until restore/integrity tests exist

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
