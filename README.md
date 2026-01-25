# Fortnite.gg Locker Importer

Import your entire Fortnite locker to [fortnite.gg](https://fortnite.gg) with one click.

![Version](https://img.shields.io/badge/version-2.2-blue)
![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red)

## Features

- **One-click import** - Connect your Epic account and import all your cosmetics
- **Auto-sorting** - Items get sorted by type (outfits first, then backblings, pickaxes...) and rarity
- **Secure login** - Uses Epic's official Device Code flow, your password never touches the script
- **Session saving** - Stay logged in for ~2 hours, no need to re-authenticate every time

## How to Use

### Step 1: Install the Script
1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. Install the script from [Greasyfork](https://greasyfork.org/en/scripts/563780)

### Step 2: Import Your Locker
1. Go to [fortnite.gg/locker](https://fortnite.gg/locker)
2. You'll see a panel in the bottom-right corner
3. Click **"Link Epic Account"**

### Step 3: Login to Epic Games
A popup will open with Epic Games login.

**If you're NOT logged in to Epic:**
- Log in with your Epic account
- Click "Confirm"

**If you're already logged in to Epic:**
- You'll skip the login
- Just click "Confirm" directly

### Step 4: Import
1. Once connected, click **"Import Locker"**
2. Wait for the import to finish (can take a minute for large lockers)
3. You'll be redirected to your locker page on fortnite.gg

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
