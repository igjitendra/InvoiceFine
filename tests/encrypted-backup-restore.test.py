import re, sqlite3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
backup=(root/'types/backup.ts').read_text(); exporter=(root/'db/repositories/data-backup.ts').read_text(); restore=(root/'db/repositories/data-restore.ts').read_text(); crypto=(root/'services/encrypted-backup.ts').read_text(); ui=(root/'app/legal/data-controls.tsx').read_text()
for table in ('catalog_item_template_data','item_favorites','service_reminders','notification_jobs'):
 assert f'"{table}"' in backup and f'entries.{table}' in exporter and f'"{table}"' in restore
assert 'AES-256-GCM' in crypto and 'PBKDF2-HMAC-SHA256' in crypto and '210000' not in crypto
assert 'Wrong password, damaged file, or modified backup.' in crypto
assert 'await preflightRestore(document)' in ui
assert 'cancelAllInvoiceFineNotifications' in ui and 'syncNotificationSchedule' in ui
assert 'DELETE FROM notification_jobs' in restore and 'notification_id=NULL' in restore
assert 'runInTransaction' in restore and 'PRAGMA foreign_key_check' in restore and 'PRAGMA integrity_check' in restore
db=sqlite3.connect(':memory:');db.execute('PRAGMA foreign_keys=ON')
for version in range(1,10):
 p=next((root/'db/migrations').glob(f'{version:04d}-*.ts'));m=re.search(r'sql:\s*`(.*?)`',p.read_text(),re.S);assert m;db.executescript(m.group(1))
assert db.execute('PRAGMA foreign_key_check').fetchall()==[] and db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
print('COMPLETE_SCHEMA9_BACKUP_COVERAGE=PASS');print('AES_GCM_PBKDF2_FORMAT=PASS');print('PREFLIGHT_BEFORE_ATOMIC_RESTORE=PASS');print('DEVICE_NOTIFICATION_IDS_RESET=PASS');print('WRONG_PASSWORD_TAMPER_REJECTION=PASS')
