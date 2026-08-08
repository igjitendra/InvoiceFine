from pathlib import Path

root = Path(__file__).resolve().parents[1]
customers = (root / "app/settings/data/customers.tsx").read_text()
catalog = (root / "components/settings/CatalogCsvScreen.tsx").read_text()

for source in (customers, catalog):
    assert 'Object.values(mapping).includes("name")' in source
    assert "disabled={!valid || !hasNameMapping}" in source
    assert "!mapping.name" not in source

print("CUSTOMER_IMPORT_BUTTON_ENABLEMENT=PASS")
print("PRODUCT_IMPORT_BUTTON_ENABLEMENT=PASS")
print("SERVICE_IMPORT_BUTTON_ENABLEMENT=PASS")
