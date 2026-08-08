#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
rm -f \
  app/legal/data-controls.tsx \
  components/data/RestoreBackupCard.tsx \
  services/backup-files.ts \
  services/encrypted-backup.ts \
  lib/backup-format.ts \
  lib/encrypted-backup-format.ts \
  db/repositories/data-backup.ts \
  db/repositories/data-restore.ts \
  types/backup.ts \
  tests/data-backup.test.ts \
  tests/data-restore.test.py \
  tests/encrypted-backup-format.test.ts \
  tests/encrypted-backup-restore.test.py \
  tests/simple-backup-csv.test.py
printf 'BACKUP_FEATURE_REMOVED=PASS\n'
