import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = [
    "0001-initial-schema.ts",
    "0002-invoice-page-size.ts",
    "0003-premium-onboarding.ts",
    "0004-vertical-invoice-details.ts",
    "0005-professional-catalog.ts",
    "0006-business-template-engine.ts",
    "0007-invoice-speed-tools.ts",
    "0008-customer-csv-fields.ts",
    "0009-notifications-reminders.ts",
    "0010-payment-settlement-discount.ts",
]
RESTORE_ORDER = [
    "business_settings",
    "customers",
    "categories",
    "units",
    "items",
    "catalog_item_template_data",
    "item_favorites",
    "invoices",
    "invoice_items",
    "invoice_vertical_details",
    "payments",
    "expenses",
    "stock_movements",
    "service_reminders",
    "notification_jobs",
]


def migrate(connection: sqlite3.Connection) -> None:
    for file_name in MIGRATIONS:
        source = (ROOT / "db" / "migrations" / file_name).read_text()
        sql = re.search(r"sql:\s*`(.*?)`", source, re.S)
        assert sql
        connection.executescript(sql.group(1))
    connection.execute("PRAGMA user_version=10")


def business(name: str, next_number: int = 1) -> dict[str, object]:
    columns = [row[1] for row in database.execute('PRAGMA table_info("business_settings")')]
    defaults = {
        "id": "primary-business",
        "business_name": name,
        "address": "",
        "phone": "",
        "invoice_prefix": "INV",
        "next_invoice_number": next_number,
        "tax_enabled": 0,
        "currency_code": "INR",
        "created_at": "2026-08-05T00:00:00Z",
        "updated_at": "2026-08-05T00:00:00Z",
        "invoice_page_size": "a4",
        "business_type": "both",
        "business_category": "other",
        "gst_type": "unregistered",
        "invoice_template": "modern",
        "estimate_prefix": "EST",
        "quotation_prefix": "QT",
        "payment_terms_days": 0,
        "payment_methods_json": '["cash"]',
        "notification_preferences_json": "[]",
        "onboarding_completed": 1,
    }
    return {column: defaults.get(column) for column in columns}


def restore(tables: dict[str, list[dict[str, object]]]) -> None:
    database.execute("BEGIN IMMEDIATE")
    try:
        database.execute("PRAGMA defer_foreign_keys=ON")
        for table in reversed(RESTORE_ORDER):
            database.execute(f'DELETE FROM "{table}"')
        for table in RESTORE_ORDER:
            columns = [row[1] for row in database.execute(f'PRAGMA table_info("{table}")')]
            for row in tables.get(table, []):
                assert all(column in row for column in columns)
                names = ",".join(f'"{column}"' for column in columns)
                placeholders = ",".join("?" for _ in columns)
                database.execute(
                    f'INSERT INTO "{table}" ({names}) VALUES ({placeholders})',
                    [row[column] for column in columns],
                )
        assert list(database.execute("PRAGMA foreign_key_check")) == []
        assert database.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
        database.commit()
    except Exception:
        database.rollback()
        raise


database = sqlite3.connect(":memory:")
database.execute("PRAGMA foreign_keys=ON")
migrate(database)
initial = business("Current Business")
columns = list(initial)
database.execute(
    f'INSERT INTO business_settings ({",".join(columns)}) VALUES ({",".join("?" for _ in columns)})',
    list(initial.values()),
)
database.commit()

empty_tables = {table: [] for table in RESTORE_ORDER}
empty_tables["business_settings"] = [business("Restored Business")]
restore(empty_tables)
assert database.execute("SELECT business_name FROM business_settings").fetchone()[0] == "Restored Business"
print("ATOMIC_RESTORE_SUCCESS=PASS")

invalid_tables = {table: [] for table in RESTORE_ORDER}
invalid_tables["business_settings"] = [business("Invalid Business", next_number=0)]
try:
    restore(invalid_tables)
    raise AssertionError("Invalid restore unexpectedly succeeded")
except sqlite3.IntegrityError:
    pass
assert database.execute("SELECT business_name FROM business_settings").fetchone()[0] == "Restored Business"
print("ATOMIC_RESTORE_ROLLBACK=PASS")
print("FOREIGN_KEY_AND_INTEGRITY_CHECKS=PASS")
