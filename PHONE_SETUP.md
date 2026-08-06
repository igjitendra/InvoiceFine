# Phone and Termux Setup

_Last updated: 2026-08-06_

## Locations

Active project:

```text
~/InvoiceFine
```

Original/shared backup location when needed:

```text
/storage/emulated/0/InvoiceFine
```

Keep the active repository and `node_modules` in Termux home. Android shared storage cannot reliably create package-manager symlinks and may produce `EACCES` errors.

Use shared storage only for downloaded ZIP patches, screenshots, exported PDFs, and manual source backups.

## Install Expo-compatible modules

Always use the local Expo CLI:

```bash
cd "$HOME/InvoiceFine"
node node_modules/expo/bin/cli install react-native-svg expo-haptics expo-print expo-sharing
```

Only install modules required by the active patch. Do not guess Expo package versions manually.

## Apply a patch

```bash
unzip -o /storage/emulated/0/Download/PATCH_NAME.zip -d "$HOME"
cd "$HOME/InvoiceFine"
node node_modules/typescript/bin/tsc --noEmit
```

Restart Metro after a passing check:

```bash
node node_modules/expo/bin/cli start --clear --host lan
```

Use the LAN `exp://...:8081` URL shown by Expo. Do not use `http://localhost:8081` from the Android client.

## Required verification

```bash
bash scripts/phone-qa.sh
```

Then verify the affected workflow on the physical Android phone in light and dark mode. A source parser check or sandbox check does not replace phone TypeScript/runtime verification.

## Safe Git workflow

- One stable task per commit.
- Inspect `git status` and `git diff` before committing.
- Fetch/merge safely if remote is ahead.
- Never use force push, hard reset, or destructive cleanup.
- Never commit secrets, generated PDFs, SQLite databases, `.expo`, or `node_modules`.

Remote repository:

```text
git@github.com:igjitendra/InvoiceFine.git
```

## Sharing code with an AI tool

Include source/config/docs; exclude private/generated content.

Safe source folders normally include `app`, `components`, `constants`, `db`, `hooks`, `lib`, `services`, `types`, `tests`, and `docs`, plus root configuration files.

Exclude `.git`, `.expo`, `node_modules`, `.env*`, keystores, credentials, `*.db`, `*.sqlite*`, generated invoices, signatures, and real customer data.
