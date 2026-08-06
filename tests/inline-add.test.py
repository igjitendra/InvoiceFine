import re
import sqlite3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
database = sqlite3.connect(':memory:')
database.execute('PRAGMA foreign_keys=ON')
for name in ['0001-initial-schema.ts', '0002-invoice-page-size.ts', '0003-premium-onboarding.ts', '0004-vertical-invoice-details.ts']:
    source = (root / 'db' / 'migrations' / name).read_text()
    match = re.search(r'sql:\s*`(.*?)`', source, re.S)
    assert match
    database.executescript(match.group(1))

now = '2026-08-05T00:00:00Z'
database.execute("INSERT INTO customers(id,name,phone,is_archived,created_at,updated_at) VALUES(?,?,?,?,?,?)", ('customer-1', 'Rahul Traders', '9876543210', 0, now, now))
database.execute("INSERT INTO categories(id,kind,name,is_archived,created_at,updated_at) VALUES(?,?,?,?,?,?)", ('category-1', 'item', 'Chargers', 0, now, now))
database.execute("INSERT INTO units(id,name,short_name,created_at,updated_at) VALUES(?,?,?,?,?)", ('unit-1', 'pcs', 'PCS', now, now))
database.execute("INSERT INTO items(id,type,name,category_id,unit_id,purchase_price_paise,selling_price_paise,gst_rate_basis_points,current_stock_scaled,low_stock_threshold_scaled,is_archived,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", ('item-1', 'product', 'Samsung Charger', 'category-1', 'unit-1', 0, 129900, 1800, 10000, 0, 0, now, now))
database.execute("INSERT INTO stock_movements(id,item_id,type,quantity_delta_scaled,reference_type,reference_id,reason,occurred_at,created_at) VALUES(?,?,?,?,?,?,?,?,?)", ('movement-1', 'item-1', 'opening', 10000, 'item', 'item-1', 'Opening stock', now, now))
database.commit()

assert database.execute('SELECT name,phone FROM customers').fetchone() == ('Rahul Traders', '9876543210')
assert database.execute('SELECT current_stock_scaled FROM items WHERE id=?', ('item-1',)).fetchone()[0] == 10000
assert database.execute('SELECT quantity_delta_scaled FROM stock_movements WHERE item_id=?', ('item-1',)).fetchone()[0] == 10000
assert database.execute('PRAGMA foreign_key_check').fetchall() == []
assert database.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
print('INLINE_CUSTOMER_CREATE_SELECT=PASS')
print('INLINE_PRODUCT_CREATE_ADD=PASS')
print('OPENING_STOCK_MOVEMENT=PASS')
print('INLINE_ADD_DATABASE_INTEGRITY=PASS')
