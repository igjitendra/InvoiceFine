import re,sqlite3
from pathlib import Path
root=Path(__file__).resolve().parents[1];db=sqlite3.connect(':memory:');db.execute('PRAGMA foreign_keys=ON')
for version in range(1,8):
 p=next((root/'db/migrations').glob(f'{version:04d}-*.ts'));m=re.search(r'sql:\s*`(.*?)`',p.read_text(),re.S);assert m;db.executescript(m.group(1))
now='2026-08-06T00:00:00Z';db.execute("INSERT INTO items(id,type,name,purchase_price_paise,selling_price_paise,gst_rate_basis_points,current_stock_scaled,is_archived,created_at,updated_at)VALUES(?,?,?,?,?,?,?,?,?,?)",('i','product','Favorite item',0,1000,0,0,0,now,now));db.execute("INSERT INTO item_favorites(item_id,created_at)VALUES(?,?)",('i',now));db.commit();assert db.execute('SELECT item_id FROM item_favorites').fetchone()[0]=='i';db.execute("DELETE FROM items WHERE id='i'");assert db.execute('SELECT count(*) FROM item_favorites').fetchone()[0]==0;assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok';print('PERSISTENT_FAVORITES=PASS');print('FAVORITE_CASCADE=PASS');print('MIGRATION_REGISTRY_1_TO_7=PASS')
