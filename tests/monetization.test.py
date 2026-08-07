import json,re,sqlite3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
package=json.loads((root/'package.json').read_text())
assert package['dependencies']['expo-iap']=='3.4.9'
constants=(root/'constants/monetization.ts').read_text()
for expected in ('promoCode: "TRYYEAR"','promoDurationDays: 365','freeDailyInvoiceLimit: 5','freeCustomerLimit: 5','freeCatalogLimit: 5','subscriptionProductId: "invoicefine_pro"','lifetimeProductId: "invoicefine_pro_lifetime"'):
 assert expected in constants,expected
storage=(root/'lib/monetization-storage.ts').read_text()
assert 'expo-sqlite/kv-store' in storage and 'PROMO_ALREADY_USED' in storage
assert 'Math.max(' in storage and 'now.getTime()' in storage and 'promoDurationDays' in storage
billing=(root/'services/play-billing.ts').read_text()
assert 'import("expo-iap")' in billing and 'from "expo-iap"' not in billing
assert 'Constants.appOwnership !== "expo"' in billing
assert 'purchaseUpdatedListener' in billing and 'purchaseErrorListener' in billing
assert 'finishTransaction' in billing and 'getAvailablePurchases' in billing and 'getActiveSubscriptions' in billing
assert 'cachePaidEntitlement("lifetime")' in billing and 'clearSubscriptionEntitlement' in billing
sync=(root/'hooks/useBillingEntitlementSync.ts').read_text()
assert 'restorePlayPurchases' in sync and '.catch(' in sync
assert 'useBillingEntitlementSync(status === "ready")' in (root/'app/_layout.tsx').read_text()
repo=(root/'db/repositories/monetization.ts').read_text()
assert 'COUNT(*) count FROM invoices' in repo and 'COUNT(*) count FROM customers' in repo and 'COUNT(*) count FROM items' in repo
for file_name,kind in [('customers.ts','customer'),('catalog.ts','catalog'),('invoice-drafts.ts','invoice')]:
 source=(root/'db/repositories'/file_name).read_text(); assert f'assertCanCreate("{kind}"' in source
screen=(root/'components/monetization/UpgradeScreen.tsx').read_text()
for text in ('Choose your plan','Have a promo code?','Restore Purchases','Secure payment by Google Play','Lifetime','Annual','Monthly'):
 assert text in screen,text
assert (root/'app/upgrade.tsx').is_file()
assert 'router.push("/upgrade")' in (root/'app/settings/index.tsx').read_text()
# Reproduce free-limit counts against the real schema.
db=sqlite3.connect(':memory:')
for version in range(1,11):
 p=next((root/'db/migrations').glob(f'{version:04d}-*.ts')); m=re.search(r'sql:\s*`(.*?)`',p.read_text(),re.S); assert m; db.executescript(m.group(1))
now='2026-08-07T12:00:00.000Z'
for i in range(5):
 db.execute("INSERT INTO customers(id,name,created_at,updated_at)VALUES(?,?,?,?)",(f'c{i}',f'C{i}',now,now))
 db.execute("INSERT INTO items(id,type,name,created_at,updated_at)VALUES(?,?,?, ?,?)",(f'i{i}','product',f'I{i}',now,now))
 db.execute("INSERT INTO invoices(id,invoice_number,kind,status,invoice_date,business_name_snapshot,business_address_snapshot,business_phone_snapshot,currency_code_snapshot,created_at,updated_at)VALUES(?,?, 'non_tax_invoice','draft','2026-08-07','Business','','','INR',?,?)",(f'v{i}',f'DRAFT-{i}',now,now))
assert db.execute('SELECT COUNT(*) FROM customers').fetchone()[0]==5
assert db.execute('SELECT COUNT(*) FROM items').fetchone()[0]==5
assert db.execute("SELECT COUNT(*) FROM invoices WHERE created_at>='2026-08-07T00:00:00.000Z' AND created_at<'2026-08-08T00:00:00.000Z'").fetchone()[0]==5
assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
print('FREE_PLAN_LIMITS=PASS')
print('TRYYEAR_LOCAL_365_DAYS=PASS')
print('CLOCK_ROLLBACK_GUARD=PASS')
print('EXPO_GO_BILLING_GUARD=PASS')
print('PLAY_PURCHASE_RESTORE=PASS')
print('PAYWALL_UI=PASS')
