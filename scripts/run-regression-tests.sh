#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tests/final-migration-matrix.test.py
python3 tests/release-manifest.test.py
python3 tests/business-template-migration.test.py
python3 tests/professional-catalog.test.py
python3 tests/inline-add.test.py
python3 tests/invoice-speed-tools.test.py
python3 tests/data-restore.test.py
node --import tsx tests/appearance-preferences.test.ts
python3 tests/appearance-live-theme.test.py
python3 tests/settings-information-architecture.test.py
python3 tests/customer-csv-import.test.py
node --import tsx tests/customer-csv.test.ts
python3 tests/catalog-csv-import.test.py
node --import tsx tests/catalog-csv.test.ts
python3 tests/selected-csv-exports.test.py
node --import tsx tests/selected-csv.test.ts
python3 tests/notifications-reminders.test.py
node --import tsx tests/reminders.test.ts
node --import tsx tests/business-template-engine.test.ts
node --import tsx tests/invoice-calculations.test.ts
node --import tsx tests/vertical-invoice.test.ts
node --import tsx tests/data-backup.test.ts
node --import tsx tests/encrypted-backup-format.test.ts
python3 tests/encrypted-backup-restore.test.py
printf '\nFULL_REGRESSION_SUITE=PASS\n'
