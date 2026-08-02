# Phone and Termux Setup Strategy

## Recommended location

Keep the active Git project inside Termux home:

```text
~/InvoiceFine
```

Do not keep the active `node_modules` tree under Android shared storage. Shared storage can cause permission, symlink, and executable problems.

Use shared storage only for downloaded ZIP files, images, exported PDFs, and manual backups.

## Safe workflow

1. Work in `~/InvoiceFine`.
2. Keep `.claude/skills` and `CLAUDE.md` in that project root.
3. Start Claude Code from the same root.
4. Test on a physical Android device with the supported Expo workflow.
5. Commit small milestones.
6. Push to GitHub frequently.
7. Later, clone the same repository on a computer.
8. Use Android Studio for emulator, Gradle, native debugging, and release signing when needed.

## Important limits

- Expo Go does not represent every native or background capability.
- Test notifications, native modules, background behavior, and release configuration with a development/preview build before the app is complete.
- MMKV and some chart/native libraries may require a development build. Do not add them merely because they appear in the long-term stack.
- Run `expo prebuild` only when native folders are actually needed, and back up/commit first.

## Git discipline

- One feature or fix per commit.
- Never commit secrets, generated PDFs, local databases, or `node_modules`.
- Keep a suitable `.gitignore`.
- Push after each stable milestone so the project can be moved to a computer safely.
