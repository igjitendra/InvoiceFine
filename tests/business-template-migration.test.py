import re,sqlite3
from pathlib import Path
root=Path(__file__).resolve().parents[1];db=sqlite3.connect(':memory:');db.execute('PRAGMA foreign_keys=ON')
for version in range(1,7):
 p=next((root/'db/migrations').glob(f'{version:04d}-*.ts'));m=re.search(r'sql:\s*`(.*?)`',p.read_text(),re.S);assert m;db.executescript(m.group(1))
now='2026-08-06T00:00:00Z';db.execute("INSERT INTO items(id,type,name,purchase_price_paise,selling_price_paise,gst_rate_basis_points,current_stock_scaled,is_archived,created_at,updated_at)VALUES(?,?,?,?,?,?,?,?,?,?)",('i','product','Medicine',0,1000,500,0,0,now,now));db.execute("INSERT INTO catalog_item_template_data(item_id,template_id,data_json,created_at,updated_at)VALUES(?,?,?,?,?)",('i','medical','{"composition":"Paracetamol"}',now,now));db.commit();assert db.execute('SELECT template_id,data_json FROM catalog_item_template_data').fetchone()==('medical','{"composition":"Paracetamol"}');db.execute("DELETE FROM items WHERE id='i'");assert db.execute('SELECT count(*) FROM catalog_item_template_data').fetchone()[0]==0;assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok';print('BUSINESS_TEMPLATE_MIGRATION=PASS');print('TEMPLATE_DATA_CASCADE=PASS')
