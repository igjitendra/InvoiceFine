# Prompt Template for Each Coding Task

Copy this template into Claude Code and replace the bracketed fields.

```text
Read CLAUDE.md and these documents before editing:
- docs/MVP_SCOPE.md
- docs/ARCHITECTURE.md
- docs/UI_DESIGN_SYSTEM.md
- [other relevant document]

Task: [one small, specific task]

Current milestone: [milestone number and name]

Acceptance criteria:
1. [observable result]
2. [observable result]
3. [verification requirement]

Constraints:
- React Native + Expo + Expo Router + strict TypeScript.
- Keep business logic in lib/, SQLite in db/, platform APIs in services/, and UI in app/components.
- Use centralized strings and theme tokens.
- Respect safe area, status bar, keyboard, and bottom tab/footer.
- Do not add dependencies without approval.
- Do not edit unrelated files.
- Do not commit or push.

Before coding:
1. Inspect the current repository.
2. Explain the implementation plan.
3. List files that will be created or changed.
4. Identify any dependency or schema migration needed and wait for approval if new.

After coding:
1. Run TypeScript and relevant tests/checks.
2. Report exact commands and results.
3. List changed files.
4. State remaining limitations honestly.
```

## Good first task

```text
Task: Build the application shell only.

Acceptance criteria:
1. SafeAreaProvider and StatusBar are configured at the root.
2. Expo Router bottom tabs contain Dashboard, Invoices, Customers, Catalog, and More.
3. Every tab uses a shared screen container with correct top and bottom insets.
4. Bottom tabs do not overlap scroll content on a narrow Android screen.
5. All labels come from constants/strings.ts and icons use @expo/vector-icons.
6. No database or business feature is implemented yet.
```

## Bad prompt

```text
Build the complete invoicing app with every feature.
```

That prompt creates inconsistent architecture, unfinished screens, unverified calculations, and difficult debugging.
