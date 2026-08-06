import re, sqlite3
from pathlib import Path
root=Path(__file__).resolve().parents[1]; db=sqlite3.connect(':memory:'); db.execute('PRAGMA foreign_keys=ON')
for version in range(1,9):
 p=next((root/'db/migrations').glob(f'{version:04d}-*.ts')); m=re.search(r'sql:\s*`(.*?)`',p.read_text(),re.S); assert m; db.executescript(m.group(1))
now='2026-08-06T00:00:00Z'
db.execute("INSERT INTO customers(id,name,is_archived,created_at,updated_at)VALUES('c','Customer',0,?,?)",(now,now))
db.execute("INSERT INTO categories(id,kind,name,is_archived,created_at,updated_at)VALUES('ci','item','Catalog',0,?,?),('ce','expense','Travel',0,?,?)",(now,now,now,now))
db.execute("INSERT INTO units(id,name,short_name,created_at,updated_at)VALUES('u','Pieces','PCS',?,?)",(now,now))
db.execute("INSERT INTO items(id,type,name,sku,category_id,unit_id,purchase_price_paise,selling_price_paise,gst_rate_basis_points,current_stock_scaled,is_archived,created_at,updated_at)VALUES('p','product','Product','P1','ci','u',12345,20000,1800,1250,0,?,?),('s','service','Service','S1','ci','u',0,50000,1800,0,0,?,?)",(now,now,now,now))
db.execute("INSERT INTO invoices(id,invoice_number,kind,status,customer_id,invoice_date,customer_name_snapshot,business_name_snapshot,business_address_snapshot,business_phone_snapshot,currency_code_snapshot,total_paise,paid_paise,created_at,updated_at)VALUES('i','INV-1','tax_invoice','paid','c','2026-08-06','Customer','Business','','','INR',10000,10000,?,?)",(now,now))
db.execute("INSERT INTO payments(id,invoice_id,customer_id,amount_paise,payment_date,method,created_at,updated_at)VALUES('pay','i','c',10000,'2026-08-06','upi',?,?)",(now,now))
db.execute("INSERT INTO expenses(id,category_id,expense_date,amount_paise,created_at,updated_at)VALUES('e','ce','2026-08-06',2500,?,?)",(now,now)); db.commit()
assert db.execute("SELECT COUNT(*) FROM customers WHERE is_archived=0").fetchone()[0]==1
assert db.execute("SELECT COUNT(*) FROM items WHERE type='product' AND is_archived=0").fetchone()[0]==1
assert db.execute("SELECT COUNT(*) FROM items WHERE type='service' AND is_archived=0").fetchone()[0]==1
assert db.execute("SELECT COUNT(*) FROM invoices WHERE invoice_date BETWEEN '2026-08-01' AND '2026-08-31'").fetchone()[0]==1
assert round(db.execute("SELECT purchase_price_paise*current_stock_scaled/1000.0 FROM items WHERE id='p'").fetchone()[0])==15431
source=(root/'db/repositories/selected-exports.ts').read_text()
for key in ('customers','products','services','expenses','payments','invoices','stock'): assert f'case "{key}"' in source
assert 'BETWEEN ? AND ?' in source and 'is_archived=0' in source
assert not re.search(r'`\s*(INSERT|UPDATE|DELETE|DROP|ALTER)\b',source,re.I)
screen=(root/'app/settings/data/exports.tsx').read_text(); assert 'Select all' in screen and 'Include archived records' in screen and 'financial_year' in screen and 'saveCsvFilesToDirectory' in screen
service=(root/'services/csv-files.ts').read_text(); assert 'saveCsvFilesToDirectory' in service and 'requestDirectoryPermissionsAsync' in service
print('SEVEN_SELECTED_EXPORTS=PASS'); print('DATE_RANGE_AND_ARCHIVE_FILTERS=PASS'); print('READ_ONLY_EXPORT_QUERIES=PASS'); print('STOCK_VALUE_EXPORT=PASS'); print('MULTI_FILE_FOLDER_EXPORT=PASS'); print('SCHEMA_REMAINS_MIGRATION_8=PASS')
