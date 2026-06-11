# Release Test Checklist

Run these manual tests before publishing a new version.

## Core flow
- [ ] Fresh install: panel appears on fortnite.gg, tour starts
- [ ] Connect Epic Account: login tab opens, fallback link works with popup blocker
- [ ] Login completes: name, avatar and token time appear
- [ ] Import: status messages run through, done dialog opens with correct counts
- [ ] Imported locker renders correctly on fortnite.gg

## Dialog & sharing
- [ ] Creator code dialog: both buttons import correctly
- [ ] With code already set: thanks message and continue button instead of the pitch
- [ ] Share buttons open X, Reddit, WhatsApp with prefilled text; copy works

## Panels
- [ ] Importer collapses via edge tab, info and debug close with it and restore on reopen
- [ ] Info panel toggles via ? tab and ? button
- [ ] Debug console toggles via bug tab and bug button, report copies, diagnostics run

## Account stats (hidden)
- [ ] Click the username: stats panel opens on the left, debug closes (and vice versa)
- [ ] All sections load with plausible data, recent purchases open the fortnite.gg item overlay
- [ ] Season history expands via the more link
- [ ] Panel state survives a reload, logout clears the panel content
- [ ] Manual creator code dialog (Ctrl+Alt+Shift+C): valid code accepted, invalid rejected, empty removes

## Session lifetime
- [ ] Token countdown in the status updates over time
- [ ] After expiry the script logs out automatically with a notice

## Settings
- [ ] Auto-logout toggle persists and works (token cleared after import)
- [ ] Language switch EN/DE/Auto reloads with the right language
- [ ] Restart tour shows the tour again

## Error paths
- [ ] Not logged in to fortnite.gg: immediate clear error, Try again button
- [ ] Session expired (delete token): clean reconnect flow
- [ ] Cancel during login wait works, login expires after ~10 minutes with a message

## Environment
- [ ] Chrome and Firefox
- [ ] German fortnite.gg page shows German UI
- [ ] Mobile user agent shows the desktop-only notice
