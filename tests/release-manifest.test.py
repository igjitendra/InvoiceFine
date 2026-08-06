import json
from pathlib import Path

root=Path(__file__).resolve().parents[1]
package=json.loads((root/'package.json').read_text())
app=json.loads((root/'app.json').read_text())['expo']
required={
'expo':'~57.0.9','expo-router':'~57.0.9','expo-constants':'~57.0.8','expo-linking':'~57.0.4',
'expo-sqlite':'~57.0.1','expo-image-picker':'~57.0.7','expo-document-picker':'~57.0.1',
'expo-file-system':'~57.0.1','expo-print':'~57.0.1','expo-sharing':'~57.0.8',
'expo-haptics':'~57.0.1','expo-notifications':'~57.0.8','expo-crypto':'~57.0.0',
'react':'19.2.3','react-native':'0.86.2','react-native-svg':'15.15.4','@noble/hashes':'~2.0.1'
}
for name,version in required.items(): assert package['dependencies'].get(name)==version,(name,package['dependencies'].get(name))
assert package['devDependencies'].get('typescript')=='~6.0.3'
assert package['devDependencies'].get('tsx')=='^4.23.1'
assert package['main']=='expo-router/entry' and app['orientation']=='portrait' and app['userInterfaceStyle']=='automatic'
plugins=[entry if isinstance(entry,str) else entry[0] for entry in app['plugins']]
for plugin in ('expo-router','expo-image-picker','expo-sharing','expo-notifications'): assert plugin in plugins
assert app['android']['permissions']==['android.permission.SCHEDULE_EXACT_ALARM']
assert app['android']['allowBackup'] is True and app['experiments']['typedRoutes'] is True
for route in ('app/_layout.tsx','app/settings/notifications.tsx','app/settings/reminders/index.tsx','app/settings/data/exports.tsx','app/legal/data-controls.tsx'):
 assert (root/route).is_file(),route
all_source='\n'.join(path.read_text(errors='ignore') for folder in ('app','components','db','hooks','lib','services') for path in (root/folder).rglob('*') if path.suffix in ('.ts','.tsx'))
assert 'getExpoPushTokenAsync' not in all_source and 'getDevicePushTokenAsync' not in all_source
assert 'jitendraeditiz@gmail.com' in (root/'constants/legal.ts').read_text()
print('SDK57_DEPENDENCY_MATRIX=PASS');print('EXPO_CONFIG_MANIFEST=PASS');print('FINAL_ROUTE_INVENTORY=PASS');print('LOCAL_NOTIFICATIONS_ONLY=PASS');print('SUPPORT_CONTACT=PASS')
