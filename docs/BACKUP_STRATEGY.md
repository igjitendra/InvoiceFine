# InvoiceFine Encrypted Backup Strategy

## Storage model

Business data remains in the app-private SQLite database. InvoiceFine does not use a backup account, cloud sync, push server, or broad shared-storage permission. Android app-data backup may still follow the OS configuration, but the user-controlled recovery artifact is an encrypted `.ifb` file.

## Cryptographic format

- AES-256-GCM authenticated encryption
- PBKDF2-HMAC-SHA-256 password derivation
- 210,000 iterations
- cryptographically random 16-byte salt per backup
- 12-byte GCM nonce and 16-byte authentication tag
- authenticated envelope metadata
- minimum password length: 8; maximum: 128
- password is never stored, uploaded, logged, or recoverable

The envelope exposes only format/version compatibility metadata. Table content and internal counts are encrypted. Wrong passwords and changed ciphertext fail GCM authentication.

## Export safety

1. Run SQLite integrity check.
2. Read every schema-9 business table, including templates, favorites and service reminders. Local image binaries are not embedded; only stored URI references are represented.
3. Build exact table counts and internal corruption checksum.
4. Encrypt the full manifest.
5. Ask the user for a destination folder and write one `.ifb` file.
6. Never modify source records during export.

## Restore safety

1. Choose a `.ifb` file through Android's document picker.
2. Derive the key from the entered password and stored random salt.
3. Authenticate and decrypt before database mutation.
4. Validate format, checksum, row cells, table counts, schema equality and exactly one business profile.
5. Show created time, schema and record count before replacement.
6. Require an explicit destructive confirmation.
7. Replace restorable tables in one exclusive transaction with deferred foreign keys.
8. Validate foreign keys and SQLite integrity before commit; rollback on failure.
9. Clear device-specific native notification IDs and rebuild local schedules.

Delete Local Data remains locked independently of restore.

## Operational warnings

- A forgotten password cannot be recovered.
- Keep the `.ifb` file and password in separate safe locations.
- Generated PDFs, CSV exports and source-code ZIPs are not complete backups.
- Uninstalling or clearing app data can remove records that were not exported.
- Physical Android QA must verify large datasets, low storage, interrupted picker/save, wrong password, tamper rejection, rollback, upgrade restore, notification rebuild and light/dark accessibility.
