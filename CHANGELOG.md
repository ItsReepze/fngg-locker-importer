# Changelog

## v4.0 (2026-06-17): Chapter Update
The biggest release so far.

### New
- Account stats panel: V-Bucks, lifetime wins, account level, season history, purchases, gifts, Save the World and Creative info, in its own tab
- Collection breakdown: your owned cosmetics counted by rarity and type
- Selective import filter: pick which cosmetic types, rarities and series get imported
- Filter presets: save fortnite.gg filter views and reapply them in one click; shared across Cosmetics, Locker, Most Used and Wishlist; export and import to back up or share; saved in your browser so they survive script updates
- Clickable chapter filter: click a chapter title on the season filter to toggle all of its seasons
- Background locker check: optional notification when you own new items since your last import (configurable threshold and interval)
- Wishlist tools: see how many wishlisted items you already own (with a clickable list), clear the owned ones in one click, owned items glow on your wishlist page, and a shop alert when one of your wishlisted items is in the item shop
- 13 languages, auto-detected from the fortnite.gg page (was English and German)

### Improved
- Major UI restructure: compact Info modal, Account Stats and Debug as their own edge tabs, cleaner settings
- More robust networking: per-request timeouts, automatic quiet retries on transient errors, and Epic rate-limit handling during login
- Cosmetics database caching no longer forces a full refetch on every release

### Fixed
- Background check no longer resurfaces the "new items" notice right after an import
- Stats panel no longer reloads twice or overwrites the import button while busy
- Login no longer keeps polling after a fatal error
- Various smaller correctness and translation fixes


## v3.8 (2026-06-15)
- Fixed: Chrome users hitting a 403 from fortnite.gg now get a clear message explaining the Tampermonkey Developer Mode fix, plus an automatic www fallback that resolves it in many cases (thanks @Venndia for the report)
- Improved: Diagnostics explains the 403 case directly instead of just showing the error code


## v3.7 (2026-06-11)
- New: Guided onboarding tour from first visit to finished import, restartable in settings
- New: Share your locker from the done dialog (X, Reddit, WhatsApp, copy link)
- New: One-time toast after the script updates to a new version
- New: Live session countdown with real automatic logout when the token expires
- New: A little hidden feature for the curious
- Improved: Skipped-item categories now recognize LEGO quests, banner colors, founders packs and other backend data (thanks to real-world debug reports)
- Improved: Security texts now state precisely what the script reads and writes
- Fixed: Header version was out of sync with the script version
- Fixed: Account data panels reset cleanly on logout

## v3.6
- New: Locker comparison shows how many items are new and how many were already in your fortnite.gg locker (thanks @thororen1234 for the LockerItems idea)
- New: Done dialog now appears for everyone, including supporters
- New: Compact dockable debug console with its own edge tab
- Changed: License switched to MIT, LICENSE file added
- Removed: All special dash characters from UI texts

## v3.5
- New: Full English and German localization, auto-detected from the fortnite.gg page language
- New: Settings panel (auto-logout toggle, language, tour restart)
- New: Built-in diagnostics and copyable debug report
- New: Update check against Greasyfork (once per day)
- New: Token lifetime shown in the connected status
- New: Warning when very few items match (signals that the script may need an update)

## v3.4
- New: Update notifications, copy report button, import diff, onboarding hint
- New: Permanent footer with Creator Code and share link
- Fixed: "To My Locker" now uses the real locker link from the page menu

## v3.3
- New: Panel is visible on all fortnite.gg pages with a "To My Locker" shortcut
- New: Mobile devices get a clear "Desktop only" notice
- New: Retry button on every error
- New: Cosmetics database is cached for 24 hours (much faster repeat imports)
- Improved: Debug console groups skipped items by category

## v3.2
- Fixed: Debug panel no longer opens by default for new users
- Fixed: Login polling now times out cleanly instead of running forever
- Fixed: Cosmetics cache no longer breaks when the API is down
- New: Clear error message when the compression library is blocked
- New: Fallback link when the popup blocker stops the Epic login tab

## v3.1
- New: Auto-logout after import (default on, user choice is remembered)
- New: Debug console with import statistics
- Fixed: Creator code is only set after explicit user consent
- Improved: General code cleanup and performance

## v3.0
- Initial public release with numeric sorting and compressed import URLs
