# Technical Architecture

## Recommended stack

- Expo with TypeScript
- Expo Router
- NativeWind after verifying the installed Expo version and configuration
- `expo-sqlite` for business data
- Zustand for transient UI/session state
- React Hook Form for forms
- `expo-print` for PDF generation
- `expo-sharing` for share sheet
- `expo-file-system` when controlled file storage is needed
- `expo-notifications` only for approved local reminders
- `@expo/vector-icons`
- `react-native-safe-area-context`
- `expo-status-bar`

Charts and MMKV are deferred until the core app works. They add native/build complexity and are not required for the MVP's first milestone.

## Folder structure

```text
InvoiceFine/
├── .claude/
│   └── skills/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── onboarding/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   ├── invoices.tsx
│   │   ├── customers.tsx
│   │   ├── catalog.tsx
│   │   └── more.tsx
│   ├── invoice/
│   │   ├── new.tsx
│   │   └── [id].tsx
│   ├── customer/
│   │   └── [id].tsx
│   ├── item/
│   │   └── [id].tsx
│   ├── expenses/
│   ├── reports/
│   └── settings/
├── components/
│   ├── ui/
│   ├── forms/
│   ├── dashboard/
│   ├── invoices/
│   └── lists/
├── constants/
│   ├── strings.ts
│   ├── theme.ts
│   └── routes.ts
├── db/
│   ├── database.ts
│   ├── migrations/
│   ├── repositories/
│   └── queries/
├── hooks/
├── lib/
│   ├── currency.ts
│   ├── invoice-calculations.ts
│   ├── tax.ts
│   ├── profit.ts
│   ├── stock.ts
│   └── validation.ts
├── services/
│   ├── pdf/
│   ├── sharing/
│   ├── printing/
│   └── notifications/
├── store/
├── types/
├── utils/
├── docs/
├── CLAUDE.md
├── app.json
├── package.json
└── tsconfig.json
```

## Data flow

```text
Screen → hook → repository/service → SQLite/platform API
                ↓
          pure lib calculations
```

- Screens compose UI and call hooks.
- Hooks coordinate loading and mutations.
- Repositories own SQL.
- Services own platform APIs.
- `lib/` owns deterministic calculations.
- Zustand does not replace SQLite.

## Mobile-first development

Keep the Git repository in Termux home, for example `~/InvoiceFine`, rather than Android shared storage. Shared storage may cause permissions, executable, and symlink problems with `node_modules`.

Use GitHub as the transfer path to a computer later. On a computer, clone the same repository and install dependencies. Android Studio should open the generated `android/` folder only when native work is needed.

Do not run `expo prebuild` until a native dependency or development build requires it. Commit or back up the repository before prebuild.
