# AI Coding Task Template

```text
Read first:
- CLAUDE.md
- docs/PROJECT_STATUS.md
- docs/IMPLEMENTATION_PLAN.md
- docs/ARCHITECTURE.md
- docs/UI_DESIGN_SYSTEM.md
- [task-specific docs]

Task: [one bounded task]
Current phase: [phase]

Acceptance criteria:
1. [observable behavior]
2. [error/empty/loading/accessibility behavior]
3. [light/dark and 360dp requirement if UI]
4. [exact verification command]

Constraints:
- Expo SDK 57, Expo Router, strict TypeScript/noUncheckedIndexedAccess.
- SQLite remains business-data source of truth; SQL stays under db/.
- Money uses integer paise; quantities use central scaling.
- Reuse centralized strings, palette, and components.
- Do not add dependencies or migrations without approval.
- Do not expand business scope or edit unrelated files.
- Do not commit/push.
- Never claim phone verification from a parser/sandbox result.

Before coding:
1. Inspect current source and relevant docs.
2. Explain plan and affected files.
3. Identify dependency/migration/destructive behavior and wait for approval.

After coding:
1. Run TypeScript and relevant tests.
2. Report exact results and changed files.
3. State runtime checks still required on the physical phone.
```

## Safe code-sharing reminder

Share source/config/docs only. Exclude `node_modules`, `.expo`, `.git`, `.env*`, credentials, keystores, SQLite databases, generated invoices, signatures, and real customer/payment data.
