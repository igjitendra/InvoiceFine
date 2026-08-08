from pathlib import Path
root=Path(__file__).resolve().parents[1]
service=(root/'services/csv-files.ts').read_text()
catalog=(root/'components/settings/CatalogCsvScreen.tsx').read_text()
customers=(root/'app/settings/data/customers.tsx').read_text()
exports=(root/'app/settings/data/exports.tsx').read_text()
assert 'if (!permission.granted) return 0' in service
assert 'if (!permission.granted) return false' in service
assert 'copyToCacheDirectory: false' in service
assert 'new File(asset.uri).text()' in service
assert 'throw new Error("Folder permission denied")' not in service
assert 'void saveCsvToDownloads' not in catalog
assert 'void shareCsv' not in catalog
assert 'void saveCsvToDownloads' not in customers
assert 'void shareCsv' not in customers
assert 'async function saveSample()' in catalog and 'async function shareReport()' in catalog
assert 'async function saveSample()' in customers and 'async function shareErrorReport()' in customers
assert 'const saved = await saveCsvFilesToDirectory' in exports
assert '"Export cancelled"' in exports
print('CSV_FOLDER_CANCEL_NO_THROW=PASS')
print('CSV_SAMPLE_PROMISE_HANDLING=PASS')
print('CSV_REPORT_SHARE_HANDLING=PASS')
print('MULTI_EXPORT_CANCEL_HANDLING=PASS')
