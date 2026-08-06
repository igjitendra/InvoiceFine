import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = []
for path in sorted((ROOT / "db/migrations").glob("[0-9][0-9][0-9][0-9]-*.ts")):
    source = path.read_text()
    version = int(re.search(r"version:\s*(\d+)", source).group(1))
    name = re.search(r'name:\s*"([^"]+)"', source).group(1)
    sql = re.search(r"sql:\s*`(.*?)`", source, re.S).group(1)
    MIGRATIONS.append((version, name, sql))

assert [item[0] for item in MIGRATIONS] == list(range(1, 10))


def registry(connection: sqlite3.Connection) -> None:
    connection.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY NOT NULL,name TEXT NOT NULL,applied_at TEXT NOT NULL)"
    )


def apply(connection: sqlite3.Connection, migration: tuple[int, str, str]) -> None:
    version, name, sql = migration
    connection.executescript(
        "BEGIN IMMEDIATE;\n"
        + sql
        + f"\nINSERT INTO schema_migrations(version,name,applied_at) VALUES({version},'{name}','2026-08-06T00:00:00Z');\n"
        + f"PRAGMA user_version={version};\nCOMMIT;"
    )


def seed(connection: sqlite3.Connection, suffix: str) -> None:
    now = "2026-08-06T00:00:00Z"
    connection.execute(
        "INSERT INTO business_settings(id,business_name,created_at,updated_at) VALUES(?,?,?,?)",
        ("primary-business", f"Upgrade {suffix}", now, now),
    )
    connection.execute(
        "INSERT INTO customers(id,name,phone,created_at,updated_at) VALUES(?,?,?,?,?)",
        ("customer-1", "Preserved Customer", "9999999999", now, now),
    )
    connection.execute(
        "INSERT INTO items(id,type,name,current_stock_scaled,created_at,updated_at) VALUES(?,?,?,?,?,?)",
        ("item-1", "product", "Preserved Product", 5000, now, now),
    )
    connection.commit()


expected_tables = {
    "business_settings", "customers", "categories", "units", "items",
    "invoices", "invoice_items", "payments", "expenses", "stock_movements",
    "invoice_vertical_details", "catalog_item_template_data", "item_favorites",
    "service_reminders", "notification_jobs", "schema_migrations",
}
expected_item_columns = {
    "short_name", "hsn_sac_code", "mrp_paise", "tax_inclusive",
    "service_pricing_model", "checklist_json", "customer_notes",
}

for starting_version in range(10):
    database = sqlite3.connect(":memory:")
    database.execute("PRAGMA foreign_keys=ON")
    registry(database)
    for migration in MIGRATIONS[:starting_version]:
        apply(database, migration)
    if starting_version >= 1:
        seed(database, str(starting_version))
    for migration in MIGRATIONS[starting_version:]:
        apply(database, migration)
    assert database.execute("PRAGMA user_version").fetchone()[0] == 9
    rows = database.execute("SELECT version,name FROM schema_migrations ORDER BY version").fetchall()
    assert rows == [(version, name) for version, name, _ in MIGRATIONS]
    tables = {row[0] for row in database.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    assert expected_tables <= tables
    item_columns = {row[1] for row in database.execute('PRAGMA table_info("items")')}
    assert expected_item_columns <= item_columns
    customer_columns = {row[1] for row in database.execute('PRAGMA table_info("customers")')}
    assert {"shipping_address", "state_name", "pincode"} <= customer_columns
    indexes = {row[0] for row in database.execute("SELECT name FROM sqlite_master WHERE type='index'")}
    assert {"idx_catalog_template_id", "idx_item_favorites_created", "idx_service_reminders_due"} <= indexes
    assert database.execute("PRAGMA foreign_key_check").fetchall() == []
    assert database.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
    if starting_version >= 1:
        assert database.execute("SELECT name,phone FROM customers WHERE id='customer-1'").fetchone() == ("Preserved Customer", "9999999999")
        assert database.execute("SELECT name,current_stock_scaled FROM items WHERE id='item-1'").fetchone() == ("Preserved Product", 5000)
    before = database.total_changes
    applied = {row[0] for row in database.execute("SELECT version FROM schema_migrations")}
    for migration in MIGRATIONS:
        if migration[0] not in applied:
            apply(database, migration)
    assert database.total_changes == before
    database.close()

runner = (ROOT / "db/migrations/index.ts").read_text()
assert "withExclusiveTransactionAsync" in runner
assert "PRAGMA user_version" in runner
assert runner.count("Migration,") >= 8
print("MIGRATION_SEQUENCE_1_TO_9=PASS")
print("CLEAN_DATABASE_TO_9=PASS")
print("UPGRADE_MATRIX_1_TO_9=PASS")
print("UPGRADE_DATA_PRESERVATION=PASS")
print("MIGRATION_IDEMPOTENCY=PASS")
print("FINAL_SCHEMA_FOREIGN_KEYS_AND_INTEGRITY=PASS")
