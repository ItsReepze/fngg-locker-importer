# Fortnite.gg Locker Importer

Import your entire Fortnite locker to [fortnite.gg](https://fortnite.gg) with one click.

![Version](https://img.shields.io/badge/version-2.1-blue)
![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red)

## Features

- **One-click import** - Connect your Epic account and import all your cosmetics
- **Auto-sorting** - Items get sorted by type (outfits first, then backblings, pickaxes...) and rarity
- **Secure login** - Uses Epic's official Device Code flow, your password never touches the script
- **Session saving** - Stay logged in for ~2 hours, no need to re-authenticate every time

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. Click **[Install Script](https://greasyfork.org/scripts/XXXXX)** on Greasy Fork
3. Go to [fortnite.gg/locker](https://fortnite.gg/locker)
4. Click "Connect Epic Account" and follow the instructions

## How it works

1. You login via Epic's Device Code (like Discord or other apps do)
2. Script reads your cosmetics from Epic's API
3. Items get matched with fortnite.gg's database
4. Everything gets sorted and compressed into a URL
5. You get redirected to your locker page

## Screenshots

### Connect
![Connect](images/panel.png)

### Login
![Login](images/login.png)

### Import
![Import](images/connected.png)

## FAQ

**Is this safe?**
Yes. The script uses Epic's official OAuth flow. Your password is never entered in the script, you login directly on Epic's website. The script only receives a temporary token that can read your locker, nothing else.

**Why do I need to login again after a while?**
The token expires after ~2 hours for security reasons. This is normal.

**Some items are missing?**
The script can only show items that exist in fortnite.gg's database. Very new items might not be added yet.

## Support

If you like this script, you can support me by using creator code **"Reepze"** in the Fortnite item shop!

## License

All Rights Reserved - you can use it, but don't redistribute or modify without permission

---

Made with ❤️ by Reepze
