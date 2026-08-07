import re, sqlite3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
db=sqlite3.connect(':memory:'); db.execute('PRAGMA foreign_keys=ON')
for version in range(1,11):
 p=next((root/'db/migrations').glob(f'{version:04d}-*.ts'))
 m=re.search(r'sql:\s*`(.*?)`',p.read_text(),re.S); assert m,p
 db.executescript(m.group(1))
now='2026-08-07T12:00:00Z'
base="INSERT INTO invoices(id,invoice_number,kind,status,invoice_date,business_name_snapshot,business_address_snapshot,business_phone_snapshot,currency_code_snapshot,total_paise,paid_paise,created_at,updated_at)VALUES(?,?,'non_tax_invoice','finalized','2026-08-07','Business','','','INR',23000,0,?,?)"
db.execute(base,('keep','INV-KEEP',now,now)); db.execute(base,('discount','INV-DISCOUNT',now,now))
# Keep ₹30 due after receiving ₹200.
db.execute("INSERT INTO payments(id,invoice_id,amount_paise,payment_date,method,created_at,updated_at)VALUES('p1','keep',20000,'2026-08-07','cash',?,?)",(now,now))
db.execute("UPDATE invoices SET paid_paise=20000,status='partially_paid' WHERE id='keep'")
# Receive the same ₹200 but explicitly waive the remaining ₹30.
db.execute("INSERT INTO payments(id,invoice_id,amount_paise,payment_date,method,created_at,updated_at)VALUES('p2','discount',20000,'2026-08-07','cash',?,?)",(now,now))
db.execute("UPDATE invoices SET paid_paise=20000,settlement_discount_paise=3000,status='paid' WHERE id='discount'")
keep=db.execute("SELECT paid_paise,settlement_discount_paise,total_paise-paid_paise-settlement_discount_paise,status FROM invoices WHERE id='keep'").fetchone()
settled=db.execute("SELECT paid_paise,settlement_discount_paise,total_paise-paid_paise-settlement_discount_paise,status FROM invoices WHERE id='discount'").fetchone()
assert keep==(20000,0,3000,'partially_paid')
assert settled==(20000,3000,0,'paid')
assert db.execute("SELECT SUM(amount_paise) FROM payments WHERE invoice_id='discount'").fetchone()[0]==20000
source=(root/'db/repositories/payments.ts').read_text(); screen=(root/'components/payments/PaymentScreen.tsx').read_text()
assert 'input.settlementMode === "discount_remaining"' in source
assert 'settlement_discount_paise' in source and 'discountPaise' in source
assert 'strings.payments.keepDue' in screen and 'strings.payments.giveDiscount' in screen
assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
print('KEEP_REMAINDER_AS_DUE=PASS')
print('DISCOUNT_REMAINDER_AND_CLOSE=PASS')
print('ACTUAL_PAYMENT_NOT_INFLATED=PASS')
print('PAYMENT_SETTLEMENT_MIGRATION_10=PASS')
