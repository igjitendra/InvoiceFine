# InvoiceFine Phase 14H Final Source Validation

_Date: 2026-08-06_

This report certifies sandbox source and SQLite regression checks only. It does not certify physical Android runtime behavior, Expo Go/native-module behavior, exact alarms, file-provider workflows, or production readiness.

## Final source gates

```text
MIGRATION_SEQUENCE_1_TO_10=PASS
CLEAN_DATABASE_TO_10=PASS
UPGRADE_MATRIX_1_TO_10=PASS
UPGRADE_DATA_PRESERVATION=PASS
MIGRATION_IDEMPOTENCY=PASS
FINAL_SCHEMA_FOREIGN_KEYS_AND_INTEGRITY=PASS
SDK57_DEPENDENCY_MATRIX=PASS
EXPO_CONFIG_MANIFEST=PASS
FINAL_ROUTE_INVENTORY=PASS
LOCAL_NOTIFICATIONS_ONLY=PASS
EXPO_GO_NOTIFICATION_IMPORT_GUARD=PASS
CSV_FOLDER_CANCEL_NO_THROW=PASS
CSV_SAMPLE_PROMISE_HANDLING=PASS
BUSINESS_IDENTITY_PDF=PASS
NON_TAX_PDF_GST_VISIBILITY=PASS
TAX_PDF_TOTALS=PASS
PARTIAL_PAYMENT_PDF=PASS
PAYMENT_DISCOUNT_PDF=PASS
KEEP_REMAINDER_AS_DUE=PASS
DISCOUNT_REMAINDER_AND_CLOSE=PASS
ACTUAL_PAYMENT_NOT_INFLATED=PASS
PAYMENT_SETTLEMENT_MIGRATION_10=PASS
PDF_SHARE_STABLE_FILE=PASS
COMPLETE_SCHEMA10_BACKUP_COVERAGE=PASS
AES_GCM_PBKDF2_FORMAT=PASS
PREFLIGHT_BEFORE_ATOMIC_RESTORE=PASS
ATOMIC_RESTORE_SUCCESS=PASS
ATOMIC_RESTORE_ROLLBACK=PASS
DEVICE_NOTIFICATION_IDS_RESET=PASS
WRONG_PASSWORD_TAMPER_REJECTION=PASS
SEVEN_SELECTED_EXPORTS=PASS
CUSTOMER_CSV_FIELDS_MIGRATION=PASS
ATOMIC_CATALOG_CSV_IMPORT=PASS
PROFESSIONAL_CATALOG_SAFE_UPGRADE=PASS
INLINE_ADD_DATABASE_INTEGRITY=PASS
NINE_VERTICAL_TEMPLATES=PASS
INVOICE_CALCULATION_TESTS=PASS
VERTICAL_INVOICE_TESTS=PASS
FULL_REGRESSION_SUITE=PASS
Parsed 199 TypeScript files; failures: 0
RUNTIME_IMPORT_AND_TEXT_AUDIT=PASS
UNSAFE_TYPESCRIPT=NONE
STATIC_THEME_FILES=0
PHASE14H_FINAL_SOURCE_GATES=PASS
```

## Phase 14H changes

- Added a clean plus every-prior-version migration matrix from schemas 1–9 to schema 10.
- Verified migration order, registry, user version, tables, columns, indexes, seed-data preservation, idempotency, foreign keys, and integrity.
- Added `scripts/run-regression-tests.sh` as the canonical regression inventory.
- Strengthened `scripts/phone-qa.sh` with strict TypeScript, Expo config, explicit dependency checks, AppText/import audits, unsafe-TypeScript checks, and static-theme checks.
- Added `tsx` to development dependencies so phone tests do not rely on a global installation.
- Added an SDK 57 Expo Go runtime guard so `expo-notifications` is never evaluated in Expo Go; notification delivery remains development/preview-build-only.
- Updated final physical-phone evidence and release checklists for Migrations 1–10, notifications, CSV, and encrypted `.ifb` recovery.

## Remaining release blockers

- Apply the Phase 14H package to the real Termux project without clearing app data.
- Install dependencies and run `bash scripts/phone-qa.sh`; retain the complete output.
- Resolve any phone strict-TypeScript or Expo config error before runtime QA.
- Complete `docs/PHONE_QA_FINAL.md` on an upgrade install and fresh test install.
- Verify exact alarms, reboot behavior, password-free backup/restore, PDFs, file pickers, sharing, offline workflows, large fonts, 360dp, light/dark, keyboard, and TalkBack.
- Repeat the offline matrix in a signed preview build.
- Production signing/build must wait until all required gates pass.

## Phase 15 source gates

```text
FREE_PLAN_LIMITS=PASS
TRYYEAR_LOCAL_365_DAYS=PASS
CLOCK_ROLLBACK_GUARD=PASS
EXPO_GO_BILLING_GUARD=PASS
PLAY_PURCHASE_RESTORE=PASS
PAYWALL_UI=PASS
PHASE15_TYPESCRIPT_PARSE=PASS
PHASE15_UNSAFE_TYPESCRIPT=PASS
FULL_REGRESSION_SUITE=PASS
```

Play Console product availability, checkout, acknowledgement delivery, cancellation/refund propagation and cross-device restore require a licensed physical-device build and are not certified by source tests.
