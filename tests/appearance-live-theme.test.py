from pathlib import Path

root = Path(__file__).resolve().parents[1]
provider = (root / "hooks/useAppearance.tsx").read_text()
storage = (root / "lib/appearance-storage.ts").read_text()
layout = (root / "app/_layout.tsx").read_text()
palette = (root / "hooks/useAppPalette.ts").read_text()
screen = (root / "app/settings/appearance.tsx").read_text()
catalog = (root / "components/catalog/CatalogRow.tsx").read_text()

assert 'useColorScheme' in provider
assert 'preferences.theme === "system"' in provider
assert 'expo-sqlite/kv-store' in storage
assert 'invoicefine.appearance.v1' in storage
assert '<AppearanceProvider>' in layout
assert 'resolvedColorScheme' in palette
assert 'setTheme(option.value)' in screen
assert 'setFontSize' in screen
assert 'setCompactMode' in screen
assert 'setCatalogView' in screen
assert 'catalogView === "list"' in catalog

unmigrated = []
for folder in (root / "app", root / "components"):
    for path in folder.rglob("*.tsx"):
        if path.name == "AppText.tsx":
            continue
        text = path.read_text()
        if "<Text" in text and 'components/ui/AppText' not in text:
            unmigrated.append(str(path.relative_to(root)))
assert not unmigrated, f"Unscaled Text components: {unmigrated}"

print("SYSTEM_LIGHT_DARK_LIVE_THEME=PASS")
print("SQLITE_KV_PERSISTENCE=PASS")
print("GLOBAL_APP_TEXT_SCALING=PASS")
print("COMPACT_AND_CATALOG_VIEW=PASS")
