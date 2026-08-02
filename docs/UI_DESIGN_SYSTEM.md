# Professional Mobile UI System

## Visual direction

Clean, trustworthy, compact business UI. Use white and soft-gray surfaces, strong hierarchy, and one primary blue accent. Green indicates money received or positive results; amber indicates pending attention; red indicates destructive or overdue states.

## Color tokens

- background: `#F6F7F9`
- surface: `#FFFFFF`
- primary: `#2563EB`
- primary soft: `#EFF6FF`
- text primary: `#111827`
- text secondary: `#6B7280`
- border: `#E5E7EB`
- positive: `#15803D`
- warning: `#B45309`
- danger: `#DC2626`

Meet readable contrast. Never use color as the only status indicator.

## Spacing

Use only:

```text
4, 8, 12, 16, 24, 32, 48
```

Defaults:

- screen horizontal padding: 16
- card padding: 16
- gap between related controls: 8 or 12
- gap between sections: 24
- input height: 48–52
- button height: 48–52
- minimum touch target: 44×44

## Typography

- screen title: 24/30, bold
- section title: 18/24, semibold
- card value: 22–28, bold depending on space
- body: 16/24
- secondary: 14/20
- caption: 12/16, only for non-essential information
- currency figures use tabular numerals when available

Do not use oversized dashboard headings. Keep labels short and values prominent.

## Status bar and safe area

- Use `SafeAreaProvider` at the app root.
- Use `SafeAreaView` or safe-area insets intentionally per screen.
- Configure `StatusBar` with a light background and dark content in MVP.
- Never add fixed magic-number top padding to simulate a status bar.
- Full-screen modals must also respect safe areas.

## Header

- 56px visual height after top inset.
- Left: back or menu action when needed.
- Center or left-aligned title consistently.
- Right: maximum two clear actions.
- Avoid duplicated screen title inside content unless hierarchy requires it.

## Bottom tabs/footer

Recommended tabs:

1. Dashboard
2. Invoices
3. Customers
4. Catalog
5. More

Rules:

- Use vector icons and text labels.
- Respect bottom safe-area/navigation inset.
- Target visual height 64–72 plus required inset.
- Active state uses primary color; inactive state uses secondary text.
- Never place essential content behind the tab bar.
- Scroll content needs bottom padding at least tab height + 24.
- A floating action button must not collide with the tab bar or Android navigation.

## Cards

- radius: 12
- border: 1px soft border
- minimal or no shadow
- no nested card-on-card clutter
- one card should communicate one main idea

Dashboard summary cards should include label, value, optional trend/status, and accessible meaning.

## Forms

- Label above field; do not rely on placeholder as label.
- Show required status consistently.
- Show helper/error text below field.
- Numeric keyboard for money and quantity.
- Use searchable selection screens or sheets for customers/items.
- Keep save action reachable when keyboard is open.
- Use `KeyboardAvoidingView`/scroll behavior appropriate to platform.
- Disable save while submitting and prevent duplicate taps.

## Lists

- Use `FlatList` for growing data.
- Row height should remain comfortable, normally 64–80.
- Show primary label, useful secondary detail, status, and amount.
- Provide search, filter, empty state, and loading state.
- Use swipe actions only with a visible alternative.

## States

Every data screen requires:

- initial loading
- empty state with one clear action
- populated state
- validation error
- recoverable data error with retry
- disabled/submitting state
- success feedback when an action completes

Do not show raw database or JavaScript errors to users.

## Invoice creation UX

Use a step-aware single flow:

1. invoice type/date
2. customer
3. line items
4. discount/tax/notes
5. totals and preview
6. save draft or finalize

Keep totals visible near the bottom. Confirm finalization because it affects invoice numbering and stock.

## Responsive checks

Test at minimum:

- narrow Android width around 360px
- common width around 390–412px
- large text/font scaling
- keyboard open
- long customer and product names
- large currency values
- Android navigation modes

No horizontal screen scrolling, clipped buttons, overlapping footer, or content under status/navigation bars.
