# Security Policy

## What this script can and cannot do

- Login happens exclusively on Epic's official website via the official Device Code flow. The script never sees your password.
- The script only reads data, with one exception: it can set the creator code on your account, and it does that only after you explicitly choose it in the dialog (or via the manual code feature). It cannot make purchases, change account settings or modify your locker on Epic's side.
- The token expires after roughly 2 hours. With auto-logout enabled (the default), it is cleared immediately after the import.
- Nothing is sent to third parties. The script only talks to Epic, fortnite.gg, fortnite-api.com (public cosmetics database), greasyfork.org (version check) and cdnjs.cloudflare.com (loads the pako compression library).

## Verifying the script yourself

The entire tool is a single unobfuscated file. You can read it, or paste it into any AI assistant and ask for a security audit.

## Official sources

Only install from:
- https://greasyfork.org/en/scripts/563780-fortnite-gg-locker-importer
- https://github.com/ItsReepze/fngg-locker-importer

Copies hosted anywhere else may be modified and unsafe.

## Reporting a vulnerability

If you find a security issue, please open a GitHub issue marked [SECURITY] or contact the author via GitHub. Please do not post exploit details publicly before a fix is released.
