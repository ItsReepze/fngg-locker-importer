<div align="center">

# 🎒 Fortnite.gg Locker Importer

**Import your entire Fortnite locker to [fortnite.gg](https://fortnite.gg) with one click.**

[![Install](https://img.shields.io/badge/Install-Greasyfork-670000?style=for-the-badge)](https://greasyfork.org/en/scripts/563780-fortnite-gg-locker-importer)
[![Version](https://img.shields.io/badge/Version-4.0.2-f0db4f?style=for-the-badge)](https://github.com/ItsReepze/fngg-locker-importer/releases)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

No downloads. No .exe files. No password sharing. Runs entirely in your browser.


</div>

## ✨ Features

- **One-click import** of your full locker (8000+ items supported): skins, pickaxes, emotes, wraps, banners, instruments, cars, LEGO kits and more
- **Smart sorting** by type and rarity, exactly how fortnite.gg expects it
- **Locker comparison**: see how many items are new since your last import
- **Account stats panel**: V-Bucks, lifetime wins, account level, season history, purchases, gifts, Save the World and Creative info, in its own tab
- **Collection breakdown**: your owned cosmetics counted by rarity and type
- **Selective import filter**: choose which cosmetic types, rarities and series get imported
- **Filter presets**: save your favorite fortnite.gg filter views and reapply them in one click. Shared across Cosmetics, Locker, Most Used and Wishlist, with export/import, and saved in your browser
- **Clickable chapter filter**: select a whole chapter of seasons at once on fortnite.gg's filter
- **Background locker check**: get notified when you own new items since your last import
- **Wishlist tools**: see how many wishlisted items you already own, clear the owned ones in one click, owned items glow on your wishlist page, and a shop alert when a wishlisted item is in the item shop
- **13 languages**, auto-detected from the fortnite.gg page (English, Deutsch, Español, Español LA, Français, Italiano, 日本語, 한국어, Polski, Português BR, Русский, Türkçe, العربية)
- **Auto-logout** after import (on by default): your Epic token is cleared automatically
- **Guided tour** for first-time users, restartable anytime in settings
- **Built-in diagnostics** and a one-click debug report for easy support
- **Update notifications** when a new version is released
- **100% free.** If it saved you time, you can support development with Creator Code **REEPZE** (always optional, never automatic)

## 🚀 Installation

1. **Install a userscript manager** (one-time setup):
   - Chrome / Edge / Brave: [Tampermonkey](https://www.tampermonkey.net/)
   - Firefox: [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) or [Violentmonkey](https://violentmonkey.github.io/)
2. **Install the script**: [Click here and press "Install"](https://greasyfork.org/en/scripts/563780-fortnite-gg-locker-importer)
3. **Open [fortnite.gg](https://fortnite.gg)** and follow the panel on the right side. Done!

> **Chrome users:** If the panel does not appear, open the Tampermonkey extension settings and enable **"Allow User Scripts"** (Chrome requires this since Manifest V3). Then reload the page.

> **Note:** This is a desktop tool. It does not work on iPhone, iPad or Android because mobile browsers do not support userscripts properly.

## ⚡ How it works

1. Click **"Connect Epic Account"** in the panel
2. Login on **Epic's official website** (a new tab opens)
3. Click **"Import Locker"**
4. Done! Your locker is on fortnite.gg, sorted and ready to share

The script reads your locker through the same official Epic API that the game uses, matches every item against the fortnite.gg database, compresses the result and hands it to fortnite.gg's import function.

## 🔐 Is this safe?

Yes. This was the top priority in every design decision:

| | This script | Typical .exe locker tools |
|---|---|---|
| Download required | ❌ None, runs in your browser | ✔️ You run a program on your PC |
| Source code readable | ✔️ Every line, unobfuscated | ❓ Often compiled or obfuscated |
| Password handling | ✔️ Never sees it, login happens on epicgames.com | ❓ Varies |
| Account permissions | ✔️ Reads data only. The single write action: setting the creator code, only with your explicit consent | ❓ Varies |
| Data collection | ✔️ None, nothing leaves your browser | ❓ Varies |
| Token lifetime | ✔️ Expires after ~2 hours, auto-logout by default | ❓ Varies |

**Don't take our word for it.** Paste the script into any AI and ask it to audit the code. It is a single readable file.

⚠️ **Only install from the official sources** ([Greasyfork](https://greasyfork.org/en/scripts/563780) or this repository). Copies from anywhere else might be modified to steal accounts.

## ❓ FAQ

**The panel does not show up.**
Make sure Tampermonkey is installed and enabled, then reinstall the script from Greasyfork and reload fortnite.gg. On Chrome, enable "Allow User Scripts" in the extension settings.

**The Epic login page did not open.**
Your popup blocker probably stopped it. Click the "Login page didn't open? Click here" link in the panel.

**The import button says the compression library is blocked.**
An adblocker or network filter is blocking `cdnjs.cloudflare.com`. Allow that domain and reload.

**On Chrome it fails with a 403 or "fortnite.gg blocked the request".**
Recent Chrome versions require Tampermonkey's Developer Mode for some requests. Open `chrome://extensions`, turn on "Developer mode" (top right), and reload fortnite.gg. If it still fails, Firefox works without this step.

**Why does the debug console show "backend items skipped"?**
Your Epic profile contains quest trackers, tokens, banner colors and other non-cosmetic data. These are not lockable items and fortnite.gg does not know them. This is completely normal.

**Are shop bundles imported?**
Bundles do not exist as items in your Epic profile. When you buy a bundle, Epic stores the individual items it contains, and all of those are imported. fortnite.gg recognizes bundle ownership through the contained items.

**Does this work on mobile?**
No. Mobile browsers do not support userscripts. Use a desktop browser (Chrome, Firefox or Edge).

**Something else is wrong.**
Open the debug console (🐛 tab on the left), click "Run Diagnostics" and the 📋 button, then paste the report into a [GitHub issue](https://github.com/ItsReepze/fngg-locker-importer/issues). That report contains everything needed to help you.

## 🐛 Reporting bugs

1. Open the debug console with the 🐛 tab
2. Click **Run Diagnostics**
3. Click the **📋 button** to copy the debug report
4. [Open an issue](https://github.com/ItsReepze/fngg-locker-importer/issues/new?template=bug_report.md) and paste it

## 🙏 Thanks for the help

- [thororen1234](https://github.com/thororen1234): locker comparison via the LockerItems page variable

Contributions are welcome! The codebase is a single readable userscript file.

## ❤️ Support

This tool is and stays free. If it saved you time, you can support development by using Creator Code **REEPZE** in the Fortnite Item Shop. It costs you nothing extra, and you can change or remove the code in-game anytime.

A ⭐ on this repository and a [review on Greasyfork](https://greasyfork.org/en/scripts/563780-fortnite-gg-locker-importer/feedback) also help a lot.

## 📜 License & Disclaimer

Released under the [MIT License](LICENSE).

This project is not affiliated with, endorsed by, or connected to Epic Games, Inc. or fortnite.gg. It is an unofficial, fan-made tool. Use at your own risk.
