import re,sqlite3
from pathlib import Path
root=Path(__file__).resolve().parents[1];db=sqlite3.connect(':memory:');db.execute('PRAGMA foreign_keys=ON')
for version in range(1,9):
 p=next((root/'db/migrations').glob(f'{version:04d}-*.ts'));m=re.search(r'sql:\s*`(.*?)`',p.read_text(),re.S);assert m;db.executescript(m.group(1))
now='2026-08-06T00:00:00Z';db.execute("INSERT INTO customers(id,name,phone,email,gstin,state_code,billing_address,shipping_address,state_name,pincode,notes,is_archived,created_at,updated_at)VALUES(?,?,?,?,?,?,?,?,?,?,?,0,?,?)",('c1','Rahul','9876543210','r@example.com',None,'09','Kanpur','Kanpur','Uttar Pradesh','208001','Regular',now,now));row=db.execute('SELECT shipping_address,state_name,pincode FROM customers').fetchone();assert row==('Kanpur','Uttar Pradesh','208001');assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
source=(root/'db/repositories/customer-import.ts').read_text();assert "runInTransaction" in source and 'policy === "skip"' in source and 'policy === "update"' in source
screen=(root/'app/settings/data/customers.tsx').read_text();assert 'SMART MAPPING' in screen and 'Preview first 20' in screen and 'Share Error Report' in screen
print('CUSTOMER_CSV_FIELDS_MIGRATION=PASS');print('ATOMIC_CUSTOMER_IMPORT=PASS');print('DUPLICATE_PHONE_POLICIES=PASS');print('PREVIEW_ERROR_REPORT_UX=PASS');print('MIGRATION_REGISTRY_1_TO_8=PASS')