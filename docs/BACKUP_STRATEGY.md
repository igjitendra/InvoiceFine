# InvoiceFine backup strategy

## MVP decision

InvoiceFine remains local-first and stores business data in the app-private SQLite database. Android OS app-data backup is enabled with `android.allowBackup: true`. No cloud account, custom sync, broad shared-storage access, or extra storage permission is added in the MVP.

## Release behavior

- Normal app upgrades must preserve the SQLite database and run only versioned migrations.
- Clearing app data or uninstalling without an available Android backup can remove local records.
- A user-controlled encrypted export/import workflow is deferred until its restore path and integrity checks can be implemented and tested together.
- Never treat generated invoice PDFs as a database backup.
