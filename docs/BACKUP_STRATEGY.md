# InvoiceFine Backup Strategy

_Last updated: 2026-08-04_

## Current MVP behavior

Business data remains in the app-private SQLite database. Android app-data backup is enabled according to app configuration. No custom cloud account, sync service, broad shared-storage permission, or custom restore flow is currently implemented.

Normal upgrades must preserve SQLite data and run versioned migrations. Clearing app data or uninstalling without an available Android backup may remove local records. Generated PDFs and source-code ZIPs are not business-data backups.

## Phase 8 design requirement

Do not implement export alone. An approved backup feature must include:

- encrypted or appropriately protected package
- manifest with app/schema/export versions
- checksums/integrity validation
- explicit inclusion/exclusion rules for images
- restore preview and warnings
- transactional restore with rollback
- duplicate/conflict policy
- synthetic backup/restore test matrix
- interrupted/corrupt/wrong-version handling

Do not request broad Android storage permissions when the system document picker/share flow can be used.
