# InvoiceFine Simple Backup Strategy

## Storage model

Business data remains in the app-private SQLite database. InvoiceFine does not use a backup account, cloud sync, push server, or broad shared-storage permission. The user-controlled recovery artifact is a password-free `.ifb` file.

## File format

- readable JSON stored with the `.ifb` extension
- exact schema version and table counts
- FNV-1a corruption checksum
- no password prompt or password recovery dependency
- no cloud upload by InvoiceFine

Because the file is not encrypted, it can expose business and customer data. Keep it in a private folder and share it only with people you trust.

## Export safety

1. Run SQLite integrity check.
2. Read every current business table, including templates, favorites and service reminders. Local image binaries are not embedded; only stored URI references are represented.
3. Build exact table counts and the corruption checksum.
4. Ask the user for a destination folder or open the Android share sheet.
5. Write one `.ifb` file without modifying source records.

## Restore safety

1. Choose a `.ifb` file through Android's document picker.
2. Automatically validate format, checksum, row cells, table counts, schema equality and exactly one business profile.
3. Show file name, creation time, schema and record count.
4. Require one explicit destructive confirmation.
5. Replace restorable tables in one exclusive transaction with deferred foreign keys.
6. Validate foreign keys and SQLite integrity before commit; rollback on failure.
7. Clear device-specific notification IDs and rebuild local schedules.

Delete Local Data remains locked independently of restore.

## Operational warnings

- Keep `.ifb` files private because their contents are readable.
- Generated PDFs, CSV exports and source-code ZIPs are not complete backups.
- Uninstalling or clearing app data can remove records that were not exported.
- Physical Android QA must verify large datasets, low storage, interrupted picker/save, checksum tamper rejection, rollback, upgrade restore, notification rebuild and light/dark accessibility.
