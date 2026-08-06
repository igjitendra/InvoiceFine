# InvoiceFine — AI Development Instructions

_Last updated: 2026-08-04_

## Mission

Build and stabilize **InvoiceFine — Pocket ERP for Indian Small Business**, a trustworthy Android-first, offline-first business app using Expo, React Native, Expo Router, strict TypeScript, and SQLite.

The current source includes the MVP business workflows and UX phases through Phase 7. Future work must improve and verify the existing app without silently expanding product scope.

## Mandatory workflow

1. Read `docs/PROJECT_STATUS.md` and all docs relevant to the task before editing.
2. Inspect the actual repository; documentation is guidance, source is the implementation truth.
3. State task scope, affected files, acceptance criteria, dependency changes, and migration changes before coding.
4. Work on one bounded task at a time and preserve unrelated user changes.
5. Never add or upgrade a dependency without explaining why and receiving approval.
6. Use Expo CLI for Expo modules so the installed SDK-compatible version is selected.
7. Run TypeScript and relevant checks after edits. Do not claim phone/runtime verification without user confirmation.
8. Report exact checks, failures, remaining limitations, and files changed.
9. Never commit, merge, push, reset, or force-push unless explicitly requested.
10. Never use destructive Git commands such as `git reset --hard` or `git push --force`.

## Current technical baseline

- Expo SDK 57 / Expo Router
- React Native + strict TypeScript with `noUncheckedIndexedAccess`
- `expo-sqlite` as business-data source of truth
- React Hook Form for forms
- `expo-image-picker` for approved profile images
- `expo-print` and `expo-sharing` for invoice PDF workflows
- `react-native-svg` as the only chart rendering engine
- `expo-haptics` approved for UX Phase 7; install with Expo CLI before compiling that phase
- automatic light/dark color scheme

Do not introduce a heavy chart library, backend, analytics, cloud sync, ads, or AI service without approval.

## Architecture boundaries

- `app/`: Expo Router routes and screen composition.
- `components/`: reusable UI and feature components.
- `constants/`: centralized strings, theme, routes, and fixed values.
- `db/`: SQLite initialization, migrations, SQL, repositories, and transactions.
- `hooks/`: reusable UI-to-data coordination.
- `lib/`: deterministic calculations and small cross-platform helpers. Platform wrappers such as haptic helpers may live here only when they remain isolated and contain no business persistence.
- `services/`: PDF, print, sharing, files, and other platform workflows.
- `types/`: shared domain types.
- `tests/`: deterministic synthetic tests.

Screens/components must not contain raw SQL, invoice tax formulas, stock mutation rules, or profit calculations.

## Data and accounting rules

- Persist business data in SQLite; do not duplicate it in UI state stores.
- Money is integer paise. Quantities use the central scaled-integer strategy.
- Use ISO dates/timestamps and validate at boundaries.
- Use versioned migrations; never delete the database to apply schema changes.
- Invoice finalization, payment recording, cancellation, stock movement, and numbering must remain transaction-safe.
- Finalized records are auditable and cannot be silently edited.
- Invoice snapshots preserve historical business/customer/item/cost/tax data.
- Profit = recognized sales − COGS − expenses for the selected period.
- Reports must aggregate in SQLite and must not load full tables into JavaScript.

## UI and accessibility rules

Follow `docs/UI_DESIGN_SYSTEM.md`.

- Android-first Material 3-inspired UI, responsive from 360dp.
- Automatic light and dark theme; every changed screen must be checked in both.
- Use centralized visible strings and vector icons.
- Respect safe areas, status bar, keyboard, tab bar, and Android navigation.
- Minimum touch target 44×44.
- Provide loading, skeleton, empty, error, disabled, and success states.
- Use native-driver animations where possible and respect reduced-motion settings.
- Swipe actions require a visible or accessible alternative.
- Confirm destructive actions and provide clear success/error feedback.

## PDF rules

- One invoice per selected page.
- Supported profile setting: A4 or 4 × 6 inch; default A4.
- The selected page size controls generated PDF, print, and share.
- PDF content uses persisted invoice snapshots.
- Sharing uses the operating-system share sheet; never claim guaranteed WhatsApp delivery.

## Privacy and safety

- Offline-first: no backend or telemetry is currently approved.
- Do not log or package customer, GSTIN, payment, invoice, signature, or local database data.
- Use synthetic data in tests and screenshots.
- Do not share `.env`, keystores, credentials, SQLite files, generated invoices, `node_modules`, `.expo`, or `.git` with external AI tools.

## Definition of done

A task is complete only when acceptance criteria are met, TypeScript passes on the target project, relevant tests pass, affected states and themes are handled, no unrelated scope was added, documentation is updated when behavior/setup changes, and runtime claims match actual physical-device verification.
