import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = ROOT / "db" / "migrations"

def sql_for(name: str) -> str:
    source = (MIGRATIONS / name).read_text()
    match = re.search(r"sql:\s*`(.*?)`", source, re.S)
    assert match, name
    return match.group(1)

def apply(connection: sqlite3.Connection, through: int) -> None:
    for version in range(1, through + 1):
        name = next(MIGRATIONS.glob(f"{version:04d}-*.ts"))
        connection.executescript(sql_for(name.name))

now = "2026-08-05T00:00:00Z"
old = sqlite3.connect(":memory:")
old.execute("PRAGMA foreign_keys=ON")
apply(old, 4)
old.execute("INSERT INTO items(id,type,name,purchase_price_paise,selling_price_paise,gst_rate_basis_points,current_stock_scaled,is_archived,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)", ("legacy", "service", "Legacy Service", 0, 50000, 1800, 0, 0, now, now))
old.commit()
old.executescript(sql_for("0005-professional-catalog.ts"))
legacy = old.execute("SELECT mrp_paise,tax_inclusive,service_pricing_model,service_duration_minutes,checklist_json FROM items WHERE id='legacy'").fetchone()
assert legacy == (0, 0, "fixed", 0, "[]")
print("PROFESSIONAL_CATALOG_SAFE_UPGRADE=PASS")

connection = sqlite3.connect(":memory:")
connection.execute("PRAGMA foreign_keys=ON")
apply(connection, 5)
connection.execute("INSERT INTO items(id,type,name,purchase_price_paise,selling_price_paise,gst_rate_basis_points,current_stock_scaled,is_archived,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)", ("product", "product", "Premium Charger", 50000, 90000, 1800, 10000, 0, now, now))
connection.execute("INSERT INTO items(id,type,name,purchase_price_paise,selling_price_paise,gst_rate_basis_points,current_stock_scaled,is_archived,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)", ("service", "service", "AC Service", 0, 120000, 1800, 0, 0, now, now))
update_sql = "UPDATE items SET short_name=?,hsn_sac_code=?,mrp_paise=?,wholesale_price_paise=?,tax_inclusive=?,reorder_level_scaled=?,storage_location=?,supplier=?,description=?,image_uri=?,weight=?,dimensions=?,color=?,size=?,expiry_date=?,batch_number=?,warranty=?,manufacturer=?,purchase_account=?,sales_account=?,cogs_account=?,service_pricing_model=?,service_duration_minutes=?,assigned_staff=?,appointment_required=?,warranty_days=?,checklist_json=?,internal_notes=?,customer_notes=?,updated_at=? WHERE id=?"
product_values = ("Charger", "85044090", 129900, 110000, 1, 5000, "Rack A2", "ABC Supply", "Fast charger", "file://charger.jpg", "120g", "7x4x3cm", "Black", "Standard", "2028-08-05", "B-100", "12 months", "Samsung", "Purchases", "Sales", "COGS", "fixed", 0, None, 0, 0, "[]", None, None, now, "product")
connection.execute(update_sql, product_values)
service_values = ("AC Basic", "998719", 0, 0, 0, 0, None, None, "AC inspection and cleaning", None, None, None, None, None, None, None, None, None, None, "Service Sales", None, "per_visit", 90, "Ravi", 1, 30, '["Inspect filter","Clean coil"]', "Bring ladder", "Keep outdoor unit accessible", now, "service")
connection.execute(update_sql, service_values)
connection.commit()
product = connection.execute("SELECT hsn_sac_code,mrp_paise,wholesale_price_paise,tax_inclusive,reorder_level_scaled,storage_location,manufacturer FROM items WHERE id='product'").fetchone()
assert product == ("85044090", 129900, 110000, 1, 5000, "Rack A2", "Samsung")
service = connection.execute("SELECT hsn_sac_code,service_pricing_model,service_duration_minutes,assigned_staff,appointment_required,warranty_days,checklist_json,customer_notes FROM items WHERE id='service'").fetchone()
assert service == ("998719", "per_visit", 90, "Ravi", 1, 30, '["Inspect filter","Clean coil"]', "Keep outdoor unit accessible")
assert connection.execute("PRAGMA foreign_key_check").fetchall() == []
assert connection.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
print("PROFESSIONAL_PRODUCT_ROUND_TRIP=PASS")
print("PROFESSIONAL_SERVICE_ROUND_TRIP=PASS")
print("PROFESSIONAL_CATALOG_CONSTRAINTS=PASS")

index_source = (MIGRATIONS / "index.ts").read_text()
assert "verticalInvoiceDetailsMigration" in index_source
assert "professionalCatalogMigration" in index_source
repository = (ROOT / "db" / "repositories" / "catalog.ts").read_text()
assert "service_duration_minutes" in repository and "checklist_json" in repository
print("MIGRATION_REGISTRY_1_TO_5=PASS")
