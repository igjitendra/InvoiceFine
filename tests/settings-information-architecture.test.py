import re
import sqlite3
from pathlib import Path

root = Path(__file__).resolve().parents[1]
required_routes = [
    "app/settings/index.tsx",
    "app/settings/business.tsx",
    "app/settings/appearance.tsx",
    "app/settings/invoice.tsx",
    "app/settings/notifications.tsx",
    "app/settings/about.tsx",
]
for route in required_routes:
    assert (root / route).is_file(), route

hub = (root / "app/settings/index.tsx").read_text()
for section in ("BUSINESS", "APPEARANCE", "INVOICE", "DATA", "NOTIFICATIONS", "ABOUT"):
    assert f'title="{section}"' in hub
assert 'badge="LOCKED"' in hub
assert 'router.push("/legal/data-controls")' in hub

repository = (root / "db/repositories/app-settings.ts").read_text()
assert "payment_terms_days" in repository
assert "notification_preferences_json" in repository
assert "UPDATE business_settings" in repository
assert "next_invoice_number" in repository

draft = (root / "components/invoices/InvoiceDraftScreen.tsx").read_text()
assert "getInvoiceSettings()" in draft
assert "invoiceSettings?.defaultDueDays" in draft

notifications = (root / "app/settings/notifications.tsx").read_text()
assert "Permission is requested only when you press Enable" in notifications
assert 'badge="READY"' in notifications
assert 'router.push("/settings/reminders")' in notifications

data_controls = (root / "app/legal/data-controls.tsx").read_text()
assert "AES-256-GCM" in data_controls
assert "Decrypt & validate" in data_controls
assert "Replace local data" in data_controls
assert "Deletion remains safety-locked" in data_controls

legal = (root / "constants/legal.ts").read_text()
assert "jitendraeditiz@gmail.com" in legal
assert "zulbulai@gmail.com" not in legal

db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
for version in range(1, 8):
    path = next((root / "db/migrations").glob(f"{version:04d}-*.ts"))
    match = re.search(r"sql:\s*`(.*?)`", path.read_text(), re.S)
    assert match
    db.executescript(match.group(1))
now = "2026-08-06T00:00:00Z"
db.execute(
    "INSERT INTO business_settings(id,business_name,created_at,updated_at) VALUES(?,?,?,?)",
    ("primary-business", "Test Business", now, now),
)
db.execute(
    "UPDATE business_settings SET invoice_prefix=?,invoice_page_size=?,payment_terms_days=?,notification_preferences_json=? WHERE id=?",
    ("BILL", "4x6", 15, '["due_payments","low_stock"]', "primary-business"),
)
row = db.execute(
    "SELECT invoice_prefix,invoice_page_size,payment_terms_days,notification_preferences_json FROM business_settings WHERE id=?",
    ("primary-business",),
).fetchone()
assert row == ("BILL", "4x6", 15, '["due_payments","low_stock"]')
assert db.execute("PRAGMA integrity_check").fetchone()[0] == "ok"

print("PROFESSIONAL_SETTINGS_SECTIONS=PASS")
print("INVOICE_DEFAULTS_PERSISTENCE=PASS")
print("NOTIFICATION_PREFERENCES_PERSISTENCE=PASS")
print("DATA_SAFETY_LOCKS=PASS")
print("SUPPORT_CONTACT=PASS")
print("PHASE14B_SETTINGS_REGRESSION=PASS")
