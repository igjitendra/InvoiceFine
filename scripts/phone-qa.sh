#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
printf '\nInvoiceFine final phone QA\n==========================\n'
for file in node_modules/expo/bin/cli node_modules/typescript/bin/tsc; do
  test -f "$file" || { echo "Missing $file. Install project dependencies first."; exit 1; }
done
node - <<'NODE'
const fs=require('fs');
const path=require('path');
const required=['expo-print','expo-sharing','expo-haptics','react-native-svg','expo-sqlite','expo-image-picker','expo-document-picker','expo-file-system','expo-notifications','expo-crypto','@noble/hashes','expo-router'];
const missing=required.filter(name=>!fs.existsSync(path.join('node_modules',name,'package.json')));
if(missing.length){console.error('Missing dependencies:',missing.join(', '));process.exit(1)}
console.log('REQUIRED_DEPENDENCIES=PASS');
NODE
rm -rf .expo/types
node node_modules/expo/bin/cli config --type public >/dev/null
echo EXPO_CONFIG=PASS
node node_modules/typescript/bin/tsc --noEmit
echo TYPESCRIPT=PASS
bash scripts/run-regression-tests.sh
python3 - <<'PY'
from pathlib import Path
bad=[]
for root in ('app','components'):
 for path in Path(root).rglob('*.tsx'):
  text=path.read_text()
  if 'strings.' in text and 'constants/strings' not in text: bad.append(f'missing strings import: {path}')
  if 'theme.' in text and 'constants/theme' not in text: bad.append(f'missing theme import: {path}')
  if '<Text' in text and path.name!='AppText.tsx' and 'components/ui/AppText' not in text: bad.append(f'missing AppText import: {path}')
if bad:
 print('\n'.join(bad));raise SystemExit(1)
print('RUNTIME_IMPORT_AUDIT=PASS')
PY
if grep -RInE '(@ts-ignore|@ts-expect-error|\bas any\b|\bas unknown\b)' app components constants db hooks lib services types tests --include='*.ts' --include='*.tsx'; then
 echo UNSAFE_TYPESCRIPT=FAIL; exit 1
fi
echo UNSAFE_TYPESCRIPT=NONE
if grep -RIl 'theme\.colors\.' app components --include='*.ts' --include='*.tsx' | grep -q .; then
 echo STATIC_THEME_FILES=FAIL; exit 1
fi
echo STATIC_THEME_FILES=0
printf '\nAUTOMATED_PHONE_QA=PASS\nNow complete docs/PHONE_QA_FINAL.md on the physical phone.\n'
