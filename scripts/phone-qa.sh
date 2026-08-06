#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
printf '\nInvoiceFine final phone QA\n==========================\n'
for file in node_modules/expo/bin/cli node_modules/typescript/bin/tsc; do
  test -f "$file" || { echo "Missing $file. Install project dependencies first."; exit 1; }
done
node - <<'NODE'
const required=['expo-print','expo-sharing','expo-haptics','react-native-svg','expo-sqlite','expo-image-picker','expo-router'];
const missing=required.filter(name=>{try{require.resolve(name+'/package.json');return false}catch{return true}});
if(missing.length){console.error('Missing dependencies:',missing.join(', '));process.exit(1)}
console.log('REQUIRED_DEPENDENCIES=PASS');
NODE
rm -rf .expo/types
node node_modules/expo/bin/cli config --type public >/dev/null
echo EXPO_CONFIG=PASS
node node_modules/typescript/bin/tsc --noEmit
echo TYPESCRIPT=PASS
python3 tests/business-template-migration.test.py
python3 tests/professional-catalog.test.py
python3 tests/inline-add.test.py
python3 tests/invoice-speed-tools.test.py
python3 tests/data-restore.test.py
node --import tsx tests/business-template-engine.test.ts
node --import tsx tests/invoice-calculations.test.ts
node --import tsx tests/vertical-invoice.test.ts
node --import tsx tests/data-backup.test.ts
python3 - <<'PY'
from pathlib import Path
bad=[]
for root in ('app','components'):
 for path in Path(root).rglob('*.tsx'):
  text=path.read_text()
  if 'strings.' in text and 'constants/strings' not in text: bad.append(f'missing strings import: {path}')
  if 'theme.' in text and 'constants/theme' not in text: bad.append(f'missing theme import: {path}')
if bad:
 print('\n'.join(bad));raise SystemExit(1)
print('RUNTIME_IMPORT_AUDIT=PASS')
PY
if grep -RInE '(@ts-ignore|@ts-expect-error|\bas any\b|\bas unknown\b)' app components constants db hooks lib services types tests --include='*.ts' --include='*.tsx'; then
 echo UNSAFE_TYPESCRIPT=FAIL; exit 1
fi
echo UNSAFE_TYPESCRIPT=NONE
printf '\nAUTOMATED_PHONE_QA=PASS\nNow complete docs/PHONE_QA_FINAL.md on the physical phone.\n'
