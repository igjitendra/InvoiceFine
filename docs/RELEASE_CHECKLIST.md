# InvoiceFine Android release checklist

## Automated gates

- [ ] `node node_modules/typescript/bin/tsc --noEmit`
- [ ] `node node_modules/expo/bin/cli config --type public`
- [ ] Invoice calculation regression tests pass
- [ ] Fresh database reaches latest migration version
- [ ] Existing version-1 database migrates without data reset
- [ ] No unsafe TypeScript suppression or business SQL outside `db/`

## Permissions and privacy

- [ ] Photo access is requested only when selecting logo/signature
- [ ] Camera and microphone permissions are not requested
- [ ] Printing and sharing occur only after an explicit user action
- [ ] No contacts, SMS, location, or broad storage permission exists
- [ ] Android app-data backup decision matches `BACKUP_STRATEGY.md`

## Physical Android workflows

1. Complete onboarding and reopen the app.
2. Create, edit, search, and archive a customer.
3. Create product/service catalog records and verify low stock.
4. Create a multi-item draft and resume it after restart.
5. Finalize once; verify number allocation and stock deduction.
6. Generate and share one A4 invoice and one 4 × 6 invoice.
7. Record partial and final payments; verify overpayment is blocked.
8. Verify customer ledger and receivables.
9. Add an expense; verify gross and net profit for a date range.
10. Verify Dashboard today/month/custom totals, recent invoices, and low stock.

## Device UI review

- [ ] Narrow Android width does not clip cards, forms, or action buttons
- [ ] Status bar, safe areas, tab bar, and gesture footer remain unobstructed
- [ ] Keyboard does not hide focused inputs or save actions
- [ ] All interactive controls have at least a 44-point target
- [ ] TalkBack announces buttons, selected options, labels, errors, and loading states

## Build gate

Run a development/preview Android build only after all checks above pass. Install that build on a physical device and repeat the ten workflows before preparing a production build.
