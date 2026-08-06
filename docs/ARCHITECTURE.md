# Technical Architecture

_Last updated: 2026-08-04_

## Runtime stack

- Expo SDK 57, React Native, Expo Router
- strict TypeScript with `noUncheckedIndexedAccess`
- `expo-sqlite` for persistent business data
- React Hook Form
- `expo-image-picker`
- `expo-print` and `expo-sharing`
- `react-native-svg` only for charts
- `expo-haptics` for approved tactile feedback
- `@expo/vector-icons`, safe-area context, Expo status bar

Use Expo CLI to install Expo-compatible module versions. Avoid NativeWind, Zustand, MMKV, heavy chart libraries, or additional state/persistence layers unless a measured need is approved.

## Actual folder responsibilities

```text
app/                 Expo Router routes and composition
components/ui/       shared controls, states, skeletons, gestures
components/*/        feature UI
constants/           strings, theme, routes
 db/migrations/      versioned SQLite schema changes
 db/repositories/    SQL reads/writes and aggregates
hooks/               reusable UI/data coordination
lib/                 deterministic calculations and isolated helpers
services/            PDF, print, share, files/platform workflows
types/               domain contracts
tests/               synthetic deterministic tests
docs/                product, architecture, release instructions
```

## Data flow

```text
Route → feature component → hook/repository/service → SQLite/platform
                              ↓
                     pure lib calculations
```

- Routes stay thin.
- SQL remains under `db/`.
- Reports aggregate in SQLite and return small serializable datasets.
- UI state remains local unless a shared transient store is justified.
- SQLite remains source of truth.

## Transaction boundaries

Atomic transactions protect invoice finalization/number allocation/stock, cancellation reversal, and payment status updates. UI code must never reimplement these mutations.

## Reporting architecture

`db/repositories/report-analytics.ts` and related aggregate repositories perform grouped queries. Reusable chart components receive `ChartDatum[]`; they never fetch tables themselves. This serializable boundary can support future PDF chart export without introducing a heavy chart library.

## Theme architecture

The app follows the device color scheme. Shared palette/hooks provide background, surface, text, muted, border, primary, positive, warning, and danger colors. Changed screens must avoid hardcoded light-only text/surfaces. Status-bar style follows the theme; unsupported SDK props must not be passed.

## Interaction architecture

- Native-driver animations for transform/opacity.
- Skeletons respect reduced motion.
- Swipe actions use a reusable row and must retain tap/long-press/accessibility alternatives.
- Haptics are best-effort and must never block a business action.
- Destructive actions require confirmation.

## Mobile workflow

Develop from `~/InvoiceFine` in Termux. Shared storage is not a valid active `node_modules` location. Expo Go is useful for iteration, but development/preview builds are required before release certification.
