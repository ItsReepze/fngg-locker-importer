# Changelog

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
