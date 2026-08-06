# InvoiceFine

**Pocket ERP for Indian Small Business**

InvoiceFine is an Android-first, offline-first invoicing and small-business management app built with Expo, React Native, Expo Router, strict TypeScript, and SQLite.

## Current implementation

Core MVP milestones 0–13 are implemented in source. UX phases 1–7 add an action-first dashboard, faster invoice entry, visual catalog cards, customer business insights, SVG reports, light/dark theme support, skeleton loading, swipe actions, and optional haptic feedback.

The project is **not yet production-certified**. The latest patches still require physical Android TypeScript/runtime verification and the release checklist must pass before a production build.

## Active phone project

```text
~/InvoiceFine
```

Do not run `node_modules` from Android shared storage. Use shared storage only for ZIP patches, exports, and backups.

## Common checks

```bash
node node_modules/typescript/bin/tsc --noEmit
node node_modules/expo/bin/cli config --type public
node --import tsx tests/invoice-calculations.test.ts
node node_modules/expo/bin/cli start --clear --host lan
```

## Documentation map

- `CLAUDE.md` — mandatory AI coding instructions
- `docs/PROJECT_STATUS.md` — current implementation and verification status
- `docs/IMPLEMENTATION_PLAN.md` — completed phases and remaining roadmap
- `docs/ARCHITECTURE.md` — technical boundaries and data flow
- `docs/MVP_SCOPE.md` — current release scope
- `docs/DATABASE_SCHEMA.md` — persisted data model and transaction rules
- `docs/UI_DESIGN_SYSTEM.md` — Material 3-inspired light/dark UI rules
- `docs/RELEASE_CHECKLIST.md` — physical Android release gates
- `PHONE_SETUP.md` — Termux workflow

Read `CLAUDE.md` and the relevant docs before editing.
