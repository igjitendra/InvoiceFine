# Invoice Business App — AI Development Instructions

## Mission

Build a production-quality, offline-first business management app for Indian small businesses using React Native, Expo, Expo Router, and TypeScript. The working name is **InvoiceFine** until the owner selects a final name.

The app must help users manage customers, products and services, invoices, payments, expenses, stock, profit, PDFs, and reports. Build in phases. Do not implement Pro or Business features while working on MVP unless explicitly requested.

## Mandatory workflow

1. Read this file and the relevant files in `docs/` before editing.
2. Inspect the repository and reuse existing conventions.
3. Work on one small task at a time.
4. Before coding, state the task, affected files, and acceptance criteria.
5. Do not add dependencies without explaining why and receiving approval.
6. Do not rewrite unrelated files.
7. Preserve existing user changes.
8. After coding, run TypeScript and relevant checks. Never claim success without running them.
9. Report files changed, checks run, results, and remaining limitations.
10. Never commit or push unless explicitly asked.

## Product scope

Follow `docs/MVP_SCOPE.md`. MVP is the only active release scope. Future features remain documented but must not leak into current screens, schema, navigation, or dependencies unless needed for forward-compatible data design.

## Architecture rules

- `app/`: Expo Router routes and screen composition only.
- `components/`: reusable visual components only.
- `lib/`: pure business logic and calculations only. No React components, navigation, SQLite calls, or platform APIs.
- `db/`: SQLite initialization, migrations, repositories, queries, and transactions.
- `services/`: platform integrations such as PDF, sharing, printing, notifications, and file handling.
- `store/`: Zustand UI/session state. SQLite remains the source of truth for business data.
- `hooks/`: reusable React hooks that connect UI to repositories/services.
- `types/`: shared TypeScript domain types.
- `constants/`: strings, theme tokens, routes, units, and fixed app constants.
- `utils/`: small generic utilities only; do not turn it into a dumping ground.

Screens and components must never contain raw SQL, tax formulas, invoice-total formulas, stock mutation logic, or profit calculations.

## Data rules

- Use `expo-sqlite` as the source of truth for persistent business data.
- Do not duplicate the same business records in SQLite, MMKV, AsyncStorage, and Zustand.
- For MVP, use SQLite settings or AsyncStorage only for tiny non-relational preferences. MMKV is deferred until a development build is justified.
- Store money as integer paise, never floating-point rupees.
- Store timestamps as ISO 8601 UTC strings. Convert for display at the UI boundary.
- Use SQLite transactions for invoice finalization, payments, and stock movement updates.
- Never edit a finalized invoice silently. Use controlled correction, cancellation, or duplicate-as-new behavior.
- Invoice items must store snapshots of description, price, tax rate, and cost so historical invoices do not change when catalog data changes.
- Use migrations; never destroy the database to apply a schema change.

## TypeScript rules

- Enable and respect strict TypeScript.
- Avoid `any`; use `unknown` and narrow it.
- Define explicit domain types and repository return types.
- Validate user-entered and imported data at boundaries.
- Handle nullable database fields explicitly.
- Use named exports except where Expo Router requires a default route component.

## UI quality rules

Follow `docs/UI_DESIGN_SYSTEM.md`.

- Professional, calm, business-focused UI.
- Light theme for MVP.
- No emoji as UI icons. Use `@expo/vector-icons` consistently.
- All visible strings belong in `constants/strings.ts`.
- Use Safe Area correctly on every screen.
- Configure `expo-status-bar`; content must never render under the status bar accidentally.
- Bottom navigation/footer must respect Android navigation insets and never cover content.
- Every scroll screen must include adequate bottom padding for tabs and fixed actions.
- Use the spacing scale only: 4, 8, 12, 16, 24, 32, 48.
- Minimum touch target: 44×44.
- Use consistent cards, radii, typography, inputs, empty states, loading states, and errors.
- Avoid giant headings, excessive shadows, random gradients, cramped forms, and decorative clutter.
- Forms must work with the keyboard open and keep the focused field visible.
- Check 360px-wide Android screens and larger phones.

## Form rules

- Use React Hook Form and a single validation strategy approved for the project.
- Display field-level errors near the field.
- Disable duplicate submission while saving.
- Preserve draft input when recoverable.
- Confirm destructive actions.
- Normalize phone numbers, GSTIN, invoice numbers, quantities, and currency at boundaries.

## Business calculation rules

- Centralize subtotal, discount, GST, rounding, total, outstanding, COGS, gross profit, and net profit calculations in `lib/`.
- Never use JavaScript floating-point numbers directly for currency arithmetic.
- Net profit is not simply sales minus all purchases. Use recognized sales revenue minus cost of goods sold minus expenses for the selected period.
- A payment changes outstanding balance, not invoice total.
- Finalizing a product invoice creates stock-out movements in the same transaction.
- Cancelling a finalized invoice reverses eligible stock movements through auditable entries; do not delete history.

## PDF and sharing rules

- PDF content must match the stored invoice snapshot.
- Include business details, customer details, line items, totals, tax breakdown, notes, payment status, and authorized signature only when configured.
- Generate A4 output with safe margins and page-break handling.
- Never claim WhatsApp delivery. Use the system share sheet; WhatsApp is one possible target when installed.
- Do not hardcode personal or business data in templates.

## Performance rules

- Paginate or limit long lists.
- Add indexes for frequent filters and joins.
- Avoid reading the entire database for dashboard cards.
- Memoize only when evidence justifies it.
- Keep list rows stable and use appropriate `FlatList` keys.

## Security and privacy

- Offline-first MVP: no backend, analytics, ads, cloud sync, or AI API unless explicitly approved.
- Never log customer details, GSTIN, phone numbers, invoice content, or payment data unnecessarily.
- Never store secrets in source control.
- Use synthetic fixtures in tests and screenshots.

## Definition of done

A task is complete only when:

- acceptance criteria are met
- TypeScript passes
- relevant tests/checks pass
- loading, empty, error, and success states are handled
- safe area, status bar, keyboard, and bottom footer behavior are checked when UI changed
- no unrelated files changed
- no unapproved dependency was added
- documentation is updated if behavior or setup changed
