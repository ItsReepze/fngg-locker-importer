// ==UserScript==
// @name         Fortnite.gg Locker Importer
// @namespace    https://fortnite.gg/
// @version      4.0
// @description  Import your Fortnite locker to Fortnite.gg
// @author       ItsReepze
// @match        https://fortnite.gg/*
// @icon         https://fortnite.gg/favicon.ico
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        unsafeWindow
// @connect      account-public-service-prod.ol.epicgames.com
// @connect      fortnite-public-service-prod11.ol.epicgames.com
// @connect      lightswitch-public-service-prod.ol.epicgames.com
// @connect      fortnite-api.com
// @connect      fortnite.gg
// @connect      www.fortnite.gg
// @connect      greasyfork.org
// @connect      raw.githubusercontent.com
// @require      https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js
// @updateURL    https://greasyfork.org/scripts/563780/code/script.meta.js
// @downloadURL  https://greasyfork.org/scripts/563780/code/script.user.js
// @license      MIT
// ==/UserScript==


(function() {
    'use strict';

    var SAC = 'Reepze';
    var VERSION = '3.8';
    var GF_URL = 'https://greasyfork.org/en/scripts/563780-fortnite-gg-locker-importer';
    var SESSION_TIMEOUT = 7200000;
    var POLL_INTERVAL = 3000;
    var REQUEST_TIMEOUT = 20000;
    var HTTP_RETRIES = 2;
    var AUTO_LOGOUT_DELAY = 2000;
    var COSMETICS_CACHE_TTL = 86400000;
    var COSMETICS_SCHEMA_VERSION = '1';
    var UPDATE_CHECK_INTERVAL = 86400000;
    var LOCALES_BASE = 'https://raw.githubusercontent.com/ItsReepze/fngg-locker-importer/main/locales/';
    var LOCALES_CACHE_TTL = 604800000;
    var LOCALE_TIMEOUT = 7000;
    var AVAILABLE_LANGS = ['en', 'ar', 'de', 'es', 'es-419', 'fr', 'it', 'ja', 'ko', 'pl', 'pt-BR', 'ru', 'tr'];
    var LANG_NAMES = { en: 'English', ar: 'العربية', de: 'Deutsch', es: 'Español', 'es-419': 'Español (LA)', fr: 'Français', it: 'Italiano', ja: '日本語', ko: '한국어', pl: 'Polski', 'pt-BR': 'Português (BR)', ru: 'Русский', tr: 'Türkçe' };
    var INLINE_LANGS = ['en'];

    var IS_LOCKER = location.pathname.toLowerCase().indexOf('/locker') !== -1;
    var IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    var I18N = {
        en: {
            importLocker: 'Import Locker', connect: 'Connect Epic Account', cancel: 'Cancel', logout: 'Logout',
            notConnected: 'Not Connected', linkAccount: 'Link your account', connected: 'Connected', greeting: 'Hey {name}!',
            waitingLogin: 'Waiting for login...', completeLogin: 'Complete login in browser',
            loginDidntOpen: 'Login page didn\u2019t open? Click here',
            loading: 'Loading...', checkingSession: 'Checking session',
            toMyLocker: 'To My Locker', openLocker: 'Open your locker to start', lockerImporter: 'Locker Importer',
            desktopOnly: 'Desktop Only', notSupportedMobile: 'Not supported on mobile',
            mobileDesc: 'This tool needs a desktop browser (Chrome, Firefox or Edge) with the Tampermonkey extension installed.',
            freeTool: 'Free tool', creatorCode: 'Creator Code', share: '\ud83d\udce4 Share',
            copyCode: 'Click to copy', copyLink: 'Copy install link',
            tryAgain: 'Try again', connecting: 'Connecting...', processing: 'Processing...', sorting: 'Sorting...',
            loadingCosmetics: 'Loading cosmetics', loadingLocker: 'Loading locker...', loadingBanners: 'Loading banners...',
            gettingItems: 'Getting fortnite.gg items...', checkingFngg: 'Checking fortnite.gg login...', building: 'Building import data...',
            done: 'Done!', itemsImported: ' items imported', newSuffix: ' new',
            loggedOut: 'Logged out', autoLoggedOut: 'Logged out automatically',
            sessionExpired: 'Session expired, please reconnect', loginExpired: 'Login expired, please try again',
            epicFail: 'Couldn\u2019t connect to Epic', fnggLoginFirst: 'Please login to fortnite.gg first!',
            fnggUnreachable: 'fortnite.gg not reachable', fnggBlocked: 'fortnite.gg blocked the request (403). On Chrome, enable Developer Mode in Tampermonkey, or use Firefox. See the GitHub README.', noItems: 'No items found',
            lockerTooLarge: 'Locker too large', pakoBlocked: 'Compression library blocked. Allow cdnjs.cloudflare.com and reload.',
            importFailed: 'Import failed, please try again',
            codeCopied: 'Code copied! \u2764\ufe0f', linkCopied: 'Install link copied, thanks for sharing! \u2764\ufe0f',
            couldntCopy: 'Couldn\u2019t copy', reportCopied: 'Report copied!', thanksHeart: 'Thanks! \u2764\ufe0f', couldntSetCode: 'Couldn\u2019t set code',
            settings: 'Settings', settingsGeneral: 'General', autoLogoutLbl: 'Auto-logout after import', autoLogoutDesc: 'Clears your Epic token once the import is done (recommended)',
            languageLbl: 'Language', langAuto: 'Auto', close: 'Close',
            tokenLeft: 'left',
            modalReady: ' items are ready to import.',
            modalSupport: 'This tool is 100% free. If it saved you time, you can support development by setting Creator Code <strong>{SAC}</strong>. It costs you nothing extra.',
            modalChange: 'You can change or remove the code in-game anytime.',
            useCode: '\u2764\ufe0f Use code & import', withoutCode: 'Import without code',
            review: 'Enjoying this tool? A quick review on Greasyfork helps a lot \u2b50',
            updateAvail: '\u2b06 Update', updateTitle: 'A new version is available',
            warnFewMatches: 'Warning: very few items matched. The script may need an update. Check Greasyfork!',
            infoWhatH: '\ud83c\udfaf What does this do?',
            infoWhat: 'Imports your entire Fortnite locker to fortnite.gg with one click. All cosmetics (skins, pickaxes, emotes, etc.) get sorted automatically by type and rarity.',
            infoSafeH: '\ud83d\udd10 Is this safe?',
            infoSafe: '100% safe! Uses Epic\u2019s official Device Code authentication. Your password never touches this script, you login directly on Epic\u2019s website.<br><span style="color:#888">Don\u2019t take our word for it. Paste the script into any AI and ask it to audit the code.</span>',
            infoHowH: '\u26a1 How it works',
            infoHow: '1. Click "Connect Epic Account"<br>2. Login on Epic\u2019s website<br>3. Click "Import Locker"<br>4. Done! Your locker is updated.',
            infoTokenH: '\ud83d\udd11 Token Info',
            infoToken: 'The access token expires after ~2 hours. After that, simply reconnect. We never store your password.',
            infoSupportH: '\u2764\ufe0f Support me',
            infoSupport: 'If you like this tool, use Creator Code <strong style="color:#f0db4f">{SAC}</strong> in the Fortnite Item Shop!',
            thanksH: '\ud83d\ude4f Thanks for the help',
            alreadyInLocker: 'already in locker',
            totalWord: 'total', addedWord: 'added',
            continueBtn: 'Continue',
            thanksSupport: 'Thanks for supporting with Creator Code <strong>{SAC}</strong>! \u2764\ufe0f',
            shareLocker: 'Share your locker',
            shareText1: 'Check out my Fortnite locker! \ud83c\udf92 {N} items:', shareText2: 'Want to import your locker too? Free, one click:',
            copiedShort: 'Copied!',
            updatedTo: '\u2728 Updated to v',
            restartTour: 'Restart tour',
            tourGo: '\ud83d\udc4b Welcome! This tool imports your Fortnite locker to fortnite.gg. Click "To My Locker" to begin.',
            tour0: '\ud83d\udc4b Welcome! This panel imports your Fortnite locker to fortnite.gg. Step 1: Click "Connect Epic Account".',
            tour1: 'Step 2: Login on Epic\u2019s website in the new tab, then come back here.',
            tour2: 'Step 3: Connected! Now click "Import Locker" and lean back.',
            tour3: '\ud83c\udf89 That\u2019s it! Your locker is now on fortnite.gg. Enjoy!',
            tourSkip: 'Skip tour',
            chapterToggleHint: 'Click to select all seasons of this chapter',
            bgCheckLbl: 'Background locker check',
            bgCheckDesc: 'Check for new locker items while this page is open',
            bgThresholdLbl: 'Notify me at this many new items',
            newSinceImport: 'new since last import',
            bgIntervalLbl: 'Check every (minutes)',
            filterImportLbl: 'Import filter', filterImportDesc: 'Only import the selected types and rarities', importFilterActive: 'Import filter active',
            catOutfit: 'Outfits', catBackpack: 'Back Bling', catPickaxe: 'Pickaxes', catGlider: 'Gliders', catEmote: 'Emotes', catWrap: 'Wraps', catBanner: 'Banners', catMusic: 'Music', catCar: 'Cars', catLego: 'LEGO', catOther: 'Other',
            rarCommon: 'Common', rarUncommon: 'Uncommon', rarRare: 'Rare', rarEpic: 'Epic', rarLegendary: 'Legendary', rarSpecial: 'Special', rarMythic: 'Mythic',
            filterCosmeticsLbl: 'Cosmetics', filterRarityLbl: 'Rarity', filterSpecialLbl: 'Special',
            presetsTitle: 'Filter presets', presetsDesc: 'Save your fortnite.gg cosmetic filters and reapply them with one click.',
            presetsSaveBtn: 'Save', presetsNamePrompt: 'Preset name…', presetsEmpty: 'No presets saved yet.',
            presetsClear: 'Clear all filters', presetsNoFilters: 'no filters',
            presetsDelete: 'Delete', presetsSaved: 'Preset “{name}” saved.',
            presetsDeleted: 'Preset deleted.', presetsOverwrite: 'Overwrite preset “{name}”?',
            presetsExport: 'Export', presetsImport: 'Import', presetsExported: 'Presets copied to clipboard.', presetsImportPrompt: 'Paste exported presets here:', presetsImported: '{n} presets imported.', presetsImportFail: 'Invalid preset data.',
            statsWishlistH: '🎯 Wishlist', statsWishlistOwned: 'You own {x} of {y} wishlisted items',
            wlClear: 'Clear owned ({n})', wlClearConfirm: 'Remove {n} owned items from your wishlist?', wlCleared: 'Removed {n} items from your wishlist.',
            statsCollectionH: '📦 Collection', statsCollectionTotal: 'Owned: {n}', shopWishlist: '{n} wishlist items in the shop',
            impItems: '{n} items imported', impNew: '+{n} new', impAlready: '{n} already in locker', impProcessed: 'Total processed',
            impSkipped: '{n} backend items skipped', impQuests: 'Quests & challenges', impVehicles: 'Vehicles', impSystem: 'System & tokens',
            impUnrecognized: 'Unrecognized', impDuplicates: 'Duplicates', impInvalid: 'Invalid', impNothingUnrec: 'Nothing unrecognized. All skipped items are normal backend data.',
            loginFailed: 'Login failed, please try again',
            catContrail: 'Contrails', catEmoji: 'Emoticons', catSpray: 'Sprays', catLoadingscreen: 'Loading Screens', catJamtrack: 'Jam Tracks', catInstrument: 'Instruments', catToy: 'Toys', catCompanion: 'Pets', catShoe: 'Kicks', catAura: 'Auras',
            panelTitle: 'Locker Import', statsTitle: 'Account Stats', debugTitle: 'Debug Console', infoTitle: 'Info',
            debugCopyReport: 'Copy report to clipboard', debugLastImport: '📊 Last Import', debugNoImport: 'No import data yet. Run an import to see statistics.',
            debugDiagnostics: '🔧 Diagnostics', debugRunDiag: 'Run Diagnostics', debugUnrecognized: '❓ Unrecognized Items',
            debugUnrecDesc: 'Skipped backend data (quests, tokens, schedules, vehicle parts) is summarized above. That’s normal. Anything listed below couldn’t be categorized and might be worth reporting.',
            debugNoData: 'No data yet.', debugRunning: 'Running...',
            diagPako: 'Compression library loaded', diagPakoBlocked: 'pako blocked, allow cdnjs.cloudflare.com',
            diagFnggLogin: 'Logged in to fortnite.gg', diagFnggNoLogin: 'Not logged in to fortnite.gg',
            diagEpicConn: 'Epic account connected', diagEpicNoConn: 'Epic account not connected', diagChecking: 'Checking APIs...',
            diagFnggOk: 'fortnite.gg API reachable', diagFnggBlocked: 'fortnite.gg API blocked (403). On Chrome, enable Tampermonkey Developer Mode or use Firefox.',
            diagFnggErr: 'fortnite.gg API error', diagFnggUnreach: 'fortnite.gg API unreachable',
            diagApiOk: 'fortnite-api.com reachable', diagApiErr: 'fortnite-api.com error', diagApiUnreach: 'fortnite-api.com unreachable',
            diagEpicOk: 'Epic API reachable', diagEpicErr: 'Epic API error', diagEpicUnreach: 'Epic API unreachable',
            ccTitle: '🔧 Set Creator Code', ccDesc: 'Dev tool. Sets any creator code on your account via Epic’s API. Leave empty to remove the current code.',
            ccPlaceholder: 'Creator code...', ccApply: 'Apply', ccChecking: 'Checking code...', ccRemoving: 'Removing code...',
            ccActive: '✓ Code "{code}" is now active.', ccRemoved: '✓ Code removed.', ccFailed: '✗ Code does not exist or could not be set.',
            statsClickLoad: 'Click your name to load.',
            statsLoadingAccount: 'Loading account data...', statsErrProfile: 'Could not load profile ({n}).', statsErrRead: 'Could not read profile.',
            statsLoadingBR: 'Loading battle royale stats...', statsLoadingItems: 'Loading item names...', statsUnknownItem: 'Unknown item',
            statsFullStats: '📊 Full stats on fortnite.gg',
            statsVbucks: 'V-Bucks', statsLifetimeWins: 'Lifetime Wins', statsAccountLevel: 'Account Level', statsVbucksSpent: 'V-Bucks spent',
            statsAccount: '👤 Account', statsName: 'Name', statsId: 'ID', statsClickCopy: 'Click to copy', statsCountry: 'Country', statsCreated: 'Created',
            statsNameChanges: 'Name changes', statsLast: 'last', statsEnabled: 'enabled', statsDisabled: 'disabled', statsBanStatus: 'Ban status', statsBanned: 'BANNED', statsClean: 'Clean', statsLinked: 'Linked', statsNoLinked: 'No linked platforms',
            statsVbucksH: '💰 V-Bucks', statsBalance: 'Balance', statsPurchased: 'Purchased', statsFree: 'Free',
            statsSeason: 'Season', statsLevel: 'Level', statsBP: 'BP', statsFreePass: 'free pass', statsNoData: 'No data', statsBR: '⚔️ Battle Royale', statsSeasonsPlayed: 'Seasons played', statsBattlePasses: 'Battle passes',
            statsSeasonHistory: '📜 Season History', statsLvl: 'Lvl', statsWins: 'wins', statsMore: 'more',
            statsPurchasesH: '🛒 Purchases', statsItemShopPurch: 'Item shop purchases', statsTracked: 'tracked', statsPacksOwned: 'Packs owned', statsRefundsUsed: 'Refunds used', statsTicketsLeft: 'Tickets left',
            statsRecentPurch: '🕒 Recent Purchases',
            statsGifts: '🎁 Gifts', statsSent: 'Sent', statsReceived: 'Received', statsReceivingDisabled: 'Receiving disabled',
            statsSTW: '🏗️ Save the World', statsOwned: 'Owned', statsFoundersPack: 'Founder’s Pack', statsCommanderLevel: 'Commander level', statsResearchPower: 'Research power', statsCollectionBook: 'Collection book', statsNotOwned: 'Not owned',
            statsCreative: '🎨 Creative', statsOwnIslands: 'Own islands',
            statsCreatorCodeH: '⭐ Creator Code', statsThankYou: '❤️ Thank you for the support!', statsSupportPitch: 'Enjoying this tool? Code {code} supports development ❤️', statsNoneSet: 'None set.',
            statsFootnote: '* Epic only keeps a partial purchase history in the profile. Real totals can be higher. Console purchases and ban history are not exposed by this API, only the current ban status.',
            statsErrLoad: 'Could not load account data.'
        }
    };

    function normLang(raw) {
        if (!raw) {return null;}
        var lower = String(raw).trim().toLowerCase();
        for (var i = 0; i < AVAILABLE_LANGS.length; i++) {
            if (AVAILABLE_LANGS[i].toLowerCase() === lower) {return AVAILABLE_LANGS[i];}
        }
        if (lower === 'es-419' || lower === 'es-la' || lower === 'es-mx' || lower === 'es-ar' || lower === 'es-co' || lower === 'es-cl' || lower === 'es-pe' || lower === 'es-ve') {return 'es-419';}
        if (lower.indexOf('pt') === 0) {return 'pt-BR';}
        if (lower.indexOf('es') === 0) {return 'es';}
        var pre = lower.split('-')[0];
        for (var j = 0; j < AVAILABLE_LANGS.length; j++) {
            if (AVAILABLE_LANGS[j].toLowerCase() === pre) {return AVAILABLE_LANGS[j];}
        }
        return null;
    }

    var LANG = (function() {
        try {
            var saved = JSON.parse(GM_getValue('fngg_settings', '{}')).lang;
            if (saved && AVAILABLE_LANGS.indexOf(saved) !== -1) {return saved;}
        } catch(e) {}
        return normLang(document.documentElement.lang) || normLang(navigator.language) || 'en';
    })();

    var IS_RTL = (LANG === 'ar');

    function langOptions() {
        var cur = getSettings().lang || 'auto';
        var html = '<option value="auto"' + (cur === 'auto' ? ' selected' : '') + '>' + esc(t('langAuto') + ' (' + (LANG_NAMES[LANG] || LANG) + ')') + '</option>';
        for (var i = 0; i < AVAILABLE_LANGS.length; i++) {
            var code = AVAILABLE_LANGS[i];
            html += '<option value="' + code + '"' + (cur === code ? ' selected' : '') + '>' + esc(LANG_NAMES[code] || code) + '</option>';
        }
        return html;
    }

    function t(k) {
        var s = (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;
        return s.replace('{SAC}', SAC.toUpperCase());
    }
    var switchToken = 'OThmN2U0MmMyZTNhNGY4NmE3NGViNDNmYmI0MWVkMzk6MGEyNDQ5YTItMDAxYS00NTFlLWFmZWMtM2U4MTI5MDFjNGQ3';
    var epicBase = 'https://account-public-service-prod.ol.epicgames.com';
    var fnBase = 'https://fortnite-public-service-prod11.ol.epicgames.com';

    var LOGO = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiID8+CjxzdmcgYmFzZVByb2ZpbGU9InRpbnkiIGhlaWdodD0iMjA0OCIgdmVyc2lvbj0iMS4yIiB3aWR0aD0iMjA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpldj0iaHR0cDovL3d3dy53My5vcmcvMjAwMS94bWwtZXZlbnRzIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHgyPSIxIiB5MT0iMCIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzhBMkJFMiIgLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMEJGRkYiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTY5Nyw3MTMgTDY5Niw3MTQgTDY5Myw3MTQgTDY4OSw3MTggTDY4OSw4OTYgTDY5NCw5MDEgTDY5NCw5MDQgTDY5Niw5MDYgTDY5Nyw5MDYgTDY5OCw5MDcgTDY5OCw5MDggTDcwNCw5MTQgTDcwNSw5MTQgTDcwNiw5MTUgTDcwNiw5MTYgTDcxMCw5MjAgTDcxMSw5MjAgTDcxMiw5MjEgTDcxMiw5MjIgTDczMSw5NDEgTDczMSw5NDQgTDc0MSw5NTQgTDc0Miw5NTQgTDc0Myw5NTUgTDc0Myw5NTYgTDc0Niw5NTkgTDc0Nyw5NTkgTDc0OCw5NjAgTDc0OCw5NjEgTDc1NSw5NjggTDc1Niw5NjggTDc1Nyw5NjkgTDc1Nyw5NzAgTDc2MCw5NzMgTDc2MSw5NzMgTDc2Miw5NzQgTDc2Miw5NzUgTDc2OSw5ODIgTDc3MCw5ODIgTDc3MSw5ODMgTDc3MSw5ODQgTDc3NCw5ODcgTDc3NSw5ODcgTDc3Niw5ODggTDc3Niw5ODkgTDgwNSwxMDE4IEw4MDYsMTAxOCBMODA3LDEwMTkgTDgwNywxMDIwIEw4MTQsMTAyNyBMODE1LDEwMjcgTDgxNiwxMDI4IEw4MTYsMTAyOSBMODE5LDEwMzIgTDgyMCwxMDMyIEw4MjEsMTAzMyBMODIxLDEwMzQgTDgyOCwxMDQxIEw4MjksMTA0MSBMODMwLDEwNDIgTDgzMCwxMDQzIEw4MzcsMTA1MCBMODM4LDEwNTAgTDgzOSwxMDUxIEw4MzksMTA1MiBMODUwLDEwNjMgTDg1MSwxMDYzIEw4NTIsMTA2NCBMODUyLDEwNjUgTDg1OSwxMDcyIEw4NjAsMTA3MiBMODYxLDEwNzMgTDg2MSwxMDc0IEw4NjQsMTA3NyBMODY1LDEwNzcgTDg2NiwxMDc4IEw4NjYsMTA3OSBMODczLDEwODYgTDg3NCwxMDg2IEw4NzUsMTA4NyBMODc1LDEwODggTDg3OCwxMDkxIEw4NzksMTA5MSBMODgwLDEwOTIgTDg4MCwxMDkzIEw4ODcsMTEwMCBMODg4LDExMDAgTDg4OSwxMTAxIEw4ODksMTEwMiBMOTE4LDExMzEgTDkxOSwxMTMxIEw5MjAsMTEzMiBMOTIwLDExMzMgTDkyMywxMTM2IEw5MjQsMTEzNiBMOTI1LDExMzcgTDkyNSwxMTM4IEw5MzIsMTE0NSBMOTMzLDExNDUgTDkzNCwxMTQ2IEw5MzQsMTE0NyBMOTQ2LDExNTkgTDk0NywxMTU5IEw5NDgsMTE2MCBMOTQ4LDExNjEgTDk2MywxMTc2IEw5NjQsMTE3NiBMOTY1LDExNzcgTDk2NSwxMTc4IEw5NzcsMTE5MCBMOTc4LDExOTAgTDk3OSwxMTkxIEw5NzksMTE5MiBMOTgyLDExOTUgTDk4MywxMTk1IEw5ODQsMTE5NiBMOTg0LDExOTcgTDk4NywxMjAwIEw5ODcsMTIwMyBMOTg4LDEyMDQgTDk4OSwxMjA0IEw5OTAsMTIwNSBMOTkwLDEyMDYgTDk5MSwxMjA3IEw5OTIsMTIwNyBMOTkzLDEyMDggTDk5MywxMjA5IEw5OTQsMTIxMCBMOTk1LDEyMTAgTDk5NiwxMjExIEw5OTYsMTIxMiBMMTAwMCwxMjE2IEwxMDAxLDEyMTYgTDEwMDIsMTIxNyBMMTAwMiwxMjE4IEwxMDAzLDEyMTggTDEwMDQsMTIxOSBMMTAwNCwxMjIwIEwxMDA4LDEyMjQgTDEwMDksMTIyNCBMMTAxMCwxMjI1IEwxMDEwLDEyMjYgTDEwMTYsMTIzMiBMMTAxNywxMjMyIEwxMDE4LDEyMzMgTDEwMTgsMTIzNCBMMTAyMiwxMjM4IEwxMDIzLDEyMzggTDEwMjQsMTIzOSBMMTAyNCwxMjQwIEwxMDI1LDEyNDAgTDEwMjYsMTI0MSBMMTAyNiwxMjQyIEwxMDMwLDEyNDYgTDEwMzEsMTI0NiBMMTAzMiwxMjQ3IEwxMDMyLDEyNDggTDEwMzYsMTI1MiBMMTAzNywxMjUyIEwxMDM4LDEyNTMgTDEwMzgsMTI1NCBMMTAzOSwxMjU1IEwxMDQwLDEyNTUgTDEwNDEsMTI1NiBMMTA0MSwxMjU3IEwxMDQ0LDEyNjAgTDEwNDUsMTI2MCBMMTA0NiwxMjYxIEwxMDQ2LDEyNjIgTDEwNDcsMTI2MyBMMTA0OCwxMjYzIEwxMDQ5LDEyNjQgTDEwNDksMTI2NSBMMTA1MywxMjY5IEwxMDU0LDEyNjkgTDEwNTUsMTI3MCBMMTA1NSwxMjcxIEwxMDU5LDEyNzUgTDEwNjAsMTI3NSBMMTA2MSwxMjc2IEwxMDYxLDEyNzcgTDEwNjIsMTI3NyBMMTA2MywxMjc4IEwxMDYzLDEyNzkgTDEwNjcsMTI4MyBMMTA2OCwxMjgzIEwxMDY5LDEyODQgTDEwNjksMTI4NSBMMTA3NSwxMjkxIEwxMDc2LDEyOTEgTDEwNzcsMTI5MiBMMTA3NywxMjkzIEwxMDgxLDEyOTcgTDEwODIsMTI5NyBMMTA4MywxMjk4IEwxMDgzLDEyOTkgTDEwODksMTMwNSBMMTA5MCwxMzA1IEwxMDkxLDEzMDYgTDEwOTEsMTMwNyBMMTA5MiwxMzA4IEwxMDkzLDEzMDggTDEwOTQsMTMwOSBMMTA5NCwxMzEwIEwxMDk1LDEzMTEgTDEwOTYsMTMxMSBMMTA5NywxMzEyIEwxMDk3LDEzMTMgTDEwOTgsMTMxNCBMMTA5OSwxMzE0IEwxMTAwLDEzMTUgTDExMDAsMTMxNiBMMTEwNiwxMzIyIEwxMTA3LDEzMjIgTDExMDgsMTMyMyBMMTEwOCwxMzI0IEwxMTEyLDEzMjggTDExMTMsMTMyOCBMMTExNCwxMzI5IEwxMTE0LDEzMzAgTDExMjAsMTMzNiBMMTEyMSwxMzM2IEwxMTIyLDEzMzcgTDExMjIsMTMzOCBMMTEyNiwxMzQyIEwxMTI3LDEzNDIgTDExMjgsMTM0MyBMMTEyOCwxMzQ0IEwxMTM0LDEzNTAgTDExMzUsMTM1MCBMMTEzNiwxMzUxIEwxMTM2LDEzNTIgTDExNDAsMTM1NiBMMTE0MSwxMzU2IEwxMTQyLDEzNTcgTDExNDIsMTM1OCBMMTE1MSwxMzY3IEwxMTUyLDEzNjcgTDExNTMsMTM2OCBMMTE1MywxMzY5IEwxMTU0LDEzNzAgTDExNTUsMTM3MCBMMTE1NiwxMzcxIEwxMTU2LDEzNzIgTDExNTcsMTM3MyBMMTE1OCwxMzczIEwxMTU5LDEzNzQgTDExNTksMTM3NSBMMTE2NSwxMzgxIEwxMTY2LDEzODEgTDExNjcsMTM4MiBMMTE2NywxMzgzIEwxMTcxLDEzODcgTDExNzIsMTM4NyBMMTE3MywxMzg4IEwxMTczLDEzODkgTDExNzksMTM5NSBMMTE4MCwxMzk1IEwxMTgxLDEzOTYgTDExODEsMTM5NyBMMTE4NSwxNDAxIEwxMTg2LDE0MDEgTDExODcsMTQwMiBMMTE4NywxNDAzIEwxMTk5LDE0MTUgTDEyMDAsMTQxNSBMMTIwMSwxNDE2IEwxMjAxLDE0MTcgTDEyMDIsMTQxOCBMMTIwMywxNDE4IEwxMjA0LDE0MTkgTDEyMDQsMTQyMCBMMTIxMCwxNDI2IEwxMjExLDE0MjYgTDEyMTIsMTQyNyBMMTIxMiwxNDI4IEwxMjEzLDE0MjkgTDEyMTQsMTQyOSBMMTIxNSwxNDMwIEwxMjE1LDE0MzEgTDEyMTYsMTQzMiBMMTIxNywxNDMyIEwxMjE4LDE0MzMgTDEyMTgsMTQzNCBMMTIyMiwxNDM4IEwxMjIzLDE0MzggTDEyMjQsMTQzOSBMMTIyNCwxNDQwIEwxMjI1LDE0NDAgTDEyMjYsMTQ0MSBMMTIyNiwxNDQyIEwxMjMwLDE0NDYgTDEyMzEsMTQ0NiBMMTIzMiwxNDQ3IEwxMjMyLDE0NDggTDEyNTQsMTQ3MCBMMTI1NCwxNDcyIEwxMjU1LDE0NzMgTDEyNTUsMTQ3NCBMMTI1NiwxNDc0IEwxMjU3LDE0NzUgTDEyNTcsMTQ3NiBMMTI1OCwxNDc2IEwxMjYwLDE0NzggTDEyNjAsMTQ3OSBMMTI2MSwxNDgwIEwxMjYyLDE0ODAgTDEyNjMsMTQ4MSBMMTI2MywxNDgyIEwxMjY2LDE0ODUgTDEyNjcsMTQ4NSBMMTI2OSwxNDg3IEwxMjY5LDE0ODggTDEyNzIsMTQ5MSBMMTI3MywxNDkxIEwxMjc0LDE0OTIgTDEyNzQsMTQ5MyBMMTI3NSwxNDk0IEwxMjc2LDE0OTQgTDEyNzcsMTQ5NSBMMTI3NywxNDk2IEwxMjgwLDE0OTkgTDEyODEsMTQ5OSBMMTI4MywxNTAxIEwxMjgzLDE1MDIgTDEyODQsMTUwMyBMMTI4NSwxNTAzIEwxMjg2LDE1MDQgTDEyODYsMTUwNSBMMTI4NywxNTA1IEwxMjg4LDE1MDYgTDEyODgsMTUwNyBMMTI4OSwxNTA4IEwxMjkwLDE1MDggTDEyOTEsMTUwOSBMMTI5MSwxNTEwIEwxMjk0LDE1MTMgTDEyOTUsMTUxMyBMMTI5NiwxNTE0IEwxMjk2LDE1MTUgTDEyOTgsMTUxNyBMMTI5OSwxNTE3IEwxMzAwLDE1MTggTDEzMDAsMTUxOSBMMTMwMSwxNTE5IEwxMzAyLDE1MjAgTDEzMDIsMTUyMSBMMTMwMywxNTIyIEwxMzA0LDE1MjIgTDEzMDUsMTUyMyBMMTMwNSwxNTI0IEwxMzA2LDE1MjUgTDEzMDcsMTUyNSBMMTMwOCwxNTI2IEwxMzA4LDE1MjcgTDEzMTEsMTUzMCBMMTMxMiwxNTMwIEwxMzE0LDE1MzIgTDEzMTQsMTUzMyBMMTMxNywxNTM2IEwxMzE4LDE1MzYgTDEzMTksMTUzNyBMMTMxOSwxNTM4IEwxMzIwLDE1MzkgTDEzMjEsMTUzOSBMMTMyMiwxNTQwIEwxMzIyLDE1NDEgTDEzMjUsMTU0NCBMMTMyNiwxNTQ0IEwxMzI4LDE1NDYgTDEzMjgsMTU0NyBMMTMzMSwxNTUwIEwxMzMyLDE1NTAgTDEzMzMsMTU1MSBMMTMzMywxNTUyIEwxMzM0LDE1NTMgTDEzMzUsMTU1MyBMMTMzNiwxNTU0IEwxMzM2LDE1NTUgTDEzMzksMTU1OCBMMTM0MCwxNTU4IEwxMzQyLDE1NjAgTDEzNDIsMTU2MSBMMTM0OCwxNTY3IEwxMzQ5LDE1NjcgTDEzNTAsMTU2OCBMMTM1MCwxNTY5IEwxMzUzLDE1NzIgTDEzNTQsMTU3MiBMMTM1NSwxNTczIEwxMzU1LDE1NzQgTDEzNTYsMTU3NSBMMTM1NywxNTc1IEwxMzU5LDE1NzcgTDEzNTksMTU3OCBMMTM2MiwxNTgxIEwxMzYzLDE1ODEgTDEzNjQsMTU4MiBMMTM2NCwxNTgzIEwxMzY1LDE1ODQgTDEzNjYsMTU4NCBMMTM2NywxNTg1IEwxMzY3LDE1ODYgTDEzNzAsMTU4OSBMMTM3MSwxNTg5IEwxMzczLDE1OTEgTDEzNzMsMTU5MiBMMTM3NiwxNTk1IEwxMzc3LDE1OTUgTDEzNzgsMTU5NiBMMTM3OCwxNTk3IEwxMzc5LDE1OTggTDEzODAsMTU5OCBMMTM4MSwxNTk5IEwxMzgxLDE2MDAgTDEzODQsMTYwMyBMMTM4NSwxNjAzIEwxMzg3LDE2MDUgTDEzODcsMTYwNiBMMTM5MCwxNjA5IEwxMzkxLDE2MDkgTDEzOTIsMTYxMCBMMTM5MiwxNjE0IEwxMzkzLDE2MTUgTDEzOTQsMTYxNSBMMTM5OCwxNjE5IEwxMzk4LDE2MjAgTDEzOTksMTYyMCBMMTQwMCwxNjIxIEwxNDAyLDE2MjEgTDE0MDYsMTYyNSBMMTQwNiwxNjI4IEwxNDA3LDE2MjkgTDE0MDgsMTYyOSBMMTQxMiwxNjMzIEwxNDEyLDE2MzQgTDE0MTMsMTYzNCBMMTQxNCwxNjM1IEwxNDE3LDE2MzUgTDE0MTgsMTYzNiBMMTQxOCwxNjM3IEwxNDIwLDE2MzkgTDE0MjAsMTY0MSBMMTQyMSwxNjQyIEwxNDIxLDE2NDMgTDE0MjIsMTY0MyBMMTQyNSwxNjQ2IEwxNzU2LDE2NDYgTDE3NTcsMTY0NSBMMTc2MCwxNjQ1IEwxNzYxLDE2NDQgTDE3NjEsMTYzNyBMMTc2MCwxNjM3IEwxNzU5LDE2MzYgTDE3NTcsMTYzNiBMMTc1NiwxNjM1IEwxNzU2LDE2MzEgTDE3NTUsMTYzMSBMMTc1MywxNjI5IEwxNzUzLDE2MjggTDE3NTIsMTYyOCBMMTc1MSwxNjI3IEwxNzUxLDE2MjYgTDE3NTAsMTYyNSBMMTc0NywxNjI1IEwxNzQzLDE2MjEgTDE3NDMsMTYxOSBMMTc0MiwxNjE4IEwxNzQyLDE2MTcgTDE3NDEsMTYxNyBMMTczOSwxNjE1IEwxNzM5LDE2MTQgTDE3MzgsMTYxNCBMMTczNiwxNjEyIEwxNzM2LDE2MTEgTDE3MzMsMTYxMSBMMTcyOSwxNjA3IEwxNzI5LDE2MDUgTDE3MjgsMTYwNCBMMTcyOCwxNjAzIEwxNzI3LDE2MDMgTDE3MjUsMTYwMSBMMTcyNSwxNjAwIEwxNzI0LDE2MDAgTDE3MjIsMTU5OCBMMTcyMiwxNTk3IEwxNzIxLDE1OTcgTDE3MjAsMTU5NiBMMTcxOCwxNTk2IEwxNzE0LDE1OTIgTDE3MTQsMTU4OSBMMTcxMywxNTg5IEwxNzExLDE1ODcgTDE3MTEsMTU4NiBMMTcwOSwxNTg2IEwxNzA4LDE1ODUgTDE3MDcsMTU4NSBMMTY5OCwxNTc2IEwxNjk4LDE1NzUgTDE2OTcsMTU3NCBMMTY5NywxNTcyIEwxNjk2LDE1NzIgTDE2OTUsMTU3MSBMMTY5MywxNTcxIEwxNjg2LDE1NjQgTDE2ODYsMTU2MSBMMTY4NSwxNTYwIEwxNjg0LDE1NjAgTDE2ODMsMTU1OSBMMTY4MywxNTU4IEwxNjgyLDE1NTggTDE2ODEsMTU1NyBMMTY3OSwxNTU3IEwxNjc3LDE1NTUgTDE2NzYsMTU1NSBMMTY3NSwxNTU0IEwxNjc1LDE1NTMgTDE2NzIsMTU1MCBMMTY3MiwxNTQ4IEwxNjcxLDE1NDcgTDE2NzEsMTU0NiBMMTY2NywxNTQ2IEwxNjY2LDE1NDUgTDE2NjYsMTU0NCBMMTY2MywxNTQxIEwxNjYyLDE1NDEgTDE2NjEsMTU0MCBMMTY2MSwxNTM5IEwxNjU4LDE1MzYgTDE2NTgsMTUzNCBMMTY1NiwxNTMyIEwxNjUzLDE1MzIgTDE2NTIsMTUzMSBMMTY1MiwxNTMwIEwxNjUxLDE1MjkgTDE1OTksMTUyOSBMMTU5NiwxNTMyIEwxNTU4LDE1MzIgTDE1NTcsMTUzMSBMMTU1NywxNTMwIEwxNTU2LDE1MjkgTDE1NTUsMTUyOSBMMTU1MSwxNTI1IEwxNTUxLDE1MjQgTDE1NTAsMTUyNCBMMTU0MiwxNTE2IEwxNTQyLDE1MTUgTDE1NDEsMTUxNSBMMTUzNCwxNTA4IEwxNTM0LDE1MDcgTDE1MzMsMTUwNyBMMTUyOCwxNTAyIEwxNTI4LDE1MDEgTDE1MjcsMTUwMSBMMTUyNiwxNTAwIEwxNTI2LDE0OTkgTDE1MjUsMTQ5OCBMMTUyNCwxNDk4IEwxNTIzLDE0OTcgTDE1MjMsMTQ5NSBMMTUyNCwxNDk0IEwxNTQyLDE0OTQgTDE1NDIsMTQ5MyBMMTU0NCwxNDkxIEwxNTU4LDE0OTEgTDE1NjAsMTQ4OSBMMTU3NCwxNDg5IEwxNTc3LDE0ODYgTDE1ODAsMTQ4NiBMMTU4MSwxNDg1IEwxNjA5LDE0ODUgTDE2MTEsMTQ4MyBMMTYxNCwxNDgzIEwxNjE1LDE0ODIgTDE2MTksMTQ4MiBMMTYyMSwxNDgwIEwxNjIxLDE0NzggTDE2MTgsMTQ3NSBMMTYxOCwxNDc0IEwxNjEwLDE0NjYgTDE2MTAsMTQ2NSBMMTYwOSwxNDY1IEwxNjA3LDE0NjMgTDE2MDcsMTQ2MiBMMTYwNiwxNDYyIEwxNjAxLDE0NTcgTDE2MDEsMTQ1NiBMMTYwMCwxNDU2IEwxNTkyLDE0NDggTDE1OTEsMTQ0OCBMMTU5MCwxNDQ3IEwxNTg2LDE0NDcgTDE1ODQsMTQ0NSBMMTU1OSwxNDQ1IEwxNTU3LDE0NDcgTDE1MjQsMTQ0NyBMMTUyMywxNDQ4IEwxNTIyLDE0NDggTDE1MjIsMTQ0OSBMMTUyMSwxNDUwIEwxNDk1LDE0NTAgTDE0OTIsMTQ1MyBMMTQ3OCwxNDUzIEwxNDc1LDE0NTYgTDE0NzQsMTQ1NiBMMTQ2NywxNDQ5IEwxNDY3LDE0NDYgTDE0NjYsMTQ0NSBMMTQ2NSwxNDQ1IEwxNDY0LDE0NDQgTDE0NjQsMTQ0MyBMMTQ2MCwxNDM5IEwxNDYxLDE0MzggTDE0NzQsMTQzOCBMMTQ3NSwxNDM3IEwxNDc1LDE0MzYgTDE0NzYsMTQzNSBMMTQ4MiwxNDM1IEwxNDg1LDE0MzIgTDE1MTMsMTQzMiBMMTUxNSwxNDMwIEwxNTM5LDE0MzAgTDE1NDAsMTQyOSBMMTU0NCwxNDI5IEwxNTQ3LDE0MjYgTDE1NjYsMTQyNiBMMTU2NywxNDI1IEwxNTY3LDE0MTggTDE1NjUsMTQxNiBMMTU2NSwxNDE1IEwxNTY0LDE0MTUgTDE1NjIsMTQxMyBMMTU2MiwxNDEyIEwxNTU1LDE0MDUgTDE1NTQsMTQwNSBMMTU1MywxNDA0IEwxNTUzLDE0MDMgTDE1NTAsMTQwMCBMMTU0OSwxNDAwIEwxNTQ4LDEzOTkgTDE1NDgsMTM5OCBMMTUzMywxMzgzIEwxNTMyLDEzODMgTDE1MzEsMTM4MiBMMTUzMSwxMzgxIEwxNTI4LDEzNzggTDE1MjcsMTM3OCBMMTUyNiwxMzc3IEwxNTI2LDEzNzYgTDE1MjQsMTM3NCBMMTUyMSwxMzc0IEwxNTE2LDEzNjkgTDE1MDAsMTM2OSBMMTQ5NywxMzcyIEwxNDk0LDEzNzIgTDE0OTIsMTM3NCBMMTQ2NCwxMzc0IEwxNDYzLDEzNzUgTDE0NjMsMTM3NiBMMTQ2MiwxMzc3IEwxNDM3LDEzNzcgTDE0MzYsMTM3OCBMMTQzNSwxMzc4IEwxNDMzLDEzODAgTDE0MDcsMTM4MCBMMTQwNiwxMzgxIEwxNDA2LDEzODIgTDE0MDUsMTM4MyBMMTQwMCwxMzgzIEwxMzk5LDEzODIgTDEzOTksMTM4MSBMMTM5NiwxMzc4IEwxMzk1LDEzNzggTDEzOTQsMTM3NyBMMTM5MiwxMzc3IEwxMzkxLDEzNzYgTDEzOTEsMTM3NCBMMTM5MCwxMzczIEwxMzkwLDEzNzIgTDEzODcsMTM2OSBMMTM4NiwxMzY5IEwxMzg1LDEzNjggTDEzODUsMTM2NyBMMTM4NCwxMzY2IEwxMzgzLDEzNjYgTDEzODIsMTM2NSBMMTM4MiwxMzY0IEwxMzgxLDEzNjQgTDEzODAsMTM2MyBMMTM3NywxMzYzIEwxMzc2LDEzNjIgTDEzNzYsMTM1OCBMMTM3NSwxMzU4IEwxMzc0LDEzNTcgTDEzNzQsMTM1NiBMMTM3MywxMzU1IEwxMzcyLDEzNTUgTDEzNzEsMTM1NCBMMTM3MSwxMzUzIEwxMzcwLDEzNTIgTDEzNjksMTM1MiBMMTM2OCwxMzUxIEwxMzY4LDEzNTAgTDEzNjcsMTM0OSBMMTM2NCwxMzQ5IEwxMzYzLDEzNDggTDEzNjMsMTM0NSBMMTM2MSwxMzQzIEwxMzYwLDEzNDMgTDEzNTksMTM0MiBMMTM1OSwxMzQxIEwxMzU4LDEzNDEgTDEzNTcsMTM0MCBMMTM1NywxMzM5IEwxMzU2LDEzMzggTDEzNTMsMTMzOCBMMTM0OSwxMzM0IEwxMzQ5LDEzMzEgTDEzNDYsMTMyOCBMMTM0NiwxMzI2IEwxMzQ1LDEzMjUgTDEzNDUsMTMyNCBMMTM0NCwxMzI0IEwxMzQzLDEzMjMgTDEzNDMsMTMyMiBMMTM0MiwxMzIxIEwxMzM5LDEzMjEgTDEzMzcsMTMxOSBMMTMzNywxMzE2IEwxMzM2LDEzMTUgTDEzMzUsMTMxNSBMMTMzNCwxMzE0IEwxMzM0LDEzMTMgTDEzMzMsMTMxMyBMMTMzMSwxMzExIEwxMzMxLDEzMTAgTDEzMzAsMTMxMCBMMTMyOSwxMzA5IEwxMzI5LDEzMDggTDEzMjgsMTMwNyBMMTMyNSwxMzA3IEwxMzIzLDEzMDUgTDEzMjMsMTMwMiBMMTMyMiwxMzAxIEwxMzIxLDEzMDEgTDEzMjAsMTMwMCBMMTMyMCwxMjk5IEwxMzE5LDEyOTkgTDEzMTcsMTI5NyBMMTMxNywxMjk2IEwxMzE2LDEyOTYgTDEzMTQsMTI5NCBMMTMxNCwxMjkzIEwxMzExLDEyOTMgTDEzMDksMTI5MSBMMTMwOSwxMjg4IEwxMzA4LDEyODggTDEzMDYsMTI4NiBMMTMwNiwxMjg1IEwxMzA1LDEyODUgTDEzMDMsMTI4MyBMMTMwMywxMjgyIEwxMjk5LDEyODIgTDEyOTgsMTI4MSBMMTI5OCwxMjgwIEwxMjk3LDEyNzkgTDEyOTYsMTI3OSBMMTI5NSwxMjc4IEwxMjk1LDEyNzQgTDEyOTQsMTI3NCBMMTI5MiwxMjcyIEwxMjkyLDEyNzEgTDEyOTEsMTI3MCBMMTI5MCwxMjcwIEwxMjg5LDEyNjkgTDEyODksMTI2OCBMMTI4NiwxMjY4IEwxMjgzLDEyNjUgTDEyODIsMTI2NSBMMTI4MSwxMjY0IEwxMjgxLDEyNjAgTDEyODAsMTI2MCBMMTI3OCwxMjU4IEwxMjc4LDEyNTcgTDEyNzcsMTI1NiBMMTI3NiwxMjU2IEwxMjc1LDEyNTUgTDEyNzUsMTI1NCBMMTI3NCwxMjU0IEwxMjczLDEyNTMgTDEyNzEsMTI1MyBMMTI2OSwxMjUxIEwxMjY4LDEyNTEgTDEyNjcsMTI1MCBMMTI2NywxMjQ2IEwxMjY2LDEyNDYgTDEyNjMsMTI0MyBMMTI2MywxMjQyIEwxMjYyLDEyNDIgTDEyNjEsMTI0MSBMMTI2MSwxMjQwIEwxMjYwLDEyNDAgTDEyNTksMTIzOSBMMTI1NywxMjM5IEwxMjU2LDEyMzggTDEyNTYsMTIzNiBMMTI1NSwxMjM1IEwxMjU1LDEyMzQgTDEyNTQsMTIzNCBMMTI1MywxMjMzIEwxMjUzLDEyMzIgTDEyNTIsMTIzMSBMMTI1MSwxMjMxIEwxMjUwLDEyMzAgTDEyNTAsMTIyOSBMMTI0OSwxMjI4IEwxMjQ4LDEyMjggTDEyNDcsMTIyNyBMMTI0NywxMjI2IEwxMjQ2LDEyMjYgTDEyNDUsMTIyNSBMMTI0MywxMjI1IEwxMjQyLDEyMjQgTDEyNDIsMTIyMiBMMTI0MSwxMjIxIEwxMjQxLDEyMjAgTDEyNDAsMTIyMCBMMTIzOSwxMjE5IEwxMjM5LDEyMTggTDEyMzgsMTIxNyBMMTIzNywxMjE3IEwxMjM2LDEyMTYgTDEyMzYsMTIxNSBMMTIzNSwxMjE1IEwxMjMzLDEyMTMgTDEyMzMsMTIxMiBMMTIzMiwxMjExIEwxMjI5LDEyMTEgTDEyMjcsMTIwOSBMMTIyNywxMjA2IEwxMjI2LDEyMDYgTDEyMjQsMTIwNCBMMTIyNCwxMjAzIEwxMjIzLDEyMDMgTDEyMjIsMTIwMiBMMTIyMiwxMjAxIEwxMjIxLDEyMDEgTDEyMjAsMTIwMCBMMTIxOCwxMjAwIEwxMjE1LDExOTcgTDEyMTQsMTE5NyBMMTIxMywxMTk2IEwxMjEzLDExOTIgTDEyMTIsMTE5MiBMMTIxMCwxMTkwIEwxMjEwLDExODkgTDEyMDksMTE4OSBMMTIwOCwxMTg4IEwxMjA4LDExODcgTDEyMDcsMTE4NiBMMTIwNCwxMTg2IEwxMTk5LDExODEgTDExOTksMTE3OCBMMTE5OCwxMTc4IEwxMTk2LDExNzYgTDExOTYsMTE3NSBMMTE5NSwxMTc1IEwxMTk0LDExNzQgTDExOTQsMTE3MyBMMTE5MywxMTcyIEwxMTkwLDExNzIgTDExODgsMTE3MCBMMTE4OCwxMTY3IEwxMTg3LDExNjYgTDExODYsMTE2NiBMMTE4NSwxMTY1IEwxMTg1LDExNjQgTDExODQsMTE2NCBMMTE4MiwxMTYyIEwxMTgyLDExNjEgTDExODEsMTE2MSBMMTE4MCwxMTYwIEwxMTgwLDExNTkgTDExNzksMTE1OCBMMTE3OCwxMTU4IEwxMTc3LDExNTcgTDExNzcsMTE1NiBMMTE3NiwxMTU2IEwxMTc0LDExNTQgTDExNzQsMTE1MyBMMTE3MywxMTUyIEwxMTcyLDExNTIgTDExNzEsMTE1MSBMMTE3MSwxMTUwIEwxMTcwLDExNTAgTDExNjgsMTE0OCBMMTE2OCwxMTQ3IEwxMTY3LDExNDcgTDExNjUsMTE0NSBMMTE2NSwxMTQ0IEwxMTY0LDExNDQgTDExNjMsMTE0MyBMMTE2MywxMTQyIEwxMTYyLDExNDEgTDExNjEsMTE0MSBMMTE1OSwxMTM5IEwxMTU5LDExMzggTDExNTgsMTEzOCBMMTE1NywxMTM3IEwxMTU3LDExMzYgTDExNTYsMTEzNiBMMTE1NCwxMTM0IEwxMTU0LDExMzMgTDExNTMsMTEzMyBMMTE1MSwxMTMxIEwxMTUxLDExMzAgTDExNTAsMTEzMCBMMTE0OSwxMTI5IEwxMTQ5LDExMjggTDExNDgsMTEyNyBMMTE0NywxMTI3IEwxMTQ1LDExMjUgTDExNDUsMTEyNCBMMTE0NCwxMTI0IEwxMTQzLDExMjMgTDExNDMsMTEyMiBMMTE0MiwxMTIxIEwxMTQxLDExMjEgTDExNDAsMTEyMCBMMTE0MCwxMTE5IEwxMTM5LDExMTkgTDExMzcsMTExNyBMMTEzNywxMTE2IEwxMTM2LDExMTYgTDExMzUsMTExNSBMMTEzNSwxMTE0IEwxMTM0LDExMTMgTDExMzMsMTExMyBMMTEzMSwxMTExIEwxMTMxLDExMTAgTDExMzAsMTExMCBMMTEyOSwxMTA5IEwxMTI5LDExMDggTDExMjgsMTEwNyBMMTEyNywxMTA3IEwxMTI2LDExMDYgTDExMjYsMTEwNSBMMTEyNSwxMTA1IEwxMTIzLDExMDMgTDExMjMsMTEwMiBMMTEyMiwxMTAyIEwxMTIxLDExMDEgTDExMjEsMTEwMCBMMTEyMCwxMDk5IEwxMTE5LDEwOTkgTDExMTgsMTA5OCBMMTExOCwxMDk3IEwxMTE3LDEwOTcgTDExMTUsMTA5NSBMMTExNSwxMDk0IEwxMTE0LDEwOTMgTDExMTMsMTA5MyBMMTExMiwxMDkyIEwxMTEyLDEwOTEgTDExMTEsMTA5MSBMMTEwOSwxMDg5IEwxMTA5LDEwODggTDExMDgsMTA4OCBMMTEwNywxMDg3IEwxMTA3LDEwODQgTDEwOTcsMTA3NCBMMTA5NiwxMDc0IEwxMDk1LDEwNzMgTDEwOTUsMTA3MSBMMTA5NCwxMDcxIEwxMDg2LDEwNjMgTDEwODYsMTA2MiBMMTA4NSwxMDYyIEwxMDgxLDEwNTggTDEwODEsMTA1NyBMMTA4MCwxMDU3IEwxMDcyLDEwNDkgTDEwNzIsMTA0OCBMMTA2OSwxMDQ4IEwxMDY3LDEwNDYgTDEwNjcsMTA0MyBMMTA2NiwxMDQzIEwxMDU4LDEwMzUgTDEwNTgsMTAzNCBMMTA1NCwxMDM0IEwxMDUzLDEwMzMgTDEwNTMsMTAzMiBMMTA1MiwxMDMxIEwxMDUxLDEwMzEgTDEwNTAsMTAzMCBMMTA1MCwxMDI5IEwxMDQ5LDEwMjkgTDEwNDgsMTAyOCBMMTA0OCwxMDI2IEwxMDQ3LDEwMjUgTDEwNDcsMTAyNCBMMTA0NiwxMDIzIEwxMDQzLDEwMjMgTDEwNDEsMTAyMSBMMTA0MSwxMDIwIEwxMDQwLDEwMjAgTDEwMzksMTAxOSBMMTAzOSwxMDE4IEwxMDM4LDEwMTcgTDEwMzcsMTAxNyBMMTAzNiwxMDE2IEwxMDM2LDEwMTUgTDEwMzUsMTAxNSBMMTAzMywxMDEzIEwxMDMzLDEwMTIgTDEwMzIsMTAxMiBMMTAzMSwxMDExIEwxMDMxLDEwMTAgTDEwMzAsMTAwOSBMMTAyOSwxMDA5IEwxMDI4LDEwMDggTDEwMjgsMTAwNyBMMTAyNywxMDA2IEwxMDI2LDEwMDYgTDEwMjUsMTAwNSBMMTAyNSwxMDA0IEwxMDIyLDEwMDEgTDEwMjIsOTk4IEwxMDIxLDk5OCBMMTAxMyw5OTAgTDEwMTMsOTg5IEwxMDEyLDk4OSBMMTAwOCw5ODUgTDEwMDgsOTg0IEwxMDA2LDk4NCBMMTAwNSw5ODMgTDEwMDUsOTgyIEwxMDAxLDk3OCBMOTk4LDk3OCBMOTk3LDk3NyBMOTk3LDk3NCBMOTk0LDk3MSBMOTk0LDk3MCBMOTkzLDk3MCBMOTkxLDk2OCBMOTkxLDk2NyBMOTkwLDk2NyBMOTg1LDk2MiBMOTg1LDk2MSBMOTg0LDk2MSBMOTc3LDk1NCBMOTc3LDk1MyBMOTc2LDk1MyBMOTY4LDk0NSBMOTY4LDk0NCBMOTY3LDk0NCBMOTYzLDk0MCBMOTYzLDkzOSBMOTYyLDkzOCBMOTYxLDkzOCBMOTYwLDkzNyBMOTYwLDkzMCBMOTYyLDkyOCBMOTYzLDkyOCBMOTYzLDkyNCBMOTY0LDkyMyBMOTY1LDkyMyBMOTY2LDkyMiBMOTY2LDkxOSBMOTY4LDkxNyBMOTY4LDkxNiBMOTcwLDkxNCBMOTcxLDkxNCBMOTcxLDkxMyBMOTcyLDkxMiBMOTcyLDkxMCBMOTg3LDg5NSBMMTEyNCw4OTUgTDExMjUsODk0IEwxMTI2LDg5NCBMMTEyNiw4OTMgTDExMjgsODkxIEwxMTI5LDg5MSBMMTEyOSw4OTAgTDExMzAsODg5IEwxMTMzLDg4OSBMMTEzNSw4ODcgTDExMzUsODg1IEwxMTM3LDg4MyBMMTE0MCw4ODMgTDExNDAsODgyIEwxMTQyLDg4MCBMMTE0Myw4ODAgTDExNDMsODc2IEwxMTQ0LDg3NSBMMTE0NSw4NzUgTDExNDUsODc0IEwxMTQ3LDg3MiBMMTE0OCw4NzIgTDExNDksODcxIEwxMTQ5LDg3MCBMMTE1MCw4NjkgTDExNTEsODY5IEwxMTU0LDg2NiBMMTE1NCw4NjUgTDExNTUsODY0IEwxMTU2LDg2NCBMMTE1Nyw4NjMgTDExNTcsODYwIEwxMTYwLDg1NyBMMTE2MCw4NTYgTDExNjEsODU1IEwxMTYyLDg1NSBMMTE2OCw4NDkgTDExNjgsODQ4IEwxMTcwLDg0NiBMMTE3MSw4NDYgTDExNzEsODQ0IEwxMTcyLDg0MyBMMTE3Miw4NDIgTDExOTYsODE4IEwxMTk2LDgxNyBMMTE5Nyw4MTYgTDExOTcsODE0IEwxMTk4LDgxMyBMMTE5OSw4MTMgTDExOTksODEyIEwxMjA3LDgwNCBMMTIwOCw4MDQgTDEyMDgsODAzIEwxMjEzLDc5OCBMMTIxMyw3OTUgTDEyMTUsNzkzIEwxMjE2LDc5MyBMMTIxNiw3OTIgTDEyMTcsNzkxIEwxMjE4LDc5MSBMMTIxOCw3OTAgTDEyMjEsNzg3IEwxMjIyLDc4NyBMMTIyMiw3ODYgTDEyMjMsNzg1IEwxMjI0LDc4NSBMMTIyNCw3ODQgTDEyMjYsNzgyIEwxMjI3LDc4MiBMMTIyNyw3NzkgTDEyMzMsNzczIEwxMjMzLDc3MiBMMTIzNCw3NzEgTDEyMzUsNzcxIEwxMjM2LDc3MCBMMTIzNiw3NjkgTDEyMzcsNzY4IEwxMjM4LDc2OCBMMTIzOSw3NjcgTDEyMzksNzY2IEwxMjQyLDc2MyBMMTI0Myw3NjMgTDEyNDQsNzYyIEwxMjQ0LDc2MSBMMTI0NSw3NjAgTDEyNDYsNzYwIEwxMjQ3LDc1OSBMMTI0Nyw3NTggTDEyNTAsNzU1IEwxMjUwLDc1MiBMMTI1MSw3NTEgTDEyNTIsNzUxIEwxMjU4LDc0NSBMMTI1OCw3NDQgTDEyNjAsNzQyIEwxMjYxLDc0MiBMMTI2Myw3NDAgTDEyNjMsNzM5IEwxMjY1LDczNyBMMTI2Niw3MzcgTDEyNjcsNzM2IEwxMjY3LDczMyBMMTI3MCw3MzAgTDEyNzAsNzI5IEwxMjcxLDcyOCBMMTI3Miw3MjggTDEyNzIsNzE4IEwxMjY4LDcxNCBMMTI2Niw3MTQgTDEyNjUsNzEzIFoiIGZpbGw9InVybCgjZ3JhZGllbnQpIiBzdHJva2U9Im5vbmUiIC8+PHBhdGggZD0iTTExODEsMzUzIEwxMTgwLDM1NCBMMzQ1LDM1NCBMMzQ0LDM1NSBMMzQ0LDM1NyBMMzQzLDM1OCBMMzQzLDE1MDUgTDM0NCwxNTA2IEwzNDQsMTUwNyBMMzQ1LDE1MDggTDUyNywxNTA4IEw1MjgsMTUwNyBMNTI5LDE1MDcgTDUyOSwxNTAzIEw1MzAsMTUwMiBMNTMwLDU0OCBMNTMyLDU0NiBMMTI0NSw1NDYgTDEyNDgsNTQ5IEwxMjY0LDU0OSBMMTI2Niw1NTEgTDEyNjcsNTUxIEwxMjY4LDU1MiBMMTI3OSw1NTIgTDEyODAsNTUzIEwxMjgwLDU1NCBMMTI4MSw1NTQgTDEyODIsNTU1IEwxMjkwLDU1NSBMMTI5Miw1NTcgTDEyOTgsNTU3IEwxMzAxLDU2MCBMMTMwOSw1NjAgTDEzMTIsNTYzIEwxMzEzLDU2MyBMMTMxNCw1NjQgTDEzMTQsNTY1IEwxMzE3LDU2NSBMMTMxOCw1NjYgTDEzMjEsNTY2IEwxMzI0LDU2OSBMMTMyNyw1NjkgTDEzMjgsNTcwIEwxMzI4LDU3MSBMMTMzNCw1NzEgTDEzNDAsNTc3IEwxMzQzLDU3NyBMMTM0Niw1ODAgTDEzNDksNTgwIEwxMzU0LDU4NSBMMTM1NSw1ODUgTDEzNTYsNTg2IEwxMzU4LDU4NiBMMTM2MCw1ODggTDEzNjMsNTg4IEwxMzY0LDU4OSBMMTM2NCw1OTIgTDEzNjYsNTk0IEwxMzY4LDU5NCBMMTM3MSw1OTcgTDEzNzQsNTk3IEwxMzc5LDYwMiBMMTM4MCw2MDIgTDEzODEsNjAzIEwxMzgxLDYwNCBMMTM4NSw2MDggTDEzODYsNjA4IEwxMzg3LDYwOSBMMTM4Nyw2MTAgTDEzOTMsNjE2IEwxMzk0LDYxNiBMMTM5NSw2MTcgTDEzOTUsNjE4IEwxNDAzLDYyNiBMMTQwMyw2MjggTDE0MDYsNjMxIEwxNDA2LDYzMiBMMTQwNyw2MzMgTDE0MDgsNjMzIEwxNDA5LDYzNCBMMTQwOSw2MzcgTDE0MTEsNjM5IEwxNDEzLDYzOSBMMTQxNCw2NDAgTDE0MTQsNjQyIEwxNDE1LDY0MyBMMTQxNSw2NDQgTDE0MTYsNjQ0IEwxNDE3LDY0NSBMMTQxNyw2NDcgTDE0MTgsNjQ4IEwxNDE4LDY0OSBMMTQyMCw2NTEgTDE0MjAsNjU0IEwxNDIzLDY1NyBMMTQyMyw2NjAgTDE0MjQsNjYxIEwxNDI1LDY2MSBMMTQyNiw2NjIgTDE0MjYsNjYzIEwxNDI4LDY2NSBMMTQyOCw2NjcgTDE0MjksNjY4IEwxNDI5LDY2OSBMMTQzMCw2NjkgTDE0MzIsNjcxIEwxNDMyLDY3NCBMMTQzNCw2NzYgTDE0MzQsNjc5IEwxNDM1LDY4MCBMMTQzNSw2ODEgTDE0MzYsNjgxIEwxNDM3LDY4MiBMMTQzNyw2ODggTDE0NDIsNjkzIEwxNDQyLDY5OSBMMTQ0Myw3MDAgTDE0NDMsNzAzIEwxNDQ0LDcwMyBMMTQ0Niw3MDUgTDE0NDYsNzE0IEwxNDQ4LDcxNiBMMTQ0OCw3MjcgTDE0NTEsNzMwIEwxNDUxLDc0MiBMMTQ1Miw3NDIgTDE0NTMsNzQzIEwxNDUzLDc0NCBMMTQ1MSw3NDYgTDE0NTEsNzUzIEwxNDUyLDc1NCBMMTQ1Myw3NTQgTDE0NTQsNzU1IEwxNDU0LDc4MyBMMTQ1Myw3ODQgTDE0NTIsNzg0IEwxNDUxLDc4NSBMMTQ1MSw4MDggTDE0NDgsODExIEwxNDQ4LDgyMiBMMTQ0Niw4MjQgTDE0NDYsODM2IEwxNDQ1LDgzNyBMMTQ0NCw4MzcgTDE0NDMsODM4IEwxNDQzLDg0MCBMMTQ0Miw4NDEgTDE0NDIsODQ1IEwxNDQwLDg0NyBMMTQ0MCw4NTAgTDE0MzcsODUzIEwxNDM3LDg1OSBMMTQzNiw4NjAgTDE0MzUsODYwIEwxNDM0LDg2MSBMMTQzNCw4NjQgTDE0MzIsODY2IEwxNDMyLDg3MiBMMTQyNiw4NzggTDE0MjYsODgxIEwxNDIzLDg4NCBMMTQyMyw4ODcgTDE0MjIsODg4IEwxNDIxLDg4OCBMMTQyMCw4ODkgTDE0MjAsODkyIEwxNDE4LDg5NCBMMTQxOCw4OTUgTDE0MTcsODk2IEwxNDE3LDg5OCBMMTQwOSw5MDYgTDE0MDksOTA5IEwxMzk4LDkyMCBMMTM5OCw5MjIgTDEzOTcsOTIzIEwxMzk3LDkyNCBMMTM5NCw5MjcgTDEzOTMsOTI3IEwxMzkyLDkyOCBMMTM5Miw5MjkgTDEzOTEsOTMwIEwxMzkwLDkzMCBMMTM5MCw5MzEgTDEzODUsOTM2IEwxMzg0LDkzNiBMMTM4NCw5MzcgTDEzODIsOTM5IEwxMzgxLDkzOSBMMTM4MSw5NDAgTDEzNzcsOTQ0IEwxMzc2LDk0NCBMMTM3NSw5NDUgTDEzNzUsOTQ2IEwxMzcxLDk1MCBMMTM3MCw5NTAgTDEzNzAsOTUxIEwxMzY4LDk1MyBMMTM2Nyw5NTMgTDEzNjcsOTU0IEwxMzY1LDk1NiBMMTM2NCw5NTYgTDEzNjQsOTU3IEwxMzYzLDk1OCBMMTM2MCw5NTggTDEzNTksOTU5IEwxMzU5LDk2MCBMMTM1OCw5NjEgTDEzNTcsOTYxIEwxMzQ5LDk2OSBMMTM0OCw5NjkgTDEzNDcsOTcwIEwxMzQ1LDk3MCBMMTMzNyw5NzggTDEzMzQsOTc4IEwxMzMyLDk4MCBMMTMzMCw5ODAgTDEzMjksOTgxIEwxMzI4LDk4MSBMMTMyOCw5ODIgTDEzMjYsOTg0IEwxMzIyLDk4NCBMMTMyMiw5ODUgTDEzMjEsOTg2IEwxMzE4LDk4NiBMMTMxMiw5OTIgTDEzMDksOTkyIEwxMzA3LDk5NCBMMTMwNiw5OTQgTDEzMDUsOTk1IEwxMzAzLDk5NSBMMTMwMSw5OTcgTDEyOTgsOTk3IEwxMjk1LDEwMDAgTDEyOTAsMTAwMCBMMTI4NywxMDAzIEwxMjg0LDEwMDMgTDEyODMsMTAwNCBMMTI4MywxMDA1IEwxMjgyLDEwMDYgTDEyNzgsMTAwNiBMMTI3NSwxMDA5IEwxMjcwLDEwMDkgTDEyNjgsMTAxMSBMMTI2NCwxMDExIEwxMjYzLDEwMTIgTDEyNjEsMTAxMiBMMTI2MCwxMDEzIEwxMjYwLDEwMTQgTDEyNTksMTAxNSBMMTI1NiwxMDE1IEwxMjUyLDEwMTkgTDEyNTUsMTAyMiBMMTI1NSwxMDIzIEwxMjYwLDEwMjggTDEyNjAsMTAyOSBMMTI2MSwxMDI5IEwxMjY2LDEwMzQgTDEyNjYsMTAzNSBMMTI2NywxMDM1IEwxMjY5LDEwMzcgTDEyNjksMTAzOCBMMTI3MCwxMDM4IEwxMjcxLDEwMzkgTDEyNzEsMTA0MCBMMTI3MiwxMDQxIEwxMjczLDEwNDEgTDEyNzQsMTA0MiBMMTI3NCwxMDQzIEwxMjc1LDEwNDQgTDEyNzYsMTA0NCBMMTI3NywxMDQ1IEwxMjc3LDEwNDYgTDEyNzgsMTA0NiBMMTI4MCwxMDQ4IEwxMjgwLDEwNDkgTDEyODEsMTA1MCBMMTI4MiwxMDUwIEwxMjgzLDEwNTEgTDEyODMsMTA1NCBMMTI4OCwxMDU5IEwxMjg4LDEwNjAgTDEyODksMTA2MCBMMTI5NCwxMDY1IEwxMjk0LDEwNjYgTDEyOTUsMTA2NiBMMTMwMCwxMDcxIEwxMzAwLDEwNzIgTDEzMDEsMTA3MiBMMTMwMiwxMDczIEwxMzAyLDEwNzQgTDEzMDMsMTA3NCBMMTMwNSwxMDc2IEwxMzA1LDEwNzcgTDEzMDYsMTA3NyBMMTMwOCwxMDc5IEwxMzA4LDEwODAgTDEzMDksMTA4MCBMMTMxMSwxMDgyIEwxMzExLDEwODMgTDEzMTIsMTA4MyBMMTMxNCwxMDg1IEwxMzE0LDEwODYgTDEzMTUsMTA4NiBMMTMxNiwxMDg3IEwxMzE2LDEwODggTDEzMTcsMTA4OSBMMTMxOCwxMDg5IEwxMzE5LDEwOTAgTDEzMTksMTA5MSBMMTMyMCwxMDkxIEwxMzIyLDEwOTMgTDEzMjIsMTA5NCBMMTMyMywxMDk0IEwxMzI1LDEwOTYgTDEzMjUsMTA5NyBMMTMyNiwxMDk3IEwxMzI4LDEwOTkgTDEzMjgsMTEwMCBMMTMyOSwxMTAwIEwxMzMxLDExMDIgTDEzMzEsMTEwMyBMMTMzMiwxMTAzIEwxMzMzLDExMDQgTDEzMzMsMTEwNSBMMTMzNCwxMTA1IEwxMzM2LDExMDcgTDEzMzYsMTEwOCBMMTMzNywxMTA4IEwxMzM5LDExMTAgTDEzMzksMTExMSBMMTM0MCwxMTExIEwxMzQyLDExMTMgTDEzNDIsMTExNCBMMTM0MywxMTE0IEwxMzQ1LDExMTYgTDEzNDUsMTExNyBMMTM0NiwxMTE3IEwxMzQ3LDExMTggTDEzNDcsMTExOSBMMTM0OCwxMTE5IEwxMzUzLDExMjQgTDEzNTMsMTEyNSBMMTM1NCwxMTI1IEwxMzU2LDExMjcgTDEzNTYsMTEyOCBMMTM1NywxMTI4IEwxMzU5LDExMzAgTDEzNTksMTEzMSBMMTM2MCwxMTMxIEwxMzYxLDExMzIgTDEzNjEsMTEzMyBMMTM2MiwxMTMzIEwxMzY0LDExMzUgTDEzNjQsMTEzNiBMMTM2NSwxMTM2IEwxMzY3LDExMzggTDEzNjcsMTEzOSBMMTM2OCwxMTM5IEwxMzc3LDExNDggTDEzODYsMTE0OCBMMTM4OSwxMTQ1IEwxMzk1LDExNDUgTDEzOTgsMTE0MiBMMTQwMSwxMTQyIEwxNDAzLDExNDAgTDE0MDYsMTE0MCBMMTQwOCwxMTM4IEwxNDA4LDExMzcgTDE0MDksMTEzNiBMMTQxMCwxMTM2IEwxNDEyLDExMzQgTDE0MTcsMTEzNCBMMTQyMCwxMTMxIEwxNDIzLDExMzEgTDE0MjYsMTEyOCBMMTQyOSwxMTI4IEwxNDM3LDExMjAgTDE0NDAsMTEyMCBMMTQ0NCwxMTE2IEwxNDQ0LDExMTUgTDE0NDUsMTExNCBMMTQ0OSwxMTE0IEwxNDQ5LDExMTMgTDE0NTAsMTExMiBMMTQ1MiwxMTEyIEwxNDUzLDExMTEgTDE0NTQsMTExMSBMMTQ1NSwxMTEwIEwxNDU1LDExMDggTDE0NTcsMTEwNiBMMTQ1OSwxMTA2IEwxNDYwLDExMDUgTDE0NjEsMTEwNSBMMTQ2MSwxMTA0IEwxNDYyLDExMDMgTDE0NjUsMTEwMyBMMTQ3NCwxMDk0IEwxNDc1LDEwOTQgTDE0NzUsMTA5MyBMMTQ3NiwxMDkyIEwxNDc4LDEwOTIgTDE0NzksMTA5MSBMMTQ4MCwxMDkxIEwxNDk2LDEwNzUgTDE0OTksMTA3NSBMMTUwMCwxMDc0IEwxNTAwLDEwNzMgTDE1MDEsMTA3MiBMMTUwMiwxMDcyIEwxNTAzLDEwNzEgTDE1MDMsMTA3MCBMMTUwNCwxMDY5IEwxNTA1LDEwNjkgTDE1MDgsMTA2NiBMMTUwOCwxMDY1IEwxNTEwLDEwNjMgTDE1MTEsMTA2MyBMMTUxNywxMDU3IEwxNTE3LDEwNTYgTDE1MTgsMTA1NSBMMTUxOSwxMDU1IEwxNTI2LDEwNDggTDE1MjYsMTA0NyBMMTUyNywxMDQ2IEwxNTI4LDEwNDYgTDE1MjgsMTA0NSBMMTUyOSwxMDQ0IEwxNTI5LDEwNDIgTDE1NDgsMTAyMyBMMTU0OCwxMDIwIEwxNTU0LDEwMTQgTDE1NTQsMTAxMSBMMTU1NiwxMDA5IEwxNTU3LDEwMDkgTDE1NTcsMTAwNiBMMTU1OSwxMDA0IEwxNTU5LDEwMDMgTDE1NjEsMTAwMSBMMTU2MiwxMDAxIEwxNTYyLDEwMDAgTDE1NjMsOTk5IEwxNTY0LDk5OSBMMTU2NSw5OTggTDE1NjUsOTk1IEwxNTcxLDk4OSBMMTU3MSw5ODYgTDE1NzYsOTgxIEwxNTc2LDk4MCBMMTU3Nyw5NzkgTDE1NzgsOTc5IEwxNTc5LDk3OCBMMTU3OSw5NzIgTDE1ODIsOTY5IEwxNTgyLDk2NCBMMTU4NSw5NjEgTDE1ODUsOTYwIEwxNTg2LDk1OSBMMTU4Nyw5NTkgTDE1ODgsOTU4IEwxNTg4LDk1NSBMMTU5MCw5NTMgTDE1OTAsOTUwIEwxNTkzLDk0NyBMMTU5Myw5NDQgTDE1OTYsOTQxIEwxNTk2LDkzNiBMMTU5OCw5MzQgTDE1OTgsOTMzIEwxNjAwLDkzMSBMMTYwMSw5MzEgTDE2MDIsOTMwIEwxNjAyLDkyNyBMMTYwNCw5MjUgTDE2MDQsOTIyIEwxNjA1LDkyMSBMMTYwNSw5MTggTDE2MDYsOTE3IEwxNjA3LDkxNyBMMTYwNyw5MTMgTDE2MTAsOTEwIEwxNjEwLDkwMiBMMTYxMyw4OTkgTDE2MTMsODk4IEwxNjE0LDg5NyBMMTYxNSw4OTcgTDE2MTYsODk2IEwxNjE2LDg5MCBMMTYxOSw4ODcgTDE2MTksODc5IEwxNjIxLDg3NyBMMTYyMSw4NjggTDE2MjMsODY2IEwxNjI0LDg2NiBMMTYyNCw4NjAgTDE2MjcsODU3IEwxNjI3LDg1NCBMMTYzMCw4NTEgTDE2MzAsODM5IEwxNjMxLDgzOCBMMTYzMiw4MzggTDE2MzIsODM3IEwxNjMzLDgzNiBMMTYzMyw4MTQgTDE2MzUsODEyIEwxNjM1LDc5MiBMMTYzNyw3OTAgTDE2MzgsNzkwIEwxNjM4LDc4OCBMMTYzNSw3ODUgTDE2MzUsNzEzIEwxNjM3LDcxMSBMMTYzOCw3MTEgTDE2MzgsNzA5IEwxNjM1LDcwNiBMMTYzNSw2ODkgTDE2MzMsNjg3IEwxNjMzLDY3MyBMMTYzMCw2NzAgTDE2MzAsNjU5IEwxNjI0LDY1MyBMMTYyNCw2NDcgTDE2MjEsNjQ0IEwxNjIxLDYzMyBMMTYxOSw2MzEgTDE2MTksNjI2IEwxNjE4LDYyNSBMMTYxOCw2MjQgTDE2MTYsNjIyIEwxNjE2LDYxNyBMMTYxMyw2MTQgTDE2MTMsNjExIEwxNjEwLDYwOCBMMTYxMCw2MDIgTDE2MDksNjAxIEwxNjA4LDYwMSBMMTYwNyw2MDAgTDE2MDcsNTkzIEwxNjA2LDU5MyBMMTYwNSw1OTIgTDE2MDUsNTkxIEwxNjA0LDU5MCBMMTYwNCw1ODggTDE2MDIsNTg2IEwxNjAyLDU4MyBMMTU5OSw1ODAgTDE1OTksNTc4IEwxNTk4LDU3NyBMMTU5OCw1NzYgTDE1OTcsNTc2IEwxNTk2LDU3NSBMMTU5Niw1NzQgTDE1OTMsNTcxIEwxNTkzLDU2OCBMMTU5Miw1NjcgTDE1OTEsNTY3IEwxNTkwLDU2NiBMMTU5MCw1NjAgTDE1ODgsNTU4IEwxNTg4LDU1NSBMMTU4Miw1NDkgTDE1ODIsNTQ2IEwxNTc2LDU0MCBMMTU3Niw1MzcgTDE1NzMsNTM0IEwxNTcyLDUzNCBMMTU3MSw1MzMgTDE1NzEsNTMyIEwxNTcwLDUzMSBMMTU2OSw1MzEgTDE1NjgsNTMwIEwxNTY4LDUyNyBMMTU2NSw1MjQgTDE1NjUsNTIxIEwxNTYyLDUxOCBMMTU2Miw1MTcgTDE1NjEsNTE3IEwxNTU5LDUxNSBMMTU1OSw1MTQgTDE1NTgsNTE0IEwxNTU3LDUxMyBMMTU1Nyw1MTIgTDE1NTYsNTExIEwxNTU1LDUxMSBMMTU1Myw1MDkgTDE1NTMsNTA4IEwxNTUyLDUwOCBMMTU1MSw1MDcgTDE1NTEsNTA0IEwxNTM0LDQ4NyBMMTUzNCw0ODYgTDE1MzMsNDg2IEwxNTI1LDQ3OCBMMTUyNSw0NzcgTDE1MjQsNDc3IEwxNTIwLDQ3MyBMMTUyMCw0NzIgTDE1MTgsNDcyIEwxNTE3LDQ3MSBMMTUxNyw0NzAgTDE1MTEsNDY0IEwxNTExLDQ2MyBMMTUxMCw0NjMgTDE1MDUsNDU4IEwxNTA0LDQ1OCBMMTUwMyw0NTcgTDE1MDMsNDU2IEwxNDk2LDQ0OSBMMTQ5Myw0NDkgTDE0OTIsNDQ4IEwxNDkyLDQ0NyBMMTQ5MSw0NDYgTDE0OTAsNDQ2IEwxNDg5LDQ0NSBMMTQ4OSw0NDQgTDE0ODgsNDQ0IEwxNDgyLDQzOCBMMTQ3OCw0MzggTDE0NzcsNDM3IEwxNDc2LDQzNyBMMTQ3NCw0MzUgTDE0NzMsNDM1IEwxNDcyLDQzNCBMMTQ3Miw0MzMgTDE0NjksNDMwIEwxNDY4LDQzMCBMMTQ2Nyw0MjkgTDE0NjcsNDI4IEwxNDY2LDQyNyBMMTQ2NSw0MjcgTDE0NjQsNDI2IEwxNDYyLDQyNiBMMTQ1Nyw0MjEgTDE0NTYsNDIxIEwxNDU1LDQyMCBMMTQ1NSw0MTkgTDE0NTQsNDE4IEwxNDUxLDQxOCBMMTQ0Niw0MTMgTDE0NDQsNDEzIEwxNDQzLDQxMiBMMTQ0Miw0MTIgTDE0MzksNDA5IEwxNDM0LDQwOSBMMTQzMiw0MDcgTDE0MzEsNDA3IEwxNDMwLDQwNiBMMTQzMCw0MDUgTDE0MjksNDA0IEwxNDI1LDQwNCBMMTQyNCw0MDMgTDE0MjQsNDAyIEwxNDIzLDQwMSBMMTQyMCw0MDEgTDE0MTgsMzk5IEwxNDE2LDM5OSBMMTQxNSwzOTggTDE0MTQsMzk4IEwxNDExLDM5NSBMMTQwNSwzOTUgTDE0MDQsMzk0IEwxNDA0LDM5MyBMMTQwMCwzOTMgTDEzOTksMzkyIEwxMzk5LDM5MSBMMTM5OCwzOTAgTDEzOTcsMzkwIEwxMzk2LDM4OSBMMTM5NiwzODggTDEzOTUsMzg3IEwxMzg5LDM4NyBMMTM4NiwzODQgTDEzODEsMzg0IEwxMzc4LDM4MSBMMTM3NSwzODEgTDEzNzMsMzc5IEwxMzcyLDM3OSBMMTM3MSwzNzggTDEzNjYsMzc4IEwxMzY0LDM3NiBMMTM2MSwzNzYgTDEzNTgsMzczIEwxMzUyLDM3MyBMMTM1MSwzNzIgTDEzNTEsMzcxIEwxMzUwLDM3MSBMMTM0OSwzNzAgTDEzMzgsMzcwIEwxMzM3LDM2OSBMMTMzNywzNjggTDEzMzYsMzY4IEwxMzM1LDM2NyBMMTMyNywzNjcgTDEzMjUsMzY1IEwxMzI0LDM2NSBMMTMyMywzNjQgTDEzMTMsMzY0IEwxMzExLDM2MiBMMTMwMiwzNjIgTDEyOTksMzU5IEwxMjg3LDM1OSBMMTI4NiwzNTggTDEyODYsMzU3IEwxMjg1LDM1NiBMMTI2MiwzNTYgTDEyNjEsMzU1IEwxMjYxLDM1NCBMMTI0NiwzNTQgTDEyNDUsMzUzIEwxMjM3LDM1MyBMMTIzNiwzNTQgTDEyMzUsMzU0IEwxMjM0LDM1MyBMMTE5MiwzNTMgTDExOTEsMzU0IEwxMTgyLDM1NCBaIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIgc3Ryb2tlPSJub25lIiAvPjwvc3ZnPg==';

    var typeOrder = {
        outfit: 1, backpack: 2, pickaxe: 3, glider: 4, contrail: 5, emote: 6, emoji: 7, spray: 8,
        wrap: 9, shoe: 10, companion: 11, banner: 12, music: 13, jamtrack: 13, loadingscreen: 14,
        toy: 15, aura: 16,
        guitar: 17, bass: 17, drum: 17, keytar: 17, microphone: 17,
        car: 18, decal: 18, wheel: 18, trail: 18, boost: 18,
        legokit: 19, unknown: 99
    };
    var instrumentSort = { guitar: 1, bass: 2, drum: 3, keytar: 4, microphone: 5 };
    var racingSort = { car: 1, decal: 2, wheel: 3, trail: 4, boost: 5 };

    var typeMap = {
        character: 'outfit', backbling: 'backpack', 'back bling': 'backpack', pet: 'backpack', petcarrier: 'backpack',
        dance: 'emote', emoticon: 'emoji', 'harvesting tool': 'pickaxe', harvestingtool: 'pickaxe',
        'skydiving trail': 'contrail', skydivercontrail: 'contrail', itemwrap: 'wrap', 'loading screen': 'loadingscreen',
        musicpack: 'music', 'music pack': 'music', bannertoken: 'banner', shoes: 'shoe', kicks: 'shoe', sidekick: 'companion',
        sparks_guitar: 'guitar', sparks_bass: 'bass', sparks_drum: 'drum', drums: 'drum', sparks_keyboard: 'keytar',
        keyboard: 'keytar', sparks_microphone: 'microphone', mic: 'microphone', sparks_aura: 'aura', instrument: 'guitar',
        track: 'jamtrack', 'jam track': 'jamtrack', sparks_song: 'jamtrack',
        body: 'car', vehiclebody: 'car', skin: 'decal', vehicleskin: 'decal', wheels: 'wheel', vehiclewheels: 'wheel',
        booster: 'boost', vehicleboost: 'boost', drifttrail: 'trail',
        legoset: 'legokit', legoprop: 'legokit', legobuild: 'legokit', lego: 'legokit', build: 'legokit',
        juno_build: 'legokit', junobuild: 'legokit', decor: 'legokit', juno_decor: 'legokit', junodecor: 'legokit', legodecor: 'legokit'
    };

    var idPatterns = [
        [/^cid_/, 'outfit'], [/^bid_|^petcarrier_/, 'backpack'], [/^pickaxe_/, 'pickaxe'], [/^glider_/, 'glider'],
        [/^trails_/, 'contrail'], [/^eid_/, 'emote'], [/^emoji_/, 'emoji'], [/^spid_/, 'spray'], [/^wrap_/, 'wrap'],
        [/^lsid_/, 'loadingscreen'], [/^musicpack_/, 'music'], [/^toy_/, 'toy'], [/^shoes_/, 'shoe'],
        [/^companion_/, 'companion'], [/^banner/, 'banner'], [/^sid_|^sparks_song_/, 'jamtrack'], [/sparks_.*aura/, 'aura'],
        [/_guitar|sparks_.*guitar/, 'guitar'], [/_bass|sparks_.*bass/, 'bass'], [/_drumkit|sparks_.*drum/, 'drum'],
        [/_keytar|sparks_.*keyboard/, 'keytar'], [/_mic|sparks_.*microphone/, 'microphone'],
        [/^id_body_|^vkc_/, 'car'], [/^id_skin_|^vks_/, 'decal'], [/^id_wheel_|^vkw_/, 'wheel'],
        [/^id_boost_|^booster_|^vkb_/, 'boost'], [/^id_drifttrail_|^vkt_/, 'trail'], [/^jbsid_|^jbpid_|^juno_/, 'legokit']
    ];

    var seriesBonus = {
        marvel: 8800, dc: 8700, dark: 8600, cube: 8600, starwars: 8500, 'star wars': 8500,
        gaming: 8400, icon: 8300, columbus: 8300, creator: 8300, frozen: 8200, lava: 8100, shadow: 8000, slurp: 7900
    };
    var rarityScore = { legendary: 900, epic: 700, rare: 600, uncommon: 500, common: 400 };

    var session = null;
    var working = false;
    var deviceCode = null;
    var verifyUri = null;
    var pollInterval = null;
    var currentPollInterval = POLL_INTERVAL;
    var loginExpires = 0;
    var sessionChecking = false;
    var cosmeticsData = null;

    function getSettings() {
        try { return JSON.parse(GM_getValue('fngg_settings', '{}')); }
        catch(e) { return {}; }
    }
    function saveSetting(k, v) {
        var s = getSettings(); s[k] = v;
        GM_setValue('fngg_settings', JSON.stringify(s));
    }

    function saveSession(d) {
        GM_setValue('epic_session', JSON.stringify({
            token: d.accessToken, id: d.accountId, name: d.displayName, ts: Date.now()
        }));
    }
    function loadSession() {
        try {
            var d = JSON.parse(GM_getValue('epic_session'));
            if (!d || Date.now() - d.ts > SESSION_TIMEOUT) {return null;}
            return { accessToken: d.token, accountId: d.id, displayName: d.name, ts: d.ts };
        } catch(e) { return null; }
    }
    function clearSession() {
        GM_deleteValue('epic_session');
        session = null;
        bgNewCount = 0;
        statsLoaded = false;
        var sb = $('fngg-stats-body');
        if (sb) {sb.textContent = t('statsClickLoad');}
        var spx = $('fngg-stats');
        if (spx && spx.classList.contains('show')) {toggleStats(false);}
    }

    function $(id) { return document.getElementById(id); }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function(ch) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
        });
    }

    async function fetchFnggItems() {
        var r = await httpRetry('GET', 'https://fortnite.gg/api/items.json');
        if (r.status === 403) {
            try {
                var r2 = await httpRetry('GET', 'https://www.fortnite.gg/api/items.json');
                if (r2.status === 200) {return r2;}
            } catch(e) {}
        }
        return r;
    }

    function http(method, url, headers, body, timeoutMs) {
        return new Promise(function(res, rej) {
            GM_xmlhttpRequest({
                method: method, url: url, headers: headers || {}, data: body,
                timeout: timeoutMs || REQUEST_TIMEOUT,
                onload: function(r) {
                    try { res({ status: r.status, data: JSON.parse(r.responseText) }); }
                    catch(e) { res({ status: r.status, data: r.responseText }); }
                },
                onerror: function() { rej(new Error('network')); },
                ontimeout: function() { rej(new Error('timeout')); }
            });
        });
    }

    function delay(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

    async function httpRetry(method, url, headers, body, retries) {
        var maxTries = (retries === undefined ? HTTP_RETRIES : retries) + 1;
        for (var i = 1; i <= maxTries; i++) {
            try {
                var r = await http(method, url, headers, body);
                if ((r.status >= 500 || r.status === 429) && i < maxTries) {
                    await delay(600 * i);
                    continue;
                }
                return r;
            } catch (e) {
                if (i >= maxTries) {throw e;}
                await delay(600 * i);
            }
        }
        throw new Error('network');
    }

    function fetchLocale(lang) { return http('GET', LOCALES_BASE + lang + '.json', {}, null, LOCALE_TIMEOUT); }

    function storeLocale(lang, data) {
        I18N[lang] = data;
        try { GM_setValue('locale_' + lang, JSON.stringify({ ts: Date.now(), data: data })); } catch(e) {}
    }

    function bgRefreshLocale(lang) {
        fetchLocale(lang).then(function(r) {
            if (r.status === 200 && r.data && typeof r.data === 'object') {storeLocale(lang, r.data);}
        }).catch(function() {});
    }

    async function ensureLocale(lang) {
        if (INLINE_LANGS.indexOf(lang) !== -1 || I18N[lang]) {return;}
        var c = null;
        try { c = JSON.parse(GM_getValue('locale_' + lang, 'null')); } catch(e) {}
        if (c && c.data && typeof c.data === 'object') {
            I18N[lang] = c.data;
            if (!c.ts || Date.now() - c.ts > LOCALES_CACHE_TTL) {bgRefreshLocale(lang);}
            return;
        }
        try {
            var r = await fetchLocale(lang);
            if (r.status === 200 && r.data && typeof r.data === 'object') {storeLocale(lang, r.data);}
        } catch(e) {}
    }

    function toggleChapter(inner, chapter) {
        var sel = '.filter-select-btn[data-key="season"][data-chapter="' + chapter + '"]';
        var btns = [].slice.call(inner.querySelectorAll(sel));
        if (!btns.length) {return;}
        var allActive = btns.every(function(b) { return b.classList.contains('active'); });
        var vals = btns.filter(function(b) {
            var a = b.classList.contains('active');
            return allActive ? a : !a;
        }).map(function(b) { return b.getAttribute('data-val'); });
        vals.forEach(function(v) {
            var b = inner.querySelector(sel + '[data-val="' + v + '"]');
            if (b) {b.click();}
        });
    }

    function enhanceChapterFilters() {
        var inners = document.querySelectorAll('.filter-select-inner');
        for (var k = 0; k < inners.length; k++) {
            var inner = inners[k];
            if (!inner.querySelector('.filter-select-btn[data-key="season"][data-chapter]')) {continue;}
            var titles = inner.querySelectorAll('.title');
            for (var ti = 0; ti < titles.length; ti++) {
                (function(title, inner) {
                    if (title.getAttribute('data-fngg-chapter')) {return;}
                    var chapter = null, n = title.nextElementSibling;
                    while (n) {
                        if (n.classList && n.classList.contains('title')) {break;}
                        if (n.classList && n.classList.contains('filter-select-btn') && n.getAttribute('data-key') === 'season' && n.getAttribute('data-chapter')) { chapter = n.getAttribute('data-chapter'); break; }
                        n = n.nextElementSibling;
                    }
                    if (chapter === null) {return;}
                    title.setAttribute('data-fngg-chapter', chapter);
                    title.classList.add('fngg-chapter-toggle');
                    title.title = t('chapterToggleHint');
                    title.addEventListener('click', function() { toggleChapter(inner, chapter); });
                })(titles[ti], inner);
            }
        }
    }

    var chapterScanTimer = null;
    function initChapterFilters() {
        enhanceChapterFilters();
        updatePresetsVisibility();
        markWishlistOwned();
        checkShopWishlist();
        try {
            var obs = new MutationObserver(function() {
                if (chapterScanTimer) {return;}
                chapterScanTimer = setTimeout(function() { chapterScanTimer = null; enhanceChapterFilters(); updatePresetsVisibility(); markWishlistOwned(); checkShopWishlist(); }, 300);
            });
            obs.observe(document.body, { childList: true, subtree: true });
        } catch(e) {}
    }

    var IMPORT_CATS = ['outfit','backpack','pickaxe','glider','contrail','emote','emoji','spray','wrap','banner','loadingscreen','music','jamtrack','instrument','car','lego','toy','companion','shoe','aura'];
    var IMPORT_RARITIES = ['common','uncommon','rare','epic','legendary','mythic'];
    var IMPORT_SERIES = ['marvel','dc','starwars','gaming','icon','dark','frozen','lava','shadow','slurp','cube'];
    var TYPE_TO_CAT = {
        outfit:'outfit', backpack:'backpack', pickaxe:'pickaxe', glider:'glider', contrail:'contrail',
        emote:'emote', emoji:'emoji', spray:'spray', wrap:'wrap', banner:'banner', loadingscreen:'loadingscreen',
        music:'music', jamtrack:'jamtrack',
        guitar:'instrument', bass:'instrument', drum:'instrument', keytar:'instrument', microphone:'instrument',
        car:'car', decal:'car', wheel:'car', trail:'car', boost:'car',
        legokit:'lego', toy:'toy', companion:'companion', shoe:'shoe', aura:'aura'
    };
    var CAT_LABEL = { outfit:'catOutfit', backpack:'catBackpack', pickaxe:'catPickaxe', glider:'catGlider', contrail:'catContrail', emote:'catEmote', emoji:'catEmoji', spray:'catSpray', wrap:'catWrap', banner:'catBanner', loadingscreen:'catLoadingscreen', music:'catMusic', jamtrack:'catJamtrack', instrument:'catInstrument', car:'catCar', lego:'catLego', toy:'catToy', companion:'catCompanion', shoe:'catShoe', aura:'catAura' };
    var RAR_LABEL = { common:'rarCommon', uncommon:'rarUncommon', rare:'rarRare', epic:'rarEpic', legendary:'rarLegendary', mythic:'rarMythic' };
    var SERIES_LABEL = { marvel:'Marvel', dc:'DC', starwars:'Star Wars', gaming:'Gaming Legends', icon:'Icon Series', dark:'DARK', frozen:'Frozen', lava:'Lava', shadow:'Shadow', slurp:'Slurp', cube:'Cube' };
    function catOf(type) { return TYPE_TO_CAT[type] || 'unknown'; }
    function rarTierOf(it) {
        var r = it.rarity || 'common';
        return IMPORT_RARITIES.indexOf(r) !== -1 ? r : 'common';
    }
    function seriesOf(it) {
        if (!it.series) {return null;}
        var s = String(it.series).toLowerCase();
        if (s.indexOf('marvel') !== -1) {return 'marvel';}
        if (/\bdc\b/.test(s)) {return 'dc';}
        if (s.indexOf('star wars') !== -1 || s.indexOf('starwars') !== -1) {return 'starwars';}
        if (s.indexOf('gaming') !== -1 || s.indexOf('columbus') !== -1) {return 'gaming';}
        if (s.indexOf('icon') !== -1 || s.indexOf('creator') !== -1) {return 'icon';}
        if (s.indexOf('dark') !== -1) {return 'dark';}
        if (s.indexOf('frozen') !== -1) {return 'frozen';}
        if (s.indexOf('lava') !== -1) {return 'lava';}
        if (s.indexOf('shadow') !== -1) {return 'shadow';}
        if (s.indexOf('slurp') !== -1) {return 'slurp';}
        if (s.indexOf('cube') !== -1) {return 'cube';}
        return 'other';
    }
    function itemExcluded(it) {
        var s = getSettings();
        var exC = s.importExclTypes || [], exR = s.importExclRarities || [], exS = s.importExclSeries || [];
        if (exC.indexOf(catOf(it.type)) !== -1) {return true;}
        if (it.series) {
            var sk = seriesOf(it);
            return sk !== null && exS.indexOf(sk) !== -1;
        }
        return exR.indexOf(rarTierOf(it)) !== -1;
    }
    function importFilterActive() {
        var s = getSettings();
        return ((s.importExclTypes || []).length + (s.importExclRarities || []).length + (s.importExclSeries || []).length) > 0;
    }
    function applyImportFilter(items) {
        if (!importFilterActive()) {return items;}
        return items.filter(function(it) { return !itemExcluded(it); });
    }
    function chipKey(kind) { return kind === 'type' ? 'importExclTypes' : (kind === 'rarity' ? 'importExclRarities' : 'importExclSeries'); }
    function chipsHTML(kind, list, labelFn) {
        var ex = getSettings()[chipKey(kind)] || [];
        return list.map(function(v) {
            var on = ex.indexOf(v) === -1;
            return '<button class="fchip ' + (on ? 'on' : 'off') + '" data-kind="' + kind + '" data-val="' + v + '">' + esc(labelFn(v)) + '</button>';
        }).join('');
    }
    function bindChips(root) {
        root.querySelectorAll('.fchip').forEach(function(c) {
            c.onclick = function() {
                var kind = c.getAttribute('data-kind'), val = c.getAttribute('data-val');
                var key = chipKey(kind);
                var st = getSettings(); var ex = st[key] || []; var i = ex.indexOf(val);
                if (i === -1) {ex.push(val);} else {ex.splice(i, 1);}
                st[key] = ex; GM_setValue('fngg_settings', JSON.stringify(st));
                var on = ex.indexOf(val) === -1;
                c.classList.toggle('on', on); c.classList.toggle('off', !on);
                updateUI();
            };
        });
    }

    function normalizeType(t) {
        if (!t) {return 'unknown';}
        var l = t.toLowerCase();
        return typeMap[l] || (typeOrder[l] !== undefined ? l : 'unknown');
    }
    function guessType(id) {
        var l = id.toLowerCase();
        for (var i = 0; i < idPatterns.length; i++) {
            if (idPatterns[i][0].test(l)) {return idPatterns[i][1];}
        }
        return null;
    }
    function getScore(item) {
        if (item.series) {
            var s = item.series.toLowerCase();
            for (var k in seriesBonus) {if (s.indexOf(k) !== -1) {return seriesBonus[k];}}
            return 7500;
        }
        return rarityScore[item.rarity] || 100;
    }

    function processItemsFromProfile(itemsObj, fngg, cdb, seen, skipped, unmappedItems, prefixStats) {
        var result = [];
        for (var key in itemsObj) {
            var tid = itemsObj[key].templateId || '';
            if (tid.indexOf(':') === -1) { skipped.noBid++; continue; }
            var bid = tid.split(':')[1].toLowerCase();
            var fid = fngg[bid];
            if (!fid || isNaN(fid)) {
                skipped.noMapping++;
                unmappedItems.push(bid);
                var pfx = tid.split(':')[0];
                prefixStats[pfx] = (prefixStats[pfx] || 0) + 1;
                continue;
            }
            if (seen[fid]) { skipped.duplicate++; continue; }
            seen[fid] = true;

            var meta = cdb[bid] || {};
            var type = normalizeType(meta.type);
            if (!type || type === 'unknown') {type = guessType(bid) || 'unknown';}

            result.push({ fid: fid, name: meta.name || bid, type: type, rarity: meta.rarity || 'common', series: meta.series || null });
        }
        return result;
    }

    GM_addStyle(`
        #fngg-panel{position:fixed;top:60px;right:0;width:350px;background:rgba(15,15,18,.65);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,.12);border-right:0;border-radius:16px 0 0 16px;font-family:fn,sans-serif;z-index:999999;box-shadow:0 8px 32px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.05) inset;transition:transform .3s ease}
        #fngg-panel.min{transform:translateX(100%)}
        #fngg-tab{position:fixed;top:100px;right:0;width:22px;height:40px;background:rgba(15,15,18,.65);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,.12);border-right:0;border-radius:6px 0 0 6px;cursor:pointer;z-index:999998;display:flex;align-items:center;justify-content:center;color:#888;font-size:11px;transition:right .3s ease,background .2s,color .2s}
        #fngg-tab:hover{background:rgba(40,40,45,.8);color:#fff}
        #fngg-tab.open{right:350px}
        #fngg-debug{position:fixed;top:60px;bottom:15px;right:0;width:350px;background:rgba(15,15,18,.65);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,.12);border-right:0;border-radius:16px 0 0 16px;font-family:fn,sans-serif;z-index:999;box-shadow:0 8px 32px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.05) inset;transform:translateX(105%);opacity:0;transition:transform .3s ease,opacity .3s ease;pointer-events:none;overflow-y:auto}
        #fngg-debug.show{transform:translateX(0);opacity:1;pointer-events:auto}
        #fngg-debug .fngg-hdr{border-radius:16px 0 0 0}
        #fngg-dtab{position:fixed;top:100px;right:0;width:22px;height:40px;background:rgba(15,15,18,.65);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,.12);border-right:0;border-radius:6px 0 0 6px;cursor:pointer;z-index:999;display:flex;align-items:center;justify-content:center;font-size:12px;transition:right .3s ease,top .3s ease,background .2s;opacity:.85}
        #fngg-dtab:hover{background:rgba(40,40,45,.8);opacity:1}
        #fngg-dtab.open{right:350px}
        #fngg-stats{position:fixed;top:60px;bottom:15px;left:0;width:350px;background:rgba(15,15,18,.65);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,.12);border-left:0;border-radius:0 16px 16px 0;font-family:fn,sans-serif;z-index:999;box-shadow:0 8px 32px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.05) inset;transform:translateX(-105%);opacity:0;transition:all .3s ease;pointer-events:none;overflow-y:auto}
        #fngg-stats.show{transform:translateX(0);opacity:1;pointer-events:auto}
        #fngg-stats .fngg-hdr{border-radius:0 16px 0 0}
        #fngg-stats .body{padding:12px}
        #fngg-stab{position:fixed;top:100px;left:0;width:22px;height:40px;background:rgba(15,15,18,.65);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,.12);border-left:0;border-radius:0 6px 6px 0;cursor:pointer;z-index:999;display:flex;align-items:center;justify-content:center;font-size:12px;transition:left .3s ease,background .2s;opacity:.85}
        #fngg-stab:hover{background:rgba(40,40,45,.8);opacity:1}
        #fngg-stab.open{left:350px}
        #fngg-ptab{position:fixed;top:148px;left:0;width:22px;height:40px;background:rgba(15,15,18,.65);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,.12);border-left:0;border-radius:0 6px 6px 0;cursor:pointer;z-index:999;display:flex;align-items:center;justify-content:center;font-size:12px;transition:left .3s ease,background .2s;opacity:.85}
        #fngg-ptab:hover{background:rgba(40,40,45,.8);opacity:1}
        #fngg-ptab.open{left:350px}
        #fngg-presets{position:fixed;top:60px;bottom:15px;left:0;width:350px;background:rgba(15,15,18,.65);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,.12);border-left:0;border-radius:0 16px 16px 0;font-family:fn,sans-serif;z-index:999;box-shadow:0 8px 32px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.05) inset;transform:translateX(-105%);opacity:0;transition:all .3s ease;pointer-events:none;overflow-y:auto}
        #fngg-presets.show{transform:translateX(0);opacity:1;pointer-events:auto}
        #fngg-presets .fngg-hdr{border-radius:0 16px 0 0}
        #fngg-presets .body{padding:12px}
        .pdesc{font-size:12px;color:#aaa;line-height:1.45;margin:0}
        .presave{display:flex;gap:7px;margin:9px 0 12px}
        .presave input{flex:1;max-width:none;cursor:text}
        .presave button{white-space:nowrap;width:auto;padding:0 12px;height:32px;color:#f0db4f;font-weight:600;font-size:12px}
        .prow{display:flex;align-items:center;gap:8px;padding:9px 11px;margin-bottom:7px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:9px;cursor:pointer;transition:all .15s}
        .prow:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}
        .prow.active{border-color:#f0db4f;background:rgba(240,219,79,.1)}
        .prow.imp{border-style:dashed}
        .pinfo{flex:1;min-width:0}
        .pname{font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .prow.active .pname{color:#f0db4f}
        .pmeta{font-size:11px;color:#888;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .pdel{flex:none;width:24px;height:24px;border-radius:6px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#888;cursor:pointer;font-size:11px;transition:all .15s}
        .pdel:hover{background:rgba(239,68,68,.2);border-color:rgba(239,68,68,.5);color:#fff}
        .pempty{font-size:12px;color:#777;text-align:center;padding:14px 0}
        .scards{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0}
        .scard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px 6px;text-align:center}
        .scard .v{font-size:15px;font-weight:700;color:#f0db4f}
        .scard .l{font-size:8px;color:#888;text-transform:uppercase;letter-spacing:.3px;margin-top:2px}
        .ssec{margin-bottom:9px;padding-bottom:9px;border-bottom:1px solid rgba(255,255,255,.06)}
        .ssec:last-child{border-bottom:0;margin-bottom:0;padding-bottom:0}
        .ssec h4{margin:0 0 4px;font-size:11px;font-weight:700;color:#f0db4f;text-transform:uppercase;letter-spacing:.3px;cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:space-between}
        .ssec h4::after{content:'';flex:0 0 auto;width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid currentColor;opacity:.75;transition:transform .2s;margin-left:8px}
        .ssec h4:hover{color:#fff}
        .ssec.collapsed h4::after{transform:rotate(-90deg)}
        .ssec.collapsed h4{margin-bottom:0}
        .ssec.collapsed > :not(h4){display:none}
        .ssec p{margin:0;font-size:11px;color:#bbb;line-height:1.7;font-family:monospace}
        .ssec .dim{color:#777}
        .fngg-hdr{background:linear-gradient(135deg,rgba(45,45,50,.5) 0%,rgba(35,35,40,.5) 100%);padding:10px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08);border-radius:16px 0 0 0}
        .fngg-brand{display:flex;align-items:center;gap:10px}
        .fngg-brand img{width:30px;height:30px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.3)}
        .fngg-brand span{font-size:14px;font-weight:700;color:#fff;letter-spacing:.5px;text-transform:uppercase}
        .fngg-btns{display:flex;gap:4px}
        .fngg-hbtn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#888;width:26px;height:26px;border-radius:6px;cursor:pointer;transition:all .2s;font-size:12px}
        .fngg-hbtn:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.15);color:#fff}
        .body{padding:12px}
        #fngg-debug .body{display:flex;flex-direction:column;height:calc(100% - 51px)}
        .ucard{display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;margin-bottom:10px}
        .ucard img{width:42px;height:42px;border-radius:10px;object-fit:cover;box-shadow:0 0 12px rgba(240,219,79,.2),0 2px 8px rgba(0,0,0,.3)}
        .ucard-placeholder{width:42px;height:42px;border-radius:10px;background:rgba(255,255,255,.06);border:1px dashed rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:18px}
        .ucard .info{flex:1;min-width:0}
        .ucard .name{font-size:14px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.2;text-transform:uppercase;letter-spacing:.3px}
        .ucard .status{font-size:11px;color:#4ade80;display:flex;align-items:center;gap:5px;margin-top:2px;text-transform:uppercase;letter-spacing:.5px}
        .ucard .status::before{content:'';width:6px;height:6px;background:#4ade80;border-radius:50%;box-shadow:0 0 6px #4ade80;animation:pulse 2s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.9)}}
        .lout{background:0;border:1px solid rgba(255,255,255,.1);color:#888;font-size:10px;padding:5px 10px;border-radius:6px;cursor:pointer;transition:all .2s;text-transform:uppercase;letter-spacing:.5px;font-weight:600}
        .lout:hover{background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.4);color:#ef4444}
        .btn{width:100%;padding:12px 14px;border:0;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;text-transform:uppercase;letter-spacing:.5px}
        .btn:disabled{opacity:.5;cursor:not-allowed}
        .btn-y{background:linear-gradient(135deg,#f0db4f 0%,#e6c93a 100%);color:#000;box-shadow:0 2px 12px rgba(240,219,79,.25)}
        .btn-y:hover:not(:disabled){background:linear-gradient(135deg,#f5e066 0%,#f0db4f 100%);box-shadow:0 4px 16px rgba(240,219,79,.35);transform:translateY(-1px)}
        .btn-g{background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);color:#fff;box-shadow:0 2px 12px rgba(34,197,94,.25)}
        .btn-g:hover:not(:disabled){background:linear-gradient(135deg,#2dd468 0%,#22c55e 100%);box-shadow:0 4px 16px rgba(34,197,94,.35);transform:translateY(-1px)}
        .btn-x{background:rgba(255,255,255,.05);color:#aaa;margin-top:12px;border:1px solid rgba(255,255,255,.08)}
        .btn-x:hover:not(:disabled){background:rgba(255,255,255,.08);color:#fff}
        .stxt{font-size:11px;color:#555;text-align:center;padding:10px;background:rgba(255,255,255,.02);border-radius:8px;margin-top:12px;border:1px solid rgba(255,255,255,.04)}
        .fngg-m{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:9999999;opacity:0;visibility:hidden;transition:opacity .2s}
        .fngg-m.show{opacity:1;visibility:visible}
        .mbox{background:rgba(15,15,18,.55);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:24px;width:340px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.05) inset;font-family:fn,sans-serif}
        .mtitle{font-size:20px;font-weight:700;color:#fff;margin-bottom:20px;text-transform:uppercase;letter-spacing:.5px}
        .spin{width:28px;height:28px;border:3px solid rgba(255,255,255,.1);border-top-color:#f0db4f;border-radius:50%;animation:spin .8s linear infinite;margin:16px auto}
        @keyframes spin{to{transform:rotate(360deg)}}
        .mhint{font-size:12px;color:#666}
        .isec{text-align:left;margin-bottom:7px;padding-bottom:7px;border-bottom:1px solid rgba(255,255,255,.08)}
        .isec:last-child{border-bottom:0;margin-bottom:0;padding-bottom:0}
        .isec h3{font-size:12px;font-weight:700;color:#f0db4f;margin:0 0 3px;text-transform:uppercase;letter-spacing:.3px}
        .isec p{font-size:12px;color:#ccc;line-height:1.45;margin:0}
        .isec a{color:#f0db4f;text-decoration:none}
        .isec a:hover{text-decoration:underline}
        .isec.footer{margin-top:2px;padding-top:7px;border-top:1px solid rgba(255,255,255,.1);border-bottom:0}
        .isec.footer p{margin:0 0 3px}
        .isec.footer .credit{color:#f0db4f;font-size:12px;font-weight:600}
        .isec.footer .credit a{color:#f0db4f}
        .isec.footer .links{font-size:11px;margin-top:5px}
        .isec.footer .links a{color:#999}
        .isec.footer .disclaimer{color:#666;font-size:11px;margin-top:5px}
        .isec.footer .version{color:#555;font-size:11px;margin-top:4px}
        .login-card{display:flex;align-items:center;gap:12px;padding:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;margin-bottom:12px}
        .login-icon{font-size:28px}
        .login-text{flex:1}
        .login-title{font-size:13px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:.3px}
        .login-desc{font-size:11px;color:#888;margin-top:3px}
        .tog{position:relative;width:40px;height:22px;background:rgba(255,255,255,.1);border-radius:11px;cursor:pointer;transition:background .2s}
        .tog.on{background:#22c55e}
        .tog::after{content:'';position:absolute;top:2px;left:2px;width:18px;height:18px;background:#fff;border-radius:50%;transition:left .2s;box-shadow:0 2px 4px rgba(0,0,0,.2)}
        .tog.on::after{left:20px}
        .ver{font-size:10px;color:#444;margin-top:16px}
        .sicon{font-size:40px;margin-bottom:12px}
        .stxt2{font-size:13px;color:#aaa;line-height:1.6;margin-bottom:20px}
        .stxt2 strong{color:#fff}
        .btn-sac{background:linear-gradient(135deg,#f0db4f 0%,#e6c93a 100%);color:#000;margin-bottom:8px}
        .btn-skip{background:0;border:0;color:#666;font-size:12px;padding:8px;cursor:pointer;width:100%;transition:color .2s}
        .btn-skip:hover{color:#999}
        #fngg-toast{position:fixed;bottom:20px;left:20px;background:rgba(26,26,29,.95);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:12px 20px;font-size:13px;font-weight:600;color:#fff;z-index:99999999;transform:translateY(100px);opacity:0;transition:all .25s;box-shadow:0 8px 24px rgba(0,0,0,.3);font-family:fn,sans-serif;text-transform:uppercase;letter-spacing:.3px}
        #fngg-toast.show{transform:translateY(0);opacity:1}
        #fngg-toast.ok{border-left:3px solid #22c55e}
        #fngg-toast.err{border-left:3px solid #ef4444}
        #fngg-foot{display:flex;align-items:center;justify-content:space-between;margin-top:5px;padding-top:4px;border-top:1px solid rgba(255,255,255,.05);font-size:9px;line-height:1.1;color:#555;letter-spacing:.2px}
        #fngg-foot b{color:#f0db4f;font-weight:600;cursor:pointer}
        #fngg-foot b:hover{text-decoration:underline}
        #fngg-foot a{color:#777;cursor:pointer;text-decoration:none;transition:color .2s}
        #fngg-foot a:hover{color:#fff}
        #fngg-onb{position:fixed;top:78px;right:380px;max-width:250px;background:linear-gradient(135deg,#f0db4f,#e6c93a);color:#111;padding:12px 14px;border-radius:12px;font-family:fn,sans-serif;font-size:12px;font-weight:600;line-height:1.45;z-index:999999;box-shadow:0 4px 16px rgba(240,219,79,.4);animation:onbpulse 2.4s ease-in-out infinite}
        #fngg-onb::after{content:'';position:absolute;right:-6px;top:24px;border:6px solid transparent;border-right:0;border-left-color:#e6c93a}
        #fngg-onb .skip{display:block;margin-top:8px;font-size:10px;font-weight:700;color:rgba(0,0,0,.55);cursor:pointer;text-transform:uppercase;letter-spacing:.3px}
        #fngg-onb .skip:hover{color:#000}
        .fngg-sel{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#fff;font-family:fn,sans-serif;font-size:12px;border-radius:8px;padding:6px 24px 6px 8px;outline:none;cursor:pointer;max-width:160px;-webkit-appearance:none;appearance:none}
        .fngg-sel:hover{border-color:rgba(255,255,255,.3)}
        .fngg-sel option{background:#1a1a1d;color:#fff}
        .fngg-chapter-toggle{cursor:pointer;transition:color .15s}
        .fngg-chapter-toggle:hover{color:#f0db4f;text-decoration:underline}
        .bgnotice{background:linear-gradient(135deg,rgba(240,219,79,.18),rgba(240,219,79,.08));border:1px solid rgba(240,219,79,.35);color:#f0db4f;font-size:12px;font-weight:600;padding:8px 10px;border-radius:8px;margin-bottom:8px;cursor:pointer;text-align:center;transition:all .2s}
        .bgnotice:hover{background:linear-gradient(135deg,rgba(240,219,79,.28),rgba(240,219,79,.14))}
        #items a.item-icon.fngg-wl-owned{outline:2px solid #4ade80;outline-offset:-2px;border-radius:8px;box-shadow:0 0 10px rgba(74,222,128,.7)}
        .sgroup{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:8px;margin-bottom:10px;overflow:hidden}
        .sgrow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px}
        .sgrow-l{flex:1}
        .sgroup-sub{border-top:1px solid rgba(255,255,255,.06);transition:opacity .2s}
        .sgroup-sub .sgrow{padding:7px 10px 7px 18px}
        .sgroup-sub .slbl{font-size:11px;color:#bbb}
        .setmbox{width:min(880px,94vw);max-height:88vh;overflow-y:auto;text-align:left}
        .infombox{width:min(760px,94vw);max-height:88vh;overflow-y:auto;text-align:left}
        #infomodal .infogrid{column-count:2;column-gap:14px;margin-top:8px}
        #infomodal .isec{break-inside:avoid;-webkit-column-break-inside:avoid}
        @media (max-width:620px){#infomodal .infogrid{column-count:1}}
        .settop{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:8px;align-items:stretch}
        .settop .sgroup{margin-bottom:0;display:flex;flex-direction:column}
        .secthead{font-size:11px;font-weight:700;color:#f0db4f;text-transform:uppercase;letter-spacing:.6px;padding:9px 10px 7px;border-bottom:1px solid rgba(255,255,255,.07)}
        .secthead-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
        #bgSub .sgrow + .sgrow{border-top:1px solid rgba(255,255,255,.05)}
        @media (max-width:640px){.settop{grid-template-columns:1fr}}
        .sgroup > .sgrow + .sgrow{border-top:1px solid rgba(255,255,255,.05)}
        .chiprow{display:flex;flex-wrap:wrap;gap:5px;padding:8px 10px}
        .chiprow+.chiprow{padding-top:0}
        .fchip{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#ddd;font-size:11px;padding:4px 9px;border-radius:20px;cursor:pointer;font-family:fn,sans-serif;transition:all .15s}
        .fchip.on{background:rgba(240,219,79,.16);border-color:rgba(240,219,79,.45);color:#f0db4f}
        .fchip.off{opacity:.45;text-decoration:line-through}
        .sublabel{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.5px;font-weight:700;padding:7px 10px 1px}
        .sgrow .slbl{font-size:13px;color:#fff;font-weight:600}
        .sgrow .sdesc{font-size:11px;color:#999;margin-top:3px;line-height:1.4;font-weight:400}
        .filterhint{font-size:10px;color:#888;text-align:center;margin-top:6px;cursor:pointer;text-transform:uppercase;letter-spacing:.4px}
        .filterhint:hover{color:#f0db4f}
        #fngg-watermark{position:fixed;right:14px;bottom:10px;z-index:999990;font-family:fn,sans-serif;text-align:right;opacity:.3;transition:opacity .25s;pointer-events:none;user-select:none;line-height:1.45}
        #fngg-watermark:hover{opacity:.85}
        #fngg-watermark a{pointer-events:auto;color:inherit;text-decoration:none}
        #fngg-watermark a:hover{text-decoration:underline}
        #fngg-watermark .wm-credit{font-size:12px;color:#fff;font-weight:600}
        #fngg-watermark .wm-links{font-size:11px;color:#bbb}
        #fngg-watermark .wm-disc{font-size:9px;color:#888}
        [dir=rtl]{text-align:right}
        [dir=rtl] .fngg-hdr,[dir=rtl] .fngg-brand,[dir=rtl] .ucard,[dir=rtl] .login-card{flex-direction:row-reverse}
        @keyframes onbpulse{0%,100%{transform:translateX(0)}50%{transform:translateX(-5px)}}
    `);

    var btnText = t('importLocker');
    function setStatus(txt) {
        btnText = txt;
        var btn = $('ibtn');
        if (btn) {btn.textContent = txt;}
    }
    function toast(msg, type) {
        var t = $('fngg-toast');
        if (!t) {return;}
        t.textContent = msg;
        t.className = 'show ' + (type || '');
        setTimeout(function() { t.className = ''; }, 3000);
    }
    function modal(id, show) {
        var m = $(id);
        if (m) {m.classList.toggle('show', show);}
    }

    function isNewerVersion(remote, local) {
        var r = String(remote).split('.'), l = String(local).split('.');
        for (var i = 0; i < Math.max(r.length, l.length); i++) {
            var a = parseInt(r[i] || '0', 10), b = parseInt(l[i] || '0', 10);
            if (a > b) {return true;}
            if (a < b) {return false;}
        }
        return false;
    }

    function showUpdateHint() {
        var foot = $('fngg-foot');
        if (!foot || $('fngg-upd')) {return;}
        var a = document.createElement('a');
        a.id = 'fngg-upd';
        a.href = GF_URL;
        a.target = '_blank';
        a.textContent = t('updateAvail');
        a.style.color = '#f0db4f';
        a.title = t('updateTitle');
        foot.appendChild(a);
    }

    function checkForUpdate() {
        if (isNewerVersion(GM_getValue('latestVersion', '0'), VERSION)) {showUpdateHint();}
        var last = parseInt(GM_getValue('lastUpdateCheck', '0'), 10) || 0;
        if (Date.now() - last < UPDATE_CHECK_INTERVAL) {return;}
        GM_setValue('lastUpdateCheck', String(Date.now()));
        http('GET', 'https://greasyfork.org/scripts/563780/code/script.meta.js').then(function(r) {
            if (r.status !== 200 || typeof r.data !== 'string') {return;}
            var m = r.data.match(/@version\s+([\d.]+)/);
            if (!m) {return;}
            GM_setValue('latestVersion', m[1]);
            if (isNewerVersion(m[1], VERSION)) {showUpdateHint();}
        }).catch(function() {});
    }

    var statsLoaded = false;
    var statsLoading = false;
    var fnggMapMem = null;
    (function migratePanels() {
        var s = getSettings();
        if (s.sidePanel !== undefined) {
            if (s.statsOpen === undefined) {s.statsOpen = (s.sidePanel === 'stats');}
            if (s.debugOpen === undefined) {s.debugOpen = (s.sidePanel === 'debug');}
            delete s.sidePanel;
            GM_setValue('fngg_settings', JSON.stringify(s));
        }
    })();

    function panelMinimized() { return $('fngg-panel') && $('fngg-panel').classList.contains('min'); }

    function positionDebug() {
        var panel = $('fngg-panel'), dbg = $('fngg-debug'), dt = $('fngg-dtab');
        if (!dbg) {return;}
        var top = 60;
        if (panel && !panel.classList.contains('min')) {top = Math.round(panel.getBoundingClientRect().bottom) + 10;}
        dbg.style.top = top + 'px';
        if (dt) {dt.style.top = (top + 16) + 'px';}
    }

    function syncLeftTabs() {
        var lo = ($('fngg-stats') && $('fngg-stats').classList.contains('show')) || ($('fngg-presets') && $('fngg-presets').classList.contains('show'));
        if ($('fngg-stab')) {$('fngg-stab').classList.toggle('open', !!lo);}
        if ($('fngg-ptab')) {$('fngg-ptab').classList.toggle('open', !!lo);}
    }
    function toggleStats(open) {
        var sp2 = $('fngg-stats'), st = $('fngg-stab');
        if (!sp2) {return;}
        if (panelMinimized()) {open = false;}
        if (open && $('fngg-presets') && $('fngg-presets').classList.contains('show')) {togglePresets(false);}
        sp2.classList.toggle('show', open);
        saveSetting('statsOpen', open);
        if (st) {st.style.display = panelMinimized() ? 'none' : '';}
        syncLeftTabs();
        if (open && !statsLoaded) {loadAccountStats();}
    }

    function toggleDebug(open) {
        var dbg = $('fngg-debug'), dt = $('fngg-dtab');
        if (!dbg) {return;}
        if (panelMinimized()) {open = false;}
        dbg.classList.toggle('show', open);
        saveSetting('debugOpen', open);
        if (dt) { dt.classList.toggle('open', open); dt.style.display = panelMinimized() ? 'none' : ''; }
        if (open) {positionDebug();}
    }

    function toggleStatsPanel() {
        var open = $('fngg-stats') && $('fngg-stats').classList.contains('show');
        toggleStats(!open);
    }
    function pageKey() {
        var seg = location.pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
        return seg || 'home';
    }
    function presetStore() {
        try {
            if (unsafeWindow && unsafeWindow.localStorage) {return unsafeWindow.localStorage;}
            return window.localStorage;
        } catch (e) {
            return null;
        }
    }
    function persistPresets(list) {
        var ls = presetStore();
        if (ls) {
            try { ls.setItem('fngg_url_presets', JSON.stringify(list)); } catch (e) {}
        }
        saveSetting('urlPresets', list);
    }
    function getPresets() {
        var list = null, ls = presetStore();
        if (ls) {
            try {
                var raw = ls.getItem('fngg_url_presets');
                if (raw) { var p = JSON.parse(raw); if (Array.isArray(p)) {list = p;} }
            } catch (e) {}
        }
        if (list === null) {
            var gm = getSettings().urlPresets;
            if (Array.isArray(gm) && gm.length) { list = gm; persistPresets(gm); }
        }
        if (!list) {list = [];}
        return list.filter(function(x) { return x && typeof x.q === 'string'; });
    }
    function stripId(q) {
        return (q || '').replace(/^\?/, '').split('&').filter(function(kv) { return kv && kv.split('=')[0] !== 'id'; });
    }
    function curQueryString() {
        return stripId(location.search).join('&');
    }
    function normQuery(q) {
        return stripId(q).slice().sort().join('&');
    }
    function querySummary(q) {
        var parts = stripId(q);
        if (!parts.length) {return t('presetsNoFilters');}
        return parts.map(function(kv) {
            var i = kv.indexOf('=');
            var k = decodeURIComponent(kv.slice(0, i < 0 ? kv.length : i).replace(/\+/g, ' '));
            var v = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' '));
            return v ? k + ': ' + v : k;
        }).join(' • ');
    }
    function applyQuery(q) {
        var id = null;
        location.search.replace(/^\?/, '').split('&').forEach(function(kv) { if (kv && kv.split('=')[0] === 'id') {id = kv;} });
        var parts = stripId(q);
        if (id) {parts.unshift(id);}
        location.href = location.pathname + (parts.length ? '?' + parts.join('&') : '');
    }
    function savePreset(name) {
        name = (name || '').trim();
        if (!name) {return false;}
        var q = curQueryString(), list = getPresets(), idx = -1;
        for (var i = 0; i < list.length; i++) {
            if (list[i].name.toLowerCase() === name.toLowerCase()) { idx = i; break; }
        }
        if (idx !== -1 && !confirm(t('presetsOverwrite').replace('{name}', name))) {return false;}
        var entry = { name: name, q: q };
        if (idx !== -1) {list[idx] = entry;} else {list.push(entry);}
        persistPresets(list);
        toast(t('presetsSaved').replace('{name}', name), 'ok');
        renderPresets();
        return true;
    }
    function applyPreset(idx) {
        var p = getPresets()[idx];
        if (p) {applyQuery(p.q);}
    }
    function deletePreset(idx) {
        var list = getPresets();
        if (!list[idx]) {return;}
        if (!confirm(t('presetsDelete') + ' "' + list[idx].name + '"?')) {return;}
        list.splice(idx, 1);
        persistPresets(list);
        toast(t('presetsDeleted'), 'ok');
        renderPresets();
    }
    function exportPresets() {
        var list = getPresets();
        if (!list.length) { toast(t('presetsEmpty'), 'err'); return; }
        navigator.clipboard.writeText(JSON.stringify(list)).then(function() { toast(t('presetsExported'), 'ok'); }, function() { toast(t('couldntCopy'), 'err'); });
    }
    function importPresets() {
        var raw = prompt(t('presetsImportPrompt'));
        if (raw === null) {return;}
        raw = raw.trim();
        if (!raw) {return;}
        var arr;
        try { arr = JSON.parse(raw); } catch (e) { toast(t('presetsImportFail'), 'err'); return; }
        if (!Array.isArray(arr)) { toast(t('presetsImportFail'), 'err'); return; }
        var clean = arr.filter(function(x) { return x && typeof x.name === 'string' && typeof x.q === 'string'; }).map(function(x) { return { name: String(x.name).slice(0, 40), q: String(x.q) }; });
        if (!clean.length) { toast(t('presetsImportFail'), 'err'); return; }
        var list = getPresets();
        clean.forEach(function(nw) {
            var idx = -1;
            for (var i = 0; i < list.length; i++) { if (list[i].name.toLowerCase() === nw.name.toLowerCase()) { idx = i; break; } }
            if (idx !== -1) {list[idx] = nw;} else {list.push(nw);}
        });
        persistPresets(list);
        renderPresets();
        toast(t('presetsImported').replace('{n}', clean.length), 'ok');
    }
    function presetRowsHTML() {
        var cur = normQuery(location.search), list = getPresets(), none = cur === '';
        var h = '<div class="prow imp' + (none ? ' active' : '') + '" data-act="clear"><div class="pinfo"><div class="pname">' + esc(t('presetsClear')) + '</div><div class="pmeta">' + esc(t('presetsNoFilters')) + '</div></div></div>';
        if (!list.length) {return h + '<div class="pempty">' + esc(t('presetsEmpty')) + '</div>';}
        list.forEach(function(p, i) {
            var active = !none && normQuery(p.q) === cur;
            h += '<div class="prow' + (active ? ' active' : '') + '" data-i="' + i + '"><div class="pinfo"><div class="pname">' + esc(p.name) + '</div><div class="pmeta">' + esc(querySummary(p.q)) + '</div></div><button class="pdel" data-i="' + i + '" title="' + esc(t('presetsDelete')) + '">✕</button></div>';
        });
        return h;
    }
    function renderPresets() {
        var box = $('fngg-plist');
        if (!box) {return;}
        box.innerHTML = presetRowsHTML();
        box.querySelectorAll('.prow').forEach(function(row) {
            row.onclick = function(ev) {
                if (ev.target.classList.contains('pdel')) {return;}
                if (row.getAttribute('data-act') === 'clear') {applyQuery('');}
                else {applyPreset(parseInt(row.getAttribute('data-i'), 10));}
            };
        });
        box.querySelectorAll('.pdel').forEach(function(b) {
            b.onclick = function(ev) { ev.stopPropagation(); deletePreset(parseInt(b.getAttribute('data-i'), 10)); };
        });
    }
    function togglePresets(open) {
        var pp = $('fngg-presets'), pt = $('fngg-ptab');
        if (!pp) {return;}
        if (panelMinimized()) {open = false;}
        if (open && !presetsEligible()) {open = false;}
        if (open && $('fngg-stats') && $('fngg-stats').classList.contains('show')) {toggleStats(false);}
        pp.classList.toggle('show', open);
        saveSetting('presetsOpen', open);
        if (pt) {pt.style.display = (presetsEligible() && !panelMinimized()) ? '' : 'none';}
        syncLeftTabs();
        if (open) {renderPresets();}
    }
    function presetsEligible() {
        if (IS_MOBILE) {return false;}
        if (['cosmetics', 'locker', 'most-used', 'wishlist'].indexOf(pageKey()) === -1) {return false;}
        if (/(?:^|[?&])tag=unreleased(?:&|$)/.test(location.search)) {return false;}
        return true;
    }
    function updatePresetsVisibility() {
        var pt = $('fngg-ptab'), pp = $('fngg-presets');
        if (!pt) {return;}
        var show = presetsEligible() && !panelMinimized();
        pt.style.display = show ? '' : 'none';
        if (!show && pp && pp.classList.contains('show')) {togglePresets(false);}
    }

    async function loadAccountStats() {
        var el = $('fngg-stats-body');
        if (!el || !session) {return;}
        if (statsLoading) {return;}
        statsLoading = true;
        el.innerHTML = '<span style="color:#888">'+t('statsLoadingAccount')+'</span>';
        try {
            var hdrs = { 'Authorization': 'Bearer ' + session.accessToken, 'Content-Type': 'application/json' };
            var cr = await http('POST', fnBase + '/fortnite/api/game/v2/profile/' + session.accountId + '/client/QueryProfile?profileId=common_core&rvn=-1', hdrs, '{}');
            if (cr.status !== 200) { el.textContent = t('statsErrProfile').replace('{n}', cr.status); return; }
            var prof = cr.data && cr.data.profileChanges && cr.data.profileChanges[0] ? cr.data.profileChanges[0].profile : null;
            if (!prof) { el.textContent = t('statsErrRead'); return; }
            var at = (prof.stats && prof.stats.attributes) || {};
            var items2 = prof.items || {};

            el.innerHTML = '<span style="color:#888">'+t('statsLoadingBR')+'</span>';
            var at2 = {};
            try {
                var br = await http('POST', fnBase + '/fortnite/api/game/v2/profile/' + session.accountId + '/client/QueryProfile?profileId=athena&rvn=-1', hdrs, '{}');
                var p2 = br.status === 200 && br.data && br.data.profileChanges && br.data.profileChanges[0] ? br.data.profileChanges[0].profile : null;
                if (p2 && p2.stats) {at2 = p2.stats.attributes || {};}
            } catch(eA) {}

            var banned = null, banReasons = [];
            try {
                var ls = await http('GET', 'https://lightswitch-public-service-prod.ol.epicgames.com/lightswitch/api/service/Fortnite/status?accountId=' + session.accountId, { 'Authorization': 'Bearer ' + session.accessToken });
                if (ls.status === 200 && ls.data) {
                    banned = !!ls.data.banned;
                    banReasons = ls.data.banReasons || [];
                }
            } catch(eL) {}

            var stwLevel = null, stwBook = null, stwResearch = null, stwPower = null;
            try {
                var cp2 = await http('POST', fnBase + '/fortnite/api/game/v2/profile/' + session.accountId + '/client/QueryProfile?profileId=campaign&rvn=-1', hdrs, '{}');
                var pc = cp2.status === 200 && cp2.data && cp2.data.profileChanges && cp2.data.profileChanges[0] ? cp2.data.profileChanges[0].profile : null;
                if (pc && pc.stats && pc.stats.attributes) {
                    var ca = pc.stats.attributes;
                    stwLevel = ca.level;
                    if (ca.collection_book && ca.collection_book.maxBookXpLevelAchieved) {stwBook = ca.collection_book.maxBookXpLevelAchieved;}
                    if (ca.research_levels) {
                        stwResearch = ca.research_levels;
                        var rl = ca.research_levels;
                        stwPower = (rl.fortitude || 0) + (rl.offense || 0) + (rl.resistance || 0) + (rl.technology || 0);
                    }
                }
            } catch(eS) {}

            var creativeIslands = null;
            try {
                var cv = await http('POST', fnBase + '/fortnite/api/game/v2/profile/' + session.accountId + '/client/QueryProfile?profileId=creative&rvn=-1', hdrs, '{}');
                var pv = cv.status === 200 && cv.data && cv.data.profileChanges && cv.data.profileChanges[0] ? cv.data.profileChanges[0].profile : null;
                if (pv && pv.items) {
                    creativeIslands = 0;
                    for (var ck in pv.items) {
                        if ((pv.items[ck].templateId || '').indexOf('CreativePlot:') === 0) {creativeIslands++;}
                    }
                }
            } catch(eV) {}

            if (!fnggMapMem) {
                try {
                    var fm2 = await fetchFnggItems();
                    if (fm2.status === 200 && fm2.data) {
                        fnggMapMem = {};
                        for (var fk in fm2.data) {fnggMapMem[fk.toLowerCase()] = fm2.data[fk];}
                    }
                } catch(eF) {}
            }

            var country = '', nameChanges = null, lastNameChange = '', tfa = undefined;
            try {
                var ar2 = await http('GET', epicBase + '/account/api/public/account/' + session.accountId, { 'Authorization': 'Bearer ' + session.accessToken });
                if (ar2.status === 200 && ar2.data) {
                    country = ar2.data.country || '';
                    nameChanges = ar2.data.numberOfDisplayNameChanges;
                    lastNameChange = ar2.data.lastDisplayNameChange ? String(ar2.data.lastDisplayNameChange).slice(0, 10) : '';
                    tfa = ar2.data.tfaEnabled;
                }
            } catch(eB) {}

            var linked = [];
            try {
                var ex = await http('GET', epicBase + '/account/api/public/account/' + session.accountId + '/externalAuths', { 'Authorization': 'Bearer ' + session.accessToken });
                if (ex.status === 200 && Array.isArray(ex.data)) {
                    var pNames = { psn: 'PlayStation', xbl: 'Xbox', nintendo: 'Switch', steam: 'Steam', google: 'Google', github: 'GitHub', twitch: 'Twitch' };
                    for (var xi = 0; xi < ex.data.length; xi++) {linked.push(pNames[ex.data[xi].type] || ex.data[xi].type);}
                }
            } catch(eC) {}

            var vbPurchased = 0, vbFree = 0, founders = 0, hasSTW = false;
            var vbPlatforms = {};
            for (var k2 in items2) {
                var it2 = items2[k2];
                var tid2 = it2.templateId || '';
                var q2 = it2.quantity || 0;
                if (tid2.indexOf('Currency:Mtx') === 0) {
                    if (tid2 === 'Currency:MtxGiveaway' || tid2 === 'Currency:MtxComplimentary') {vbFree += q2;}
                    else {vbPurchased += q2;}
                    var plat = (it2.attributes && it2.attributes.platform) || 'Shared';
                    vbPlatforms[plat] = (vbPlatforms[plat] || 0) + q2;
                } else {
                    var b2 = tid2.split(':')[1] ? tid2.split(':')[1].toLowerCase() : '';
                    var fm = b2.match(/^founderspack_(\d)/);
                    if (fm) {founders = Math.max(founders, parseInt(fm[1], 10));}
                    if (b2 === 'campaignaccess') {hasSTW = true;}
                }
            }

            var mph = at.mtx_purchase_history || {};
            var iap = at.in_app_purchases || {};
            var gifts = at.gift_history || {};
            var purchases = mph.purchases || [];
            var vbSpent = 0;
            for (var pi = 0; pi < purchases.length; pi++) {vbSpent += purchases[pi].totalMtxPaid || 0;}

            var recent = purchases.slice().sort(function(a, b) { return new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0); }).slice(0, 5);
            el.innerHTML = '<span style="color:#888">'+t('statsLoadingItems')+'</span>';
            var cdb2 = {};
            try { cdb2 = await loadCosmetics(); } catch(eD) {}
            if (!working) {setStatus(t('importLocker'));}
            function prettyItem(p3) {
                var lr = (p3.lootResult && p3.lootResult[0]) || {};
                var bid3 = (lr.itemType || '').split(':')[1];
                if (!bid3) {return t('statsUnknownItem');}
                var low3 = bid3.toLowerCase();
                var meta3 = cdb2[low3];
                var nm = esc(meta3 && meta3.name ? meta3.name : bid3);
                var fid3 = fnggMapMem ? fnggMapMem[low3] : null;
                if (fid3 && /^[0-9]+$/.test(String(fid3))) {
                    return '<a href="https://fortnite.gg/cosmetics?id=' + fid3 + '" class="fngg-pitem" data-fid="' + fid3 + '" style="color:#ddd;text-decoration:underline">' + nm + '</a>';
                }
                return nm;
            }

            var foundersNames = { 1: 'Standard', 2: 'Deluxe', 3: 'Super Deluxe', 4: 'Limited Edition', 5: 'Ultimate Edition' };
            var seasons = (at2.past_seasons || []).slice().sort(function(a, b) { return (b.seasonNumber || 0) - (a.seasonNumber || 0); });
            var lifetimeWins = at2.lifetime_wins || 0;

            var wlArr = (typeof unsafeWindow !== 'undefined' && unsafeWindow.WishlistItems) ? unsafeWindow.WishlistItems : (window.WishlistItems || null);
            var lkArr = (typeof unsafeWindow !== 'undefined' && unsafeWindow.LockerItems) ? unsafeWindow.LockerItems : (window.LockerItems || null);
            var fidMeta = {};
            if (fnggMapMem) { for (var bidK in cdb2) { var fidK = fnggMapMem[bidK]; if (fidK !== undefined && fidK !== null) {fidMeta[String(fidK)] = cdb2[bidK];} } }
            var wlSec = '';
            if (wlArr && wlArr.length) {
                var ownedSet = {};
                if (lkArr) { for (var li2 = 0; li2 < lkArr.length; li2++) {ownedSet[String(lkArr[li2])] = 1;} }
                var wlOwnedFids = [];
                for (var wi2 = 0; wi2 < wlArr.length; wi2++) { if (ownedSet[String(wlArr[wi2])]) {wlOwnedFids.push(wlArr[wi2]);} }
                var wlBody = '<p>' + t('statsWishlistOwned').replace('{x}', wlOwnedFids.length).replace('{y}', wlArr.length) + '</p>';
                if (wlOwnedFids.length) {
                    var wlRows = wlOwnedFids.map(function(fid) {
                        var m = fidMeta[String(fid)];
                        var nm = esc(m && m.name ? m.name : ('#' + fid));
                        return '<a href="https://fortnite.gg/cosmetics?id=' + fid + '" class="fngg-pitem" data-fid="' + fid + '" style="color:#ddd;text-decoration:underline">' + nm + '</a>';
                    });
                    wlBody += '<p style="margin-top:4px">' + wlRows.join('<br>') + '</p>';
                    wlBody += '<button class="fngg-hbtn" id="fngg-wlclear" style="width:auto;height:auto;padding:5px 10px;margin-top:7px;color:#ef4444;font-weight:600;font-size:11px">' + esc(t('wlClear').replace('{n}', wlOwnedFids.length)) + '</button>';
                }
                wlSec = '<div class="ssec"><h4>' + t('statsWishlistH') + '</h4>' + wlBody + '</div>';
            }
            var colSec = '';
            if (lkArr && lkArr.length) {
                var byR = {}, byC = {}, mapped = 0;
                for (var coi = 0; coi < lkArr.length; coi++) {
                    var cm = fidMeta[String(lkArr[coi])];
                    if (!cm) {continue;}
                    mapped++;
                    var rr = cm.rarity || 'common'; byR[rr] = (byR[rr] || 0) + 1;
                    var cc2 = catOf(cm.type); byC[cc2] = (byC[cc2] || 0) + 1;
                }
                if (mapped) {
                    var rOrder = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
                    var rParts = [];
                    for (var roi = 0; roi < rOrder.length; roi++) { if (byR[rOrder[roi]]) {rParts.push(t(RAR_LABEL[rOrder[roi]]) + ': ' + byR[rOrder[roi]]);} }
                    var cParts = [];
                    for (var cj = 0; cj < IMPORT_CATS.length; cj++) { if (byC[IMPORT_CATS[cj]]) {cParts.push(t(CAT_LABEL[IMPORT_CATS[cj]]) + ': ' + byC[IMPORT_CATS[cj]]);} }
                    colSec = '<div class="ssec"><h4>' + t('statsCollectionH') + '</h4><p>' + t('statsCollectionTotal').replace('{n}', lkArr.length) + '</p>' +
                        (rParts.length ? '<p style="margin-top:4px">' + rParts.join(' • ') + '</p>' : '') +
                        (cParts.length ? '<p style="margin-top:4px" class="dim">' + cParts.join(' • ') + '</p>' : '') + '</div>';
                }
            }

            var H = '';
            H += '<a href="https://fortnite.gg/stats?player=' + encodeURIComponent(session.displayName) + '" target="_blank" class="btn btn-y" style="display:block;text-align:center;text-decoration:none;font-size:12px;padding:9px;color:#111 !important;font-weight:700">'+t('statsFullStats')+'</a>';
            H += '<div class="scards">' +
                '<div class="scard"><div class="v">' + (vbPurchased + vbFree).toLocaleString() + '</div><div class="l">'+t('statsVbucks')+'</div></div>' +
                '<div class="scard"><div class="v">' + lifetimeWins.toLocaleString() + '</div><div class="l">'+t('statsLifetimeWins')+'</div></div>' +
                '<div class="scard"><div class="v">' + (at2.accountLevel || '?') + '</div><div class="l">'+t('statsAccountLevel')+'</div></div>' +
                '<div class="scard"><div class="v">' + vbSpent.toLocaleString() + '</div><div class="l">'+t('statsVbucksSpent')+'*</div></div></div>';

            H += wlSec;
            H += colSec;

            H += '<div class="ssec"><h4>'+t('statsAccount')+'</h4><p>' +
                t('statsName')+': ' + esc(session.displayName) + '<br>' +
                t('statsId')+': <span style="cursor:pointer;text-decoration:underline" id="statsid" title="'+t('statsClickCopy')+'">' + session.accountId.slice(0, 16) + '...</span><br>' +
                (country ? t('statsCountry')+': ' + esc(country) + '<br>' : '') +
                (prof.created ? t('statsCreated')+': ' + String(prof.created).slice(0, 10) + '<br>' : '') +
                (nameChanges !== null && nameChanges !== undefined ? t('statsNameChanges')+': ' + nameChanges + (lastNameChange ? ' <span class="dim">('+t('statsLast')+': ' + lastNameChange + ')</span>' : '') + '<br>' : '') +
                (tfa !== undefined ? '2FA: ' + (tfa ? '<span style="color:#4ade80">'+t('statsEnabled')+'</span>' : '<span style="color:#ef4444">'+t('statsDisabled')+'</span>') + '<br>' : '') +
                (banned !== null ? t('statsBanStatus')+': ' + (banned ? '<span style="color:#ef4444">'+t('statsBanned')+'</span>' + (banReasons.length ? ' <span class="dim">(' + esc(banReasons.join(', ')) + ')</span>' : '') : '<span style="color:#4ade80">'+t('statsClean')+'</span>') + '<br>' : '') +
                (linked.length ? t('statsLinked')+': ' + esc(linked.join(' \u2022 ')) : '<span class="dim">'+t('statsNoLinked')+'</span>') + '</p></div>';

            var platParts = [];
            for (var pk in vbPlatforms) { if (vbPlatforms[pk] > 0) {platParts.push(pk + ': ' + vbPlatforms[pk].toLocaleString());} }
            H += '<div class="ssec"><h4>'+t('statsVbucksH')+'</h4><p>' +
                t('statsBalance')+': <strong style="color:#4ade80">' + (vbPurchased + vbFree).toLocaleString() + '</strong><br>' +
                t('statsPurchased')+': ' + vbPurchased.toLocaleString() + ' \u2022 '+t('statsFree')+': ' + vbFree.toLocaleString() +
                (platParts.length > 1 ? '<br><span class="dim">' + platParts.join(' \u2022 ') + '</span>' : '') + '</p></div>';

            var seasonNow = at2.season_num ? t('statsSeason') + ' ' + at2.season_num + ': ' + t('statsLevel') + ' ' + (at2.level || '?') + ' \u2022 ' + t('statsBP') + ' ' + (at2.book_level || '?') + (at2.book_purchased ? '' : ' <span class="dim">('+t('statsFreePass')+')</span>') : '<span class="dim">'+t('statsNoData')+'</span>';
            var bpCount = 0;
            for (var bp = 0; bp < seasons.length; bp++) { if (seasons[bp].purchasedVIP) {bpCount++;} }
            H += '<div class="ssec"><h4>'+t('statsBR')+'</h4><p>' + seasonNow + '<br>'+t('statsLifetimeWins')+': ' + lifetimeWins.toLocaleString() + '<br>'+t('statsSeasonsPlayed')+': ' + seasons.length + ' \u2022 '+t('statsBattlePasses')+': ' + bpCount + '</p></div>';

            if (seasons.length) {
                var rowsTop = [], rowsRest = [];
                for (var s2 = 0; s2 < seasons.length; s2++) {
                    var sn = seasons[s2];
                    var row = 'S' + sn.seasonNumber + ': ' + t('statsLvl') + ' ' + (sn.seasonLevel || '?') + ' \u2022 ' + (sn.numWins || 0) + ' ' + t('statsWins') + (sn.purchasedVIP ? ' \u2022 ' + t('statsBP') : '');
                    (s2 < 10 ? rowsTop : rowsRest).push(row);
                }
                H += '<div class="ssec"><h4>'+t('statsSeasonHistory')+'</h4><p>' + rowsTop.join('<br>') +
                    (rowsRest.length ? '<span id="seasrest" style="display:none"><br>' + rowsRest.join('<br>') + '</span><br><span id="seasmore" style="cursor:pointer;color:#f0db4f;text-decoration:underline">+' + rowsRest.length + ' '+t('statsMore')+'</span>' : '') + '</p></div>';
            }

            H += '<div class="ssec"><h4>'+t('statsPurchasesH')+'</h4><p>' +
                t('statsItemShopPurch')+': ' + purchases.length + ' <span class="dim">'+t('statsTracked')+'</span><br>' +
                t('statsVbucksSpent')+': ' + vbSpent.toLocaleString() + ' <span class="dim">'+t('statsTracked')+'</span><br>' +
                (iap.packages && iap.packages.length ? t('statsPacksOwned')+': ' + iap.packages.length + '<br>' : '') +
                t('statsRefundsUsed')+': ' + (mph.refundsUsed || 0) + ' \u2022 '+t('statsTicketsLeft')+': ' + (mph.refundCredits !== undefined ? mph.refundCredits : '?') + '</p></div>';

            if (recent.length) {
                var rrows = [];
                for (var r2 = 0; r2 < recent.length; r2++) {
                    var rp = recent[r2];
                    rrows.push(prettyItem(rp) + ' <span class="dim">' + (rp.totalMtxPaid || 0) + ' VB \u2022 ' + String(rp.purchaseDate || '').slice(0, 10) + '</span>');
                }
                H += '<div class="ssec"><h4>'+t('statsRecentPurch')+'</h4><p>' + rrows.join('<br>') + '</p></div>';
            }

            H += '<div class="ssec"><h4>'+t('statsGifts')+'</h4><p>'+t('statsSent')+': ' + (gifts.num_sent || 0) + ' \u2022 '+t('statsReceived')+': ' + (gifts.num_received || 0) +
                (at.allowed_to_receive_gifts === false ? '<br><span class="dim">'+t('statsReceivingDisabled')+'</span>' : '') + '</p></div>';

            var stwBits = [];
            if (hasSTW) {
                stwBits.push(t('statsOwned') + (founders ? ' \u2022 ' + foundersNames[founders] + ' ' + t('statsFoundersPack') : ''));
                if (stwLevel) {stwBits.push(t('statsCommanderLevel')+': ' + stwLevel);}
                if (stwPower !== null) {stwBits.push(t('statsResearchPower')+': ' + stwPower);}
                if (stwBook) {stwBits.push(t('statsCollectionBook')+': ' + stwBook);}
                if (stwResearch) {stwBits.push('<span class="dim">F' + (stwResearch.fortitude || 0) + ' \u2022 O' + (stwResearch.offense || 0) + ' \u2022 R' + (stwResearch.resistance || 0) + ' \u2022 T' + (stwResearch.technology || 0) + '</span>');}
            } else {
                stwBits.push('<span class="dim">'+t('statsNotOwned')+'</span>');
            }
            H += '<div class="ssec"><h4>'+t('statsSTW')+'</h4><p>' + stwBits.join('<br>') + '</p></div>';
            if (creativeIslands !== null) {
                H += '<div class="ssec"><h4>'+t('statsCreative')+'</h4><p>'+t('statsOwnIslands')+': ' + creativeIslands + '</p></div>';
            }

            var sacNow = (at.mtx_affiliate || '').trim();
            var sacLine;
            if (sacNow.toLowerCase() === SAC.toLowerCase()) {
                sacLine = esc(sacNow) + ' <span style="color:#4ade80">'+t('statsThankYou')+'</span>';
            } else if (sacNow) {
                sacLine = esc(sacNow) + '<br><span class="dim">'+t('statsSupportPitch').replace('{code}', SAC.toUpperCase())+'</span>';
            } else {
                sacLine = '<span class="dim">'+t('statsNoneSet')+' '+t('statsSupportPitch').replace('{code}', SAC.toUpperCase())+'</span>';
            }
            H += '<div class="ssec"><h4>'+t('statsCreatorCodeH')+'</h4><p>' + sacLine + '</p></div>';

            H += '<p style="margin:6px 0 0;font-size:9px;color:#555;line-height:1.4">'+t('statsFootnote')+'</p>';

            el.innerHTML = H;
            el.querySelectorAll('.ssec > h4').forEach(function(h4) {
                h4.onclick = function() { h4.parentNode.classList.toggle('collapsed'); };
            });
            el.querySelectorAll('.fngg-pitem').forEach(function(a2) {
                a2.onclick = function(ev2) {
                    ev2.preventDefault();
                    try {
                        if (typeof unsafeWindow.modal === 'function') { unsafeWindow.modal(a2.dataset.fid, 'item'); return false; }
                    } catch(eM) {}
                    window.open(a2.href, '_blank');
                    return false;
                };
            });
            var wlc = $('fngg-wlclear');
            if (wlc) {wlc.onclick = clearOwnedWishlist;}
            var smore = $('seasmore');
            if (smore) {smore.onclick = function() {
                $('seasrest').style.display = '';
                smore.style.display = 'none';
            };}
            var sid = $('statsid');
            if (sid) {sid.onclick = function() {
                navigator.clipboard.writeText(session.accountId).then(function() { toast(t('copiedShort'), 'ok'); });
            };}
            statsLoaded = true;
        } catch(e3) {
            el.textContent = t('statsErrLoad');
        } finally {
            statsLoading = false;
        }
    }
    async function clearOwnedWishlist() {
        var wl = (typeof unsafeWindow !== 'undefined' && unsafeWindow.WishlistItems) ? unsafeWindow.WishlistItems : window.WishlistItems;
        var lk = (typeof unsafeWindow !== 'undefined' && unsafeWindow.LockerItems) ? unsafeWindow.LockerItems : window.LockerItems;
        if (!wl || !lk) {return;}
        var lkset = {};
        for (var i = 0; i < lk.length; i++) {lkset[String(lk[i])] = 1;}
        var owned = [];
        for (var j = 0; j < wl.length; j++) { if (lkset[String(wl[j])]) {owned.push(wl[j]);} }
        if (!owned.length) {return;}
        if (!confirm(t('wlClearConfirm').replace('{n}', owned.length))) {return;}
        var fetchFn = (typeof unsafeWindow !== 'undefined' && unsafeWindow.fetch) ? unsafeWindow.fetch : fetch;
        for (var k = 0; k < owned.length; k++) {
            try { await fetchFn('/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'delete=' + encodeURIComponent(owned[k]), credentials: 'include' }); } catch (e) {}
            var ix = wl.indexOf(owned[k]);
            if (ix !== -1) {wl.splice(ix, 1);}
        }
        toast(t('wlCleared').replace('{n}', owned.length), 'ok');
        statsLoaded = false;
        loadAccountStats();
    }
    function markWishlistOwned() {
        if (location.pathname.toLowerCase().indexOf('/wishlist') === -1) {return;}
        var lk = (typeof unsafeWindow !== 'undefined' && unsafeWindow.LockerItems) ? unsafeWindow.LockerItems : window.LockerItems;
        var lkset = {};
        if (lk) { for (var i = 0; i < lk.length; i++) {lkset[String(lk[i])] = 1;} }
        var cards = document.querySelectorAll('#items a.item-icon');
        for (var j = 0; j < cards.length; j++) {
            cards[j].classList.toggle('fngg-wl-owned', !!lkset[String(cards[j].dataset.id)]);
        }
    }
    function checkShopWishlist() {
        if (location.pathname.toLowerCase().indexOf('/shop') === -1) {return;}
        var wl = (typeof unsafeWindow !== 'undefined' && unsafeWindow.WishlistItems) ? unsafeWindow.WishlistItems : window.WishlistItems;
        var banner = $('fngg-shopwl');
        var n = 0;
        if (wl && wl.length) {
            var wlset = {};
            for (var i = 0; i < wl.length; i++) {wlset[String(wl[i])] = 1;}
            var seen = {};
            var links = document.querySelectorAll('a[href*="/cosmetics?id="]');
            for (var j = 0; j < links.length; j++) {
                var mm = /[?&]id=(\d+)/.exec(links[j].getAttribute('href') || '');
                if (!mm) {continue;}
                if (wlset[mm[1]] && !seen[mm[1]]) { seen[mm[1]] = 1; n++; }
            }
        }
        if (!n) { if (banner) {banner.style.display = 'none';} return; }
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'fngg-shopwl';
            banner.className = 'bgnotice';
            banner.style.position = 'fixed';
            banner.style.left = '15px';
            banner.style.bottom = '15px';
            banner.style.maxWidth = '260px';
            banner.style.zIndex = '999998';
            banner.onclick = function() { location.href = '/shop?type=wishlist'; };
            document.body.appendChild(banner);
        }
        banner.style.display = '';
        banner.innerHTML = '⭐ ' + esc(t('shopWishlist').replace('{n}', n));
    }

    function endTour() {
        saveSetting('onboarded', true);
        var el = $('fngg-onb');
        if (el && el.parentNode) {el.parentNode.removeChild(el);}
    }

    function updateTour(forceStep) {
        if (IS_MOBILE) {return;}
        var el = $('fngg-onb');
        if (getSettings().onboarded && !forceStep) {
            if (el && el.parentNode) {el.parentNode.removeChild(el);}
            return;
        }
        var panel = $('fngg-panel');
        if (!panel || panel.classList.contains('min')) {
            if (el && el.parentNode) {el.parentNode.removeChild(el);}
            return;
        }
        var step = forceStep;
        if (!step) {
            if (!IS_LOCKER) {step = 'tourGo';}
            else if (pollInterval) {step = 'tour1';}
            else if (!session) {step = 'tour0';}
            else {step = 'tour2';}
        }
        if (!el) {
            el = document.createElement('div');
            el.id = 'fngg-onb';
            document.body.appendChild(el);
        }
        el.innerHTML = '<span id="onbtxt"></span><span class="skip" id="onbskip">\u2715 ' + t('tourSkip') + '</span>';
        el.querySelector('#onbtxt').textContent = t(step);
        el.querySelector('#onbskip').onclick = endTour;
        if (step === 'tour3') {
            el.querySelector('#onbskip').style.display = 'none';
            setTimeout(endTour, 6000);
        }
    }

    function updateUI() {
        updateUIInner();
        updateTour();
        positionDebug();
    }

    function updateUIInner() {
        var uel = $('usec');
        var ael = $('asec');
        if (!uel || !ael) {return;}

        if (IS_MOBILE) {
            uel.innerHTML = '<div class="ucard"><div class="ucard-placeholder">📱</div><div class="info"><div class="name">'+t('desktopOnly')+'</div><div class="status" style="color:#ef4444">'+t('notSupportedMobile')+'</div></div></div>';
            ael.innerHTML = '<div class="stxt" style="margin-top:0">'+t('mobileDesc')+'</div>';
            return;
        }

        if (!IS_LOCKER) {
            uel.innerHTML = '<div class="ucard"><div class="ucard-placeholder">🎒</div><div class="info"><div class="name">'+t('lockerImporter')+'</div><div class="status" style="color:#888">'+t('openLocker')+'</div></div></div>';
            ael.innerHTML = '<button class="btn btn-y" id="gobtn">'+t('toMyLocker')+'</button>';
            $('gobtn').onclick = function() {
                var link = document.querySelector('a[href*="/locker?id="]');
                if (link) {location.href = link.href;}
                else {toast(t('fnggLoginFirst'), 'err');}
            };
            return;
        }

        if (sessionChecking) {
            uel.innerHTML = '<div class="ucard"><div class="spin" style="margin:0;width:24px;height:24px;border-width:2px"></div><div class="info"><div class="name" style="color:#aaa">'+t('loading')+'</div><div class="status" style="color:#666">'+t('checkingSession')+'</div></div></div>';
            ael.innerHTML = '<button class="btn btn-g" disabled>'+t('importLocker')+'</button>';
            return;
        }

        if (session) {
            var avatar = session.skinIcon || LOGO;
            var minsLeft = session.ts ? Math.max(0, Math.round((SESSION_TIMEOUT - (Date.now() - session.ts)) / 60000)) : null;
            var tokenTxt = minsLeft !== null ? ' · ' + (minsLeft >= 60 ? Math.floor(minsLeft / 60) + 'h ' + (minsLeft % 60) + 'm' : minsLeft + 'm') + ' ' + t('tokenLeft') : '';

            uel.innerHTML = '<div class="ucard"><img src="'+avatar+'"><div class="info"><div class="name" id="uname" style="cursor:pointer" title="\ud83d\udd0d">'+esc(session.displayName)+'</div><div class="status">'+t('connected')+tokenTxt+'</div></div><button class="lout" id="lout">'+t('logout')+'</button></div>';
            ael.innerHTML = (bgNewCount > 0 ? '<div id="fngg-bgnotice" class="bgnotice">✨ +' + bgNewCount + ' ' + esc(t('newSinceImport')) + '</div>' : '') + '<button class="btn btn-g" id="ibtn"'+(working?' disabled':'')+'>'+btnText+'</button>' + (importFilterActive() ? '<div id="fngg-filterhint" class="filterhint">⚙ ' + esc(t('importFilterActive')) + '</div>' : '');

            $('lout').onclick = logout;
            $('ibtn').onclick = doImport;
            $('uname').onclick = toggleStatsPanel;
            var bn = $('fngg-bgnotice'); if (bn) {bn.onclick = doImport;}
            var fh = $('fngg-filterhint'); if (fh) {fh.onclick = function() { modal('setmodal', true); };}
        } else if (pollInterval) {
            uel.innerHTML = '<div class="ucard"><div class="spin" style="margin:0;width:24px;height:24px;border-width:2px"></div><div class="info"><div class="name">'+t('waitingLogin')+'</div><div class="status" style="color:#f0db4f">'+t('completeLogin')+'</div></div></div><div style="text-align:center;margin-bottom:10px"><a href="'+verifyUri+'" target="_blank" style="font-size:11px;color:#888;text-decoration:underline">'+t('loginDidntOpen')+'</a></div>';
            ael.innerHTML = '<button class="btn btn-x" id="cbtn" style="margin:0">'+t('cancel')+'</button>';
            $('cbtn').onclick = cancelLogin;
        } else {
            uel.innerHTML = '<div class="ucard"><div class="ucard-placeholder">🎮</div><div class="info"><div class="name">'+t('notConnected')+'</div><div class="status" style="color:#888">'+t('linkAccount')+'</div></div></div>';
            ael.innerHTML = '<button class="btn btn-y" id="lbtn">'+t('connect')+'</button>';
            $('lbtn').onclick = startLogin;
        }
    }

    function createUI() {
        if ($('fngg-panel')) {return;}

        var p = document.createElement('div');
        p.id = 'fngg-panel';
        var hdrBtns = (IS_LOCKER && !IS_MOBILE ? '<button class="fngg-hbtn" id="dbtn" title="'+t('debugTitle')+'">🐛</button>' : '') + (!IS_MOBILE ? '<button class="fngg-hbtn" id="setbtn" title="'+t('settings')+'">⚙</button>' : '') + '<button class="fngg-hbtn" id="ibtn2" title="'+t('infoTitle')+'">?</button>';
        p.innerHTML = '<div class="fngg-hdr"><div class="fngg-brand"><img src="'+LOGO+'"><span>'+t('panelTitle')+'</span></div><div class="fngg-btns">'+hdrBtns+'</div></div><div class="body"><div id="usec"></div><div id="asec"></div><div id="fngg-foot"><span>'+t('freeTool')+' · '+t('creatorCode')+' <b id="ccbtn" title="'+t('copyCode')+'">'+SAC.toUpperCase()+'</b></span><a id="sharebtn" title="'+t('copyLink')+'">'+t('share')+'</a></div></div>';
        document.body.appendChild(p);

        var ip = document.createElement('div');
        ip.id = 'infomodal';
        ip.className = 'fngg-m';
        ip.innerHTML = '<div class="mbox infombox"><div class="mtitle" style="text-align:center">' + esc(t('lockerImporter')) + '</div>' +
            '<div class="infogrid">' +
            '<div class="isec"><h3>'+t('infoWhatH')+'</h3><p>'+t('infoWhat')+'</p></div>' +
            '<div class="isec"><h3>'+t('infoHowH')+'</h3><p>'+t('infoHow')+'</p></div>' +
            '<div class="isec"><h3>'+t('infoSafeH')+'</h3><p>'+t('infoSafe')+'</p></div>' +
            '<div class="isec"><h3>'+t('infoTokenH')+'</h3><p>'+t('infoToken')+'</p></div>' +
            '<div class="isec"><h3>'+t('infoSupportH')+'</h3><p>'+t('infoSupport')+'</p></div>' +
            '</div>' +
            '<button class="btn btn-x" id="infoclose" style="margin-top:8px">'+t('close')+'</button></div>';
        document.body.appendChild(ip);
        ip.onclick = function(e) { if (e.target === ip) {modal('infomodal', false);} };
        $('infoclose').onclick = function() { modal('infomodal', false); };

        var wm = document.createElement('div');
        wm.id = 'fngg-watermark';
        wm.innerHTML = '<div class="wm-credit">Made with ❤️ by <a href="https://github.com/ItsReepze" target="_blank">Reepze</a></div>' +
            '<div class="wm-links"><a href="https://github.com/ItsReepze/fngg-locker-importer" target="_blank">GitHub</a> · <a href="' + GF_URL + '" target="_blank">Greasyfork</a></div>' +
            '<div class="wm-disc">Not affiliated with Epic Games or fortnite.gg · v' + VERSION + '</div>';
        document.body.appendChild(wm);

        var dp = null;
        if (IS_LOCKER && !IS_MOBILE) {
            dp = document.createElement('div');
            dp.id = 'fngg-debug';
            dp.innerHTML = '<div class="fngg-hdr"><div class="fngg-brand"><img src="'+LOGO+'"><span>'+t('debugTitle')+'</span></div><div class="fngg-btns"><button class="fngg-hbtn" id="crbtn" title="'+t('debugCopyReport')+'">📋</button></div></div><div class="body"><div class="isec"><h3>'+t('debugLastImport')+'</h3><p id="debug-stats">'+t('debugNoImport')+'</p></div><div class="isec"><h3>'+t('debugDiagnostics')+'</h3><button class="fngg-hbtn" id="diagbtn" style="width:auto;padding:0 12px;height:28px">'+t('debugRunDiag')+'</button><p id="debug-diag" style="margin-top:8px;font-family:monospace;font-size:11px;line-height:1.7"></p></div><div class="isec" style="flex:1;display:flex;flex-direction:column"><h3>'+t('debugUnrecognized')+'</h3><p style="font-size:11px;color:#888;margin-bottom:8px;line-height:1.4">'+t('debugUnrecDesc')+'</p><div id="debug-unmapped" style="font-size:11px;color:#999;overflow-y:auto;font-family:monospace;line-height:1.8;flex:1;word-break:break-all;padding:8px;background:rgba(0,0,0,.2);border-radius:6px;border:1px solid rgba(255,255,255,.05);white-space:pre-wrap">'+t('debugNoData')+'</div></div></div>';
            document.body.appendChild(dp);

            var sm = document.createElement('div');
            sm.id = 'smodal';
            sm.className = 'fngg-m';
            sm.innerHTML = '<div class="mbox"><div class="sicon">🎉</div><div class="mtitle">'+t('done')+'</div><div class="stxt2"><span id="icnt"></span>'+t('modalReady')+'<span id="icompare" style="display:none;font-size:12px"></span><span id="sacpitch"><br><br>'+t('modalSupport')+'<br><br><span style="color:#555;font-size:11px;">'+t('modalChange')+'</span></span><span id="sacthanks" style="display:none"><br><br>'+t('thanksSupport')+'</span></div><button class="btn btn-sac" id="ybtn">'+t('useCode')+'</button><button class="btn-skip" id="nbtn">'+t('withoutCode')+'</button><button class="btn btn-g" id="contbtn" style="display:none">'+t('continueBtn')+'</button><div style="margin-top:12px"><div style="font-size:10px;color:#888;margin-bottom:6px;text-transform:uppercase;letter-spacing:.4px">\ud83d\udce4 '+t('shareLocker')+'</div><div style="display:flex;gap:6px;justify-content:center"><button class="fngg-hbtn shr" data-s="x" style="width:auto;padding:0 12px" title="X / Twitter">\ud835\udd4f</button><button class="fngg-hbtn shr" data-s="reddit" style="width:auto;padding:0 12px">Reddit</button><button class="fngg-hbtn shr" data-s="wa" style="width:auto;padding:0 12px">WhatsApp</button><button class="fngg-hbtn shr" data-s="copy" style="width:auto;padding:0 12px" title="Copy">\ud83d\udccb</button></div></div><div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.06)"><a href="'+GF_URL+'/feedback" target="_blank" style="font-size:10px;color:#555;text-decoration:none">'+t('review')+'</a></div></div>';
            document.body.appendChild(sm);
        }

        var sp = null;
        if (IS_LOCKER && !IS_MOBILE) {
            sp = document.createElement('div');
            sp.id = 'fngg-stats';
            sp.innerHTML = '<div class="fngg-hdr"><div class="fngg-brand"><img src="'+LOGO+'"><span>'+t('statsTitle')+'</span></div></div><div class="body"><div class="isec"><p id="fngg-stats-body" style="font-family:monospace;font-size:11px;line-height:1.8">'+t('statsClickLoad')+'</p></div></div>';
            document.body.appendChild(sp);
            var stab = document.createElement('div');
            stab.id = 'fngg-stab';
            stab.innerHTML = '📊';
            stab.title = t('statsTitle');
            document.body.appendChild(stab);
            if (getSettings().panelMin) {stab.style.display = 'none';}
            stab.onclick = function() { toggleStats(!sp.classList.contains('show')); };
        }

        if (!IS_MOBILE) {
            var pp = document.createElement('div');
            pp.id = 'fngg-presets';
            pp.innerHTML = '<div class="fngg-hdr"><div class="fngg-brand"><img src="' + LOGO + '"><span>' + t('presetsTitle') + '</span></div></div><div class="body"><div class="isec"><p class="pdesc">' + t('presetsDesc') + '</p><div class="presave"><input id="fngg-pname" class="fngg-sel" maxlength="24" placeholder="' + t('presetsNamePrompt') + '"><button class="fngg-hbtn" id="fngg-psave">' + t('presetsSaveBtn') + '</button></div><div id="fngg-plist"></div><div class="presave" style="margin-top:10px"><button class="fngg-hbtn" id="fngg-pexport" style="flex:1">' + t('presetsExport') + '</button><button class="fngg-hbtn" id="fngg-pimport" style="flex:1">' + t('presetsImport') + '</button></div></div></div>';
            document.body.appendChild(pp);
            var ptab = document.createElement('div');
            ptab.id = 'fngg-ptab';
            ptab.innerHTML = '📑';
            ptab.title = t('presetsTitle');
            ptab.style.top = (IS_LOCKER && !IS_MOBILE) ? '148px' : '100px';
            document.body.appendChild(ptab);
            ptab.style.display = 'none';
            ptab.onclick = function() { togglePresets(!pp.classList.contains('show')); };
            var pNameInp = pp.querySelector('#fngg-pname');
            pp.querySelector('#fngg-psave').onclick = function() { if (savePreset(pNameInp.value)) {pNameInp.value = '';} };
            pNameInp.onkeydown = function(ev) { if (ev.key === 'Enter') { ev.preventDefault(); if (savePreset(pNameInp.value)) {pNameInp.value = '';} } };
            pp.querySelector('#fngg-pexport').onclick = exportPresets;
            pp.querySelector('#fngg-pimport').onclick = importPresets;
            renderPresets();
            updatePresetsVisibility();
        }

        var te = document.createElement('div');
        te.id = 'fngg-toast';
        document.body.appendChild(te);

        if (IS_LOCKER && !IS_MOBILE) {
            var ccm = document.createElement('div');
            ccm.id = 'ccmodal';
            ccm.className = 'fngg-m';
            ccm.innerHTML = '<div class="mbox" style="text-align:left"><div class="mtitle" style="text-align:center">'+t('ccTitle')+'</div>' +
                '<p style="margin:0 0 10px;font-size:11px;color:#888;line-height:1.5">'+t('ccDesc')+'</p>' +
                '<input id="ccinput" type="text" placeholder="'+t('ccPlaceholder')+'" style="width:100%;box-sizing:border-box;padding:10px;margin-bottom:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:8px;color:#fff;font-family:fn,sans-serif;font-size:13px;outline:none">' +
                '<p id="ccstatus" style="margin:0 0 10px;font-size:11px;min-height:14px"></p>' +
                '<button class="btn btn-y" id="ccapply" style="margin-bottom:6px">'+t('ccApply')+'</button>' +
                '<button class="btn btn-x" id="ccclose">'+t('close')+'</button></div>';
            document.body.appendChild(ccm);

            var ccBusy = false;
            async function applyCC() {
                if (ccBusy || !session) {return;}
                ccBusy = true;
                var val = $('ccinput').value.trim();
                var st = $('ccstatus');
                st.style.color = '#888';
                st.textContent = val ? t('ccChecking') : t('ccRemoving');
                var ok = await setSAC(val);
                if (ok) {
                    st.style.color = '#4ade80';
                    st.textContent = val ? t('ccActive').replace('{code}', val) : t('ccRemoved');
                } else {
                    st.style.color = '#ef4444';
                    st.textContent = t('ccFailed');
                }
                ccBusy = false;
            }
            $('ccapply').onclick = applyCC;
            $('ccinput').addEventListener('keydown', function(ev) { if (ev.key === 'Enter') {applyCC();} });
            $('ccclose').onclick = function() { modal('ccmodal', false); };
            ccm.onclick = function(ev) { if (ev.target === ccm) {modal('ccmodal', false);} };

            document.addEventListener('keydown', function(ev) {
                if (ev.ctrlKey && ev.altKey && ev.shiftKey && (ev.key === 'C' || ev.key === 'c')) {
                    ev.preventDefault();
                    if (!session) { toast(t('connect'), 'err'); return; }
                    $('ccstatus').textContent = '';
                    $('ccinput').value = '';
                    modal('ccmodal', true);
                    setTimeout(function() { $('ccinput').focus(); }, 100);
                }
            });
        }

        if (!IS_MOBILE) {
            var setm = document.createElement('div');
            setm.id = 'setmodal';
            setm.className = 'fngg-m';
            setm.innerHTML = '<div class="mbox setmbox"><div class="mtitle" style="text-align:center">⚙ '+t('settings')+'</div>' +
                '<div class="settop">' +
                '<div class="sgroup"><div class="secthead">'+t('settingsGeneral')+'</div>' +
                '<div class="sgrow"><div class="slbl">'+t('languageLbl')+'</div><select id="langsel" class="fngg-sel">' + langOptions() + '</select></div>' +
                '<div class="sgrow"><div class="sgrow-l"><div class="slbl">'+t('autoLogoutLbl')+'</div><div class="sdesc">'+t('autoLogoutDesc')+'</div></div><div class="tog" id="togAL"></div></div>' +
                '</div>' +
                '<div class="sgroup"><div class="secthead secthead-row">'+t('bgCheckLbl')+'<div class="tog" id="togBG"></div></div>' +
                '<div class="sdesc" style="padding:7px 12px">'+t('bgCheckDesc')+'</div>' +
                '<div id="bgSub">' +
                '<div class="sgrow"><div class="slbl">'+t('bgThresholdLbl')+'</div><input id="bgThresh" type="number" min="1" max="9999" class="fngg-sel" style="width:72px;text-align:center;padding:6px 8px"></div>' +
                '<div class="sgrow"><div class="slbl">'+t('bgIntervalLbl')+'</div><input id="bgInterval" type="number" min="1" max="1440" class="fngg-sel" style="width:72px;text-align:center;padding:6px 8px"></div>' +
                '</div></div>' +
                '</div>' +
                '<div class="sgroup"><div class="secthead">'+t('filterImportLbl')+'</div>' +
                '<div class="sdesc" style="padding:7px 12px 3px">'+t('filterImportDesc')+'</div>' +
                '<div class="sublabel">'+t('filterCosmeticsLbl')+'</div><div class="chiprow">'+chipsHTML('type',IMPORT_CATS,function(v){return t(CAT_LABEL[v]);})+'</div>' +
                '<div class="sublabel">'+t('filterRarityLbl')+'</div><div class="chiprow">'+chipsHTML('rarity',IMPORT_RARITIES,function(v){return t(RAR_LABEL[v]);})+'</div>' +
                '<div class="sublabel">'+t('filterSpecialLbl')+'</div><div class="chiprow">'+chipsHTML('series',IMPORT_SERIES,function(v){return SERIES_LABEL[v];})+'</div>' +
                '</div>' +
                '<div style="display:flex;gap:10px;margin-top:14px">' +
                '<button class="fngg-hbtn" id="tourbtn" style="flex:1;height:38px">'+t('restartTour')+'</button>' +
                '<button class="btn btn-x" id="setclose" style="flex:1;margin-top:0">'+t('close')+'</button></div></div>';
            document.body.appendChild(setm);
            bindChips(setm);

            var togAL = setm.querySelector('#togAL');
            function paintAL() {
                var s = getSettings();
                var on = s.autoLogout === undefined ? true : s.autoLogout;
                togAL.classList.toggle('on', on);
            }
            paintAL();
            togAL.onclick = function() {
                var s = getSettings();
                var on = s.autoLogout === undefined ? true : s.autoLogout;
                saveSetting('autoLogout', !on);
                paintAL();
            };

            var togBG = setm.querySelector('#togBG');
            var bgThresh = setm.querySelector('#bgThresh');
            var bgInterval = setm.querySelector('#bgInterval');
            var bgSub = setm.querySelector('#bgSub');
            function paintBG() {
                var s = getSettings();
                var on = s.bgCheck === undefined ? true : s.bgCheck;
                togBG.classList.toggle('on', on);
                if (bgSub) { bgSub.style.opacity = on ? '' : '.4'; bgSub.style.pointerEvents = on ? '' : 'none'; }
                if (bgThresh) {bgThresh.disabled = !on;}
                if (bgInterval) {bgInterval.disabled = !on;}
            }
            if (bgThresh) {bgThresh.value = parseInt(getSettings().bgThreshold, 10) || 1;}
            if (bgInterval) {bgInterval.value = parseInt(getSettings().bgInterval, 10) || 30;}
            paintBG();
            togBG.onclick = function() {
                var s = getSettings();
                var on = s.bgCheck === undefined ? true : s.bgCheck;
                saveSetting('bgCheck', !on);
                paintBG();
            };
            if (bgThresh) {bgThresh.onchange = function() {
                var v = parseInt(bgThresh.value, 10);
                if (!(v >= 1)) {v = 1;}
                if (v > 9999) {v = 9999;}
                bgThresh.value = v;
                saveSetting('bgThreshold', v);
            };}
            if (bgInterval) {bgInterval.onchange = function() {
                var v = parseInt(bgInterval.value, 10);
                if (!(v >= 1)) {v = 1;}
                if (v > 1440) {v = 1440;}
                bgInterval.value = v;
                saveSetting('bgInterval', v);
                scheduleBgCheck();
            };}

            var langSel = setm.querySelector('#langsel');
            if (langSel) {langSel.onchange = function() {
                var v = langSel.value;
                if (v === 'auto') { var s = getSettings(); delete s.lang; GM_setValue('fngg_settings', JSON.stringify(s)); }
                else {saveSetting('lang', v);}
                location.reload();
            };}

            setm.querySelector('#tourbtn').onclick = function() {
                saveSetting('onboarded', false);
                modal('setmodal', false);
                updateTour();
            };
            setm.querySelector('#setclose').onclick = function() { modal('setmodal', false); };
            setm.onclick = function(e) { if (e.target === setm) {modal('setmodal', false);} };
            $('setbtn').onclick = function() { modal('setmodal', true); };
        }

        var tab = document.createElement('div');
        tab.id = 'fngg-tab';
        tab.innerHTML = '›';
        tab.className = 'open';
        document.body.appendChild(tab);

        window.addEventListener('resize', function() { positionDebug(); });

        if (getSettings().panelMin) {
            p.classList.add('min');
            tab.classList.remove('open');
            tab.innerHTML = '‹';
        }

        var statsWasOpen = false, debugWasOpen = false, presetsWasOpen = false;
        function togglePanel() {
            var isMin = p.classList.toggle('min');
            tab.classList.toggle('open', !isMin);
            tab.innerHTML = isMin ? '‹' : '›';
            saveSetting('panelMin', isMin);

            if (isMin) {
                statsWasOpen = !!($('fngg-stats') && $('fngg-stats').classList.contains('show'));
                debugWasOpen = !!(dp && dp.classList.contains('show'));
                presetsWasOpen = !!($('fngg-presets') && $('fngg-presets').classList.contains('show'));
                if ($('fngg-stats')) {$('fngg-stats').classList.remove('show');}
                if (dp) {dp.classList.remove('show');}
                if (dtab) { dtab.style.display = 'none'; dtab.classList.remove('open'); }
                if ($('fngg-stab')) { $('fngg-stab').style.display = 'none'; $('fngg-stab').classList.remove('open'); }
                if ($('fngg-presets')) {$('fngg-presets').classList.remove('show');}
                if ($('fngg-ptab')) { $('fngg-ptab').style.display = 'none'; $('fngg-ptab').classList.remove('open'); }
            } else {
                if (dtab) {dtab.style.display = '';}
                if ($('fngg-stab')) {$('fngg-stab').style.display = '';}
                if ($('fngg-ptab')) {$('fngg-ptab').style.display = '';}
                if (debugWasOpen) {toggleDebug(true);}
                if (statsWasOpen && session) {toggleStats(true);}
                if (presetsWasOpen) {togglePresets(true);}
            }
        }

        tab.onclick = togglePanel;

        $('ccbtn').onclick = function() {
            navigator.clipboard.writeText(SAC).then(function() {
                toast(t('codeCopied'), 'ok');
            }, function() { toast(t('couldntCopy'), 'err'); });
        };
        $('sharebtn').onclick = function() {
            navigator.clipboard.writeText(GF_URL).then(function() {
                toast(t('linkCopied'), 'ok');
            }, function() { toast(t('couldntCopy'), 'err'); });
        };

        if (!IS_MOBILE) {checkForUpdate();}

        var lastSeenV = GM_getValue('lastSeenVersion', '');
        if (lastSeenV && lastSeenV !== VERSION) {toast(t('updatedTo') + VERSION, 'ok');}
        GM_setValue('lastSeenVersion', VERSION);
        $('ibtn2').onclick = function() { modal('infomodal', true); };

        if (dp) {
            var dtab = document.createElement('div');
            dtab.id = 'fngg-dtab';
            dtab.innerHTML = '🐛';
            dtab.title = t('debugTitle');
            document.body.appendChild(dtab);
            setTimeout(positionDebug, 60);

            var setDebugOpen = function(open) { toggleDebug(open); };
            if (getSettings().panelMin) {dtab.style.display = 'none';}

            dtab.onclick = function() { setDebugOpen(!dp.classList.contains('show')); };
            $('dbtn').onclick = function() { setDebugOpen(!dp.classList.contains('show')); };
            $('diagbtn').onclick = async function() {
                var out = $('debug-diag');
                out.innerHTML = t('debugRunning');
                var lines = [];
                lines.push(window.pako ? '<span style="color:#4ade80">✓</span> '+t('diagPako') : '<span style="color:#ef4444">✗</span> '+t('diagPakoBlocked'));
                var fnggLogin = location.href.match(/locker\?id=\d+/) || document.querySelector('a[href*="/locker?id="]');
                lines.push(fnggLogin ? '<span style="color:#4ade80">✓</span> '+t('diagFnggLogin') : '<span style="color:#ef4444">✗</span> '+t('diagFnggNoLogin'));
                lines.push(session ? '<span style="color:#4ade80">✓</span> '+t('diagEpicConn') : '<span style="color:#888">○</span> '+t('diagEpicNoConn'));
                out.innerHTML = lines.join('<br>') + '<br><span style="color:#888">'+t('diagChecking')+'</span>';
                try {
                    var r1 = await fetchFnggItems();
                    if (r1.status === 200) {lines.push('<span style="color:#4ade80">✓</span> '+t('diagFnggOk'));}
                    else if (r1.status === 403) {lines.push('<span style="color:#ef4444">✗</span> '+t('diagFnggBlocked'));}
                    else {lines.push('<span style="color:#ef4444">✗</span> '+t('diagFnggErr')+' (' + r1.status + ')');}
                } catch(e) { lines.push('<span style="color:#ef4444">✗</span> '+t('diagFnggUnreach')); }
                try {
                    var r2 = await http('GET', 'https://fortnite-api.com/v2/news');
                    lines.push(r2.status === 200 ? '<span style="color:#4ade80">✓</span> '+t('diagApiOk') : '<span style="color:#ef4444">✗</span> '+t('diagApiErr')+' (' + r2.status + ')');
                } catch(e) { lines.push('<span style="color:#ef4444">✗</span> '+t('diagApiUnreach')); }
                try {
                    var r3 = await http('GET', epicBase + '/account/api/oauth/verify', {});
                    lines.push((r3.status === 401 || r3.status === 200) ? '<span style="color:#4ade80">✓</span> '+t('diagEpicOk') : '<span style="color:#ef4444">✗</span> '+t('diagEpicErr')+' (' + r3.status + ')');
                } catch(e) { lines.push('<span style="color:#ef4444">✗</span> '+t('diagEpicUnreach')); }
                out.innerHTML = lines.join('<br>');
            };
            $('crbtn').onclick = function() {
                var d = null;
                try { d = JSON.parse(GM_getValue('debugData', 'null')); } catch(e) {}
                var txt = (d && d.report) ? d.report : t('debugNoImport');
                navigator.clipboard.writeText(txt).then(function() {
                    toast(t('reportCopied'), 'ok');
                }, function() { toast(t('couldntCopy'), 'err'); });
            };

            $('ybtn').onclick = async function() {
                modal('smodal', false);
                var ok = await setSAC();
                toast(ok ? t('thanksHeart') : t('couldntSetCode'), ok ? 'ok' : 'err');
                setTimeout(function() {
                    var url = $('smodal').dataset.url;
                    if (url) {location.href = url;}
                }, 800);
            };
            $('nbtn').onclick = function() {
                modal('smodal', false);
                var url = $('smodal').dataset.url;
                if (url) {location.href = url;}
            };
            $('contbtn').onclick = function() {
                modal('smodal', false);
                var url = $('smodal').dataset.url;
                if (url) {location.href = url;}
            };
            sm.querySelectorAll('.shr').forEach(function(b) {
                b.onclick = function() {
                    var lurl = sm.dataset.lockerurl || ('https://fortnite.gg' + location.pathname);
                    var t1 = t('shareText1').replace('{N}', sm.dataset.count || '');
                    var t2 = t('shareText2');
                    var tags = '#Fortnite #FortniteGG';
                    var full = t1 + ' ' + lurl + '\n\n' + t2 + ' ' + GF_URL + ' ' + tags;
                    var enc = encodeURIComponent;
                    var s = b.dataset.s;
                    if (s === 'x') {window.open('https://twitter.com/intent/tweet?text=' + enc(t1.replace(/:$/, '!') + '\n\n' + t2 + ' ' + GF_URL + ' ' + tags) + '&url=' + enc(lurl), '_blank');}
                    else if (s === 'reddit') {window.open('https://www.reddit.com/submit?url=' + enc(lurl) + '&title=' + enc(t1.replace(':', '') + ' ' + tags), '_blank');}
                    else if (s === 'wa') {window.open('https://wa.me/?text=' + enc(full), '_blank');}
                    else {navigator.clipboard.writeText(full).then(function() { toast(t('copiedShort'), 'ok'); }, function() { toast(t('couldntCopy'), 'err'); });}
                };
            });

            var debugData = GM_getValue('debugData', null);
            if (debugData) {
                try {
                    var data = JSON.parse(debugData);
                    var statsEl = $('debug-stats');
                    if (statsEl) {statsEl.innerHTML = data.stats || t('debugNoImport');}
                    var unmappedEl = $('debug-unmapped');
                    if (unmappedEl) {unmappedEl.textContent = data.unmapped || t('debugNoData');}
                } catch(e) {}
            }
        }

        function restoreSidePanel() {
            if (IS_MOBILE || getSettings().panelMin) {return;}
            positionDebug();
            var sset = getSettings();
            if (sset.debugOpen) {toggleDebug(true);}
            if (sset.statsOpen && session) {toggleStats(true);}
            if (sset.presetsOpen) {
                if (presetsEligible()) {
                    togglePresets(true);
                } else {
                    setTimeout(function() { if (getSettings().presetsOpen && presetsEligible()) {togglePresets(true);} }, 900);
                }
            }
        }

        if (IS_LOCKER && !IS_MOBILE) {initSession().then(function() { restoreSidePanel(); bgCheck(); scheduleBgCheck(); });}
        else { updateUI(); restoreSidePanel(); }

        setInterval(function() {
            if (!session || !session.ts) {return;}
            if (Date.now() - session.ts > SESSION_TIMEOUT) {
                clearSession();
                updateUI();
                toast(t('sessionExpired'), 'err');
            } else if (!working) {
                updateUI();
            }
        }, 60000);

        setTimeout(function() {
            if (GM_getValue('pendingAutoLogout', null) === 'true') {
                GM_deleteValue('pendingAutoLogout');
                clearSession();
                updateUI();
                toast(t('autoLoggedOut'), 'ok');
            }
        }, AUTO_LOGOUT_DELAY);

        if (IS_RTL) {
            ['fngg-panel','infomodal','setmodal','smodal','ccmodal','fngg-stats','fngg-debug','fngg-toast','fngg-presets','fngg-stab','fngg-dtab','fngg-ptab','fngg-watermark','fngg-onb'].forEach(function(id){ var e = $(id); if (e) {e.setAttribute('dir','rtl');} });
        }
    }

    async function initSession() {
        var s = loadSession();
        if (!s) { updateUI(); return; }
        sessionChecking = true;
        updateUI();
        try {
            var r = await httpRetry('GET', epicBase + '/account/api/oauth/verify', { 'Authorization': 'Bearer ' + s.accessToken });
            if (r.status === 200) {
                session = s;
                fetchCurrentSkin();
            }
            else {clearSession();}
        } catch(e) { clearSession(); }
        sessionChecking = false;
        updateUI();
    }

    function fetchCurrentSkin() {
        if (!session) {return;}
        try {
            var avatarImg = document.querySelector('img.avatar');
            if (avatarImg && /^https?:/.test(avatarImg.src || '')) {
                session.skinIcon = avatarImg.src;
                updateUI();
            }
        } catch(e) {}
    }

    async function startLogin() {
        if (pollInterval) {return;}
        try {
            setStatus(t('connecting'));
            var a1 = await http('POST', epicBase + '/account/api/oauth/token', {
                'Authorization': 'Basic ' + switchToken,
                'Content-Type': 'application/x-www-form-urlencoded'
            }, 'grant_type=client_credentials');
            if (a1.status !== 200) {throw 'fail';}

            var a2 = await http('POST', epicBase + '/account/api/oauth/deviceAuthorization', {
                'Authorization': 'Bearer ' + a1.data.access_token,
                'Content-Type': 'application/x-www-form-urlencoded'
            }, 'prompt=login');
            if (a2.status !== 200) {throw 'fail';}

            deviceCode = a2.data.device_code;
            verifyUri = a2.data.verification_uri_complete;
            loginExpires = Date.now() + (a2.data.expires_in || 600) * 1000;

            window.open(verifyUri, '_blank');
            currentPollInterval = POLL_INTERVAL;
            pollInterval = setInterval(pollLogin, currentPollInterval);
            updateUI();
        } catch(e) {
            setStatus(t('connect'));
            toast(t('epicFail'), 'err');
        }
    }

    async function pollLogin() {
        if (Date.now() > loginExpires) {
            cancelLogin();
            toast(t('loginExpired'), 'err');
            return;
        }
        try {
            var r = await http('POST', epicBase + '/account/api/oauth/token', {
                'Authorization': 'Basic ' + switchToken,
                'Content-Type': 'application/x-www-form-urlencoded'
            }, 'grant_type=device_code&device_code=' + deviceCode);

            if (r.status === 200 && r.data.access_token) {
                clearInterval(pollInterval); pollInterval = null;
                deviceCode = null; verifyUri = null;
                session = { accessToken: r.data.access_token, accountId: r.data.account_id, displayName: r.data.displayName, ts: Date.now() };
                saveSession(session);
                setStatus(t('importLocker'));
                updateUI();
                toast(session.displayName ? t('greeting').replace('{name}', session.displayName) : t('connected'), 'ok');
                fetchCurrentSkin();
            } else if (r.data && r.data.errorCode) {
                var ec = String(r.data.errorCode);
                if (ec.indexOf('expired') !== -1) {
                    cancelLogin();
                    toast(t('loginExpired'), 'err');
                } else if (ec.indexOf('slow_down') !== -1) {
                    currentPollInterval += 5000;
                    if (pollInterval) {
                        clearInterval(pollInterval);
                        pollInterval = setInterval(pollLogin, currentPollInterval);
                    }
                } else if (ec.indexOf('pending') === -1) {
                    cancelLogin();
                    toast(t('loginFailed'), 'err');
                }
            }
        } catch(e) {}
    }

    function cancelLogin() {
        if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
        deviceCode = null; verifyUri = null;
        setStatus(t('importLocker'));
        updateUI();
    }

    function logout() {
        clearSession(); updateUI();
        setStatus(t('importLocker'));
        toast(t('loggedOut'), 'ok');
    }

    async function setSAC(code) {
        if (!session) {return false;}
        try {
            var r = await http('POST', fnBase + '/fortnite/api/game/v2/profile/' + session.accountId + '/client/SetAffiliateName?profileId=common_core', {
                'Authorization': 'Bearer ' + session.accessToken, 'Content-Type': 'application/json'
            }, JSON.stringify({ affiliateName: code === undefined ? SAC : code }));
            return r.status === 200 || r.status === 204;
        } catch(e) { return false; }
    }

    async function loadCosmetics(silent) {
        if (cosmeticsData) {return cosmeticsData;}

        try {
            var cached = JSON.parse(GM_getValue('cosmeticsCache', 'null'));
            if (cached && cached.v === COSMETICS_SCHEMA_VERSION && cached.ts && Date.now() - cached.ts < COSMETICS_CACHE_TTL && cached.db) {
                cosmeticsData = cached.db;
                return cosmeticsData;
            }
        } catch(e) {}

        var db = {};
        var loaded = 0, brOk = false;

        var eps = [['br', null], ['cars', 'car'], ['instruments', 'guitar'], ['tracks', 'jamtrack'], ['lego/kits', 'legokit'], ['lego', 'legokit']];
        for (var i = 0; i < eps.length; i++) {
            if (!silent) {setStatus(t('loadingCosmetics') + ' (' + (i+1) + '/' + eps.length + ')...');}
            try {
                var r = await http('GET', 'https://fortnite-api.com/v2/cosmetics/' + eps[i][0]);
                if (r.status !== 200 || !r.data || !r.data.data) {continue;}
                loaded++;
                if (i === 0) {brOk = true;}
                for (var j = 0; j < r.data.data.length; j++) {
                    var item = r.data.data[j];
                    var id = item.id ? item.id.toLowerCase() : null;
                    if (!id || db[id]) {continue;}

                    var rar = (item.rarity && item.rarity.value) ? item.rarity.value.toLowerCase() : 'common';
                    var ser = (item.series && item.series.value) ? item.series.value : null;

                    var srars = ['starwars','marvel','dc','icon','gaming','frozen','lava','shadow','slurp','dark'];
                    if (srars.indexOf(rar) !== -1) {
                        ser = rar;
                        var bv = (item.rarity && item.rarity.backendValue) || '';
                        if (bv.indexOf('Legendary') !== -1) {rar = 'legendary';}
                        else if (bv.indexOf('Epic') !== -1) {rar = 'epic';}
                        else if (bv.indexOf('Rare') !== -1) {rar = 'rare';}
                        else if (bv.indexOf('Uncommon') !== -1) {rar = 'uncommon';}
                        else {rar = 'common';}
                    }

                    db[id] = {
                        name: item.name || id,
                        type: normalizeType(item.type ? item.type.value : null) || eps[i][1] || 'unknown',
                        rarity: rar, series: ser
                    };
                }
            } catch(e) {}
        }
        if (loaded > 0 && brOk) {
            cosmeticsData = db;
            try { GM_setValue('cosmeticsCache', JSON.stringify({ v: COSMETICS_SCHEMA_VERSION, ts: Date.now(), db: db })); } catch(e) {}
        }
        return db;
    }

    var bgNewCount = 0;

    async function countOwnedItems() {
        if (!session) {return null;}
        var cdb = await loadCosmetics(true);
        var fr = await fetchFnggItems();
        if (fr.status !== 200) {return null;}
        var fngg = {};
        for (var k in fr.data) {fngg[k.toLowerCase()] = parseInt(fr.data[k], 10);}
        var hdrs = { 'Authorization': 'Bearer ' + session.accessToken, 'Content-Type': 'application/json' };
        var ar = await httpRetry('POST', fnBase + '/fortnite/api/game/v2/profile/' + session.accountId + '/client/QueryProfile?profileId=athena&rvn=-1', hdrs, '{}');
        if (ar.status !== 200) {return null;}
        var ap = ar.data && ar.data.profileChanges && ar.data.profileChanges[0] ? ar.data.profileChanges[0].profile : null;
        var ai = (ap && ap.items) || {};
        var ci = {};
        try {
            var cr = await httpRetry('POST', fnBase + '/fortnite/api/game/v2/profile/' + session.accountId + '/client/QueryProfile?profileId=common_core&rvn=-1', hdrs, '{}');
            if (cr.status === 200) {
                var cp = cr.data && cr.data.profileChanges && cr.data.profileChanges[0] ? cr.data.profileChanges[0].profile : null;
                ci = (cp && cp.items) || {};
            }
        } catch(e) {}
        var items = [], seen = {}, skipped = { noBid: 0, noMapping: 0, duplicate: 0 }, unmapped = [], prefix = {};
        items = items.concat(processItemsFromProfile(ai, fngg, cdb, seen, skipped, unmapped, prefix));
        items = items.concat(processItemsFromProfile(ci, fngg, cdb, seen, skipped, unmapped, prefix));
        items = applyImportFilter(items);
        return items.length;
    }

    async function bgCheck() {
        var s = getSettings();
        if (s.bgCheck === false) {return;}
        if (!session || !IS_LOCKER || working) {return;}
        var baseline = parseInt(GM_getValue('lastImportCount', '0'), 10) || 0;
        if (baseline <= 0) {return;}
        var threshold = parseInt(s.bgThreshold, 10); if (!(threshold >= 1)) {threshold = 1;}
        try {
            var cur = await countOwnedItems();
            if (cur === null || working || !session) {return;}
            var delta = cur - baseline;
            if (delta >= threshold) { bgNewCount = delta; updateUI(); }
        } catch(e) {}
    }

    var bgTimer = null;
    function scheduleBgCheck() {
        if (bgTimer) { clearInterval(bgTimer); bgTimer = null; }
        var mins = parseInt(getSettings().bgInterval, 10); if (!(mins >= 1)) {mins = 30;}
        bgTimer = setInterval(bgCheck, mins * 60000);
    }

    async function doImport() {
        if (working || !session) {return;}
        bgNewCount = 0;
        working = true; updateUI();

        try {
            if (!window.pako) {
                setStatus(t('importLocker'));
                toast(t('pakoBlocked'), 'err');
                working = false; updateUI();
                return;
            }

            setStatus(t('checkingFngg'));
            var fnggId = null;
            var urlMatch = location.href.match(/locker\?id=(\d+)/);
            if (urlMatch) {
                fnggId = urlMatch[1];
            }
            if (!fnggId) {
                var lockerLink = document.querySelector('a[href*="/locker?id="]');
                var linkMatch = lockerLink && lockerLink.href.match(/locker\?id=(\d+)/);
                if (linkMatch) {fnggId = linkMatch[1];}
            }
            if (!fnggId) {
                working = false; setStatus(t('tryAgain')); updateUI();
                toast(t('fnggLoginFirst'), 'err');
                return;
            }

            var cdb = await loadCosmetics();

            setStatus(t('gettingItems'));
            var fr = await fetchFnggItems();
            if (fr.status !== 200) {
                working = false; setStatus(t('tryAgain')); updateUI();
                toast(fr.status === 403 ? t('fnggBlocked') : t('fnggUnreachable'), 'err');
                return;
            }
            var fngg = {};
            for (var k in fr.data) {fngg[k.toLowerCase()] = parseInt(fr.data[k], 10);}

            setStatus(t('loadingLocker'));
            var ar = await httpRetry('POST', fnBase + '/fortnite/api/game/v2/profile/' + session.accountId + '/client/QueryProfile?profileId=athena&rvn=-1', {
                'Authorization': 'Bearer ' + session.accessToken, 'Content-Type': 'application/json'
            }, '{}');

            if (ar.status === 401) { working = false; clearSession(); setStatus(t('importLocker')); updateUI(); toast(t('sessionExpired'), 'err'); return; }
            if (ar.status !== 200) { working = false; setStatus(t('importLocker')); updateUI(); toast('Epic API error (' + ar.status + ')', 'err'); return; }

            var ap = ar.data && ar.data.profileChanges && ar.data.profileChanges[0] ? ar.data.profileChanges[0].profile : null;
            var ai = (ap && ap.items) || {};
            var created = (ap && ap.created) ? ap.created.split('T')[0] : '2017-01-01';

            setStatus(t('loadingBanners'));
            var ci = {}, currentSAC = null;
            try {
                var cr = await httpRetry('POST', fnBase + '/fortnite/api/game/v2/profile/' + session.accountId + '/client/QueryProfile?profileId=common_core&rvn=-1', {
                    'Authorization': 'Bearer ' + session.accessToken, 'Content-Type': 'application/json'
                }, '{}');
                if (cr.status === 200) {
                    var cp = cr.data && cr.data.profileChanges && cr.data.profileChanges[0] ? cr.data.profileChanges[0].profile : null;
                    ci = (cp && cp.items) || {};
                    currentSAC = (cp && cp.stats && cp.stats.attributes) ? cp.stats.attributes.mtx_affiliate : null;
                } else if (cr.status === 401) { working = false; clearSession(); setStatus(t('importLocker')); updateUI(); toast(t('sessionExpired'), 'err'); return; }
            } catch(e) {}

            setStatus(t('processing'));
            var items = [];
            var skipped = { noBid: 0, noMapping: 0, duplicate: 0 };
            var unmappedItems = [];
            var seen = {};
            var prefixStats = {};

            items = items.concat(processItemsFromProfile(ai, fngg, cdb, seen, skipped, unmappedItems, prefixStats));
            items = items.concat(processItemsFromProfile(ci, fngg, cdb, seen, skipped, unmappedItems, prefixStats));
            items = applyImportFilter(items);

            if (!items.length) { working = false; setStatus(t('tryAgain')); updateUI(); toast(t('noItems'), 'err'); return; }

            var grouped = { quest: 0, vehicle: 0, system: 0 };
            var unrecognized = [];
            for (var u = 0; u < unmappedItems.length; u++) {
                var uid = unmappedItems[u];
                if (/quest|challenge|bundle|punchcard|mission|daily|dailies|mastery|^q_|milestonescard/.test(uid)) {grouped.quest++;}
                else if (/^vtid_|^wheel_|^carbody_|^vehicle/.test(uid)) {grouped.vehicle++;}
                else if (/token|schedule|granter|generic_instance|passdata|jobboard|^iatid_|^prereq|^conditional|cosmos|season|^sparks_|^homebase|^stat_|currency|defaultcolor|^founder|^campaign|^galileo|seasonasset|musicpass|rocketpass|victorycrown|mtxpurchased|^junoaddon|battlepassgb|^companion_reactfx|^brs\d|^storm$|^tofugarden|^defaultvictory/.test(uid)) {grouped.system++;}
                else {unrecognized.push(uid);}
            }

            var totalItems = items.length;
            var totalProcessed = totalItems + skipped.noBid + skipped.noMapping + skipped.duplicate;

            var existingSet = {};
            try {
                var pageItems = (typeof unsafeWindow !== 'undefined' && unsafeWindow.LockerItems) ? unsafeWindow.LockerItems : window.LockerItems;
                if (pageItems && Array.isArray(pageItems)) {
                    for (var li = 0; li < pageItems.length; li++) {existingSet[pageItems[li]] = true;}
                }
            } catch(e) {}
            var hasExisting = Object.keys(existingSet).length > 0;
            var newCount = 0;
            if (hasExisting) {
                for (var n = 0; n < items.length; n++) { if (!existingSet[items[n].fid]) {newCount++;} }
            } else {
                var lastCount = parseInt(GM_getValue('lastImportCount', '0'), 10) || 0;
                newCount = lastCount > 0 ? Math.max(0, totalItems - lastCount) : 0;
            }
            var alreadyCount = hasExisting ? totalItems - newCount : 0;
            GM_setValue('lastImportCount', String(totalItems));

            var statsHTML =
                '<strong style="color:#4ade80">✓ ' + t('impItems').replace('{n}', totalItems) + '</strong><br>' +
                (hasExisting ? '<span style="color:#f0db4f">★ ' + t('impNew').replace('{n}', newCount) + ' \u2022 ' + t('impAlready').replace('{n}', alreadyCount) + '</span><br>' : '') +
                '<span style="color:#888">' + t('impProcessed') + ': ' + totalProcessed + '</span><br><br>' +
                '<strong style="color:#f0db4f">\u26a0 ' + t('impSkipped').replace('{n}', skipped.noMapping) + '</strong><br>' +
                '<span style="color:#888">' + t('impQuests') + ': ' + grouped.quest + ' \u2022 ' + t('impVehicles') + ': ' + grouped.vehicle + '<br>' +
                t('impSystem') + ': ' + grouped.system + ' \u2022 ' + t('impUnrecognized') + ': ' + unrecognized.length + '<br>' +
                t('impDuplicates') + ': ' + skipped.duplicate + ' \u2022 ' + t('impInvalid') + ': ' + skipped.noBid + '</span>';

            var unmappedHTML = unrecognized.length > 0
                ? unrecognized.join('\n')
                : t('impNothingUnrec');

            var report = 'FNGG Locker Importer v' + VERSION + '\n' +
                'Date: ' + new Date().toISOString() + '\n' +
                'Browser: ' + navigator.userAgent + '\n\n' +
                'Imported: ' + totalItems + ' / Processed: ' + totalProcessed + '\n' +
                'Skipped: quests=' + grouped.quest + ', vehicles=' + grouped.vehicle + ', system=' + grouped.system + ', duplicates=' + skipped.duplicate + ', invalid=' + skipped.noBid + '\n\n' +
                (hasExisting ? 'Locker compare: ' + newCount + ' new, ' + alreadyCount + ' existing\n' : '') +
                'Skipped templateId types: ' + Object.keys(prefixStats).map(function(k) { return k + '=' + prefixStats[k]; }).join(', ') + '\n\n' +
                'Unrecognized (' + unrecognized.length + '):\n' + (unrecognized.join('\n') || '-');

            var statsEl = $('debug-stats');
            if (statsEl) {statsEl.innerHTML = statsHTML;}
            var unmappedEl = $('debug-unmapped');
            if (unmappedEl) {unmappedEl.textContent = unmappedHTML;}

            GM_setValue('debugData', JSON.stringify({ stats: statsHTML, unmapped: unmappedHTML, report: report }));

            setStatus(t('sorting'));
            items.sort(function(a, b) {
                var ta = typeOrder[a.type] !== undefined ? typeOrder[a.type] : 99;
                var tb = typeOrder[b.type] !== undefined ? typeOrder[b.type] : 99;
                if (ta !== tb) {return ta - tb;}
                if (ta === 17) {
                    var ia = instrumentSort[a.type] || 99, ib = instrumentSort[b.type] || 99;
                    if (ia !== ib) {return ia - ib;}
                }
                if (ta === 18) {
                    var ra = racingSort[a.type] || 99, rb = racingSort[b.type] || 99;
                    if (ra !== rb) {return ra - rb;}
                }
                var sc = getScore(b) - getScore(a);
                if (sc !== 0) {return sc;}
                return (a.name || '').localeCompare(b.name || '');
            });

            setStatus(t('building'));
            var ids = [];
            for (var i = 0; i < items.length; i++) {ids.push(items[i].fid);}

            ids.sort(function(a, b) { return a - b; });

            var diffs = [];
            for (i = 0; i < ids.length; i++) {diffs.push(i === 0 ? ids[i] : ids[i] - ids[i-1]);}

            var str = created + ',' + diffs.join(',');
            var comp = window.pako.deflateRaw(str, { level: 9 });
            var bin = '';
            for (i = 0; i < comp.length; i += 8192) {
                bin += String.fromCharCode.apply(null, comp.subarray(i, i + 8192));
            }
            var b64 = btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');

            var importUrl = 'https://fortnite.gg/locker?id=' + fnggId + '&import=' + b64;

            if (importUrl.length > 32000) {
                setStatus(t('lockerTooLarge'));
                toast(t('lockerTooLarge') + ' (' + items.length + ')', 'err');
                working = false; updateUI();
                return;
            }

            if (totalProcessed > 500 && totalItems < totalProcessed * 0.2) {
                toast(t('warnFewMatches'), 'err');
            }

            if (hasExisting) {
                setStatus(t('done') + ' +' + newCount + t('newSuffix'));
                toast(totalItems + ' ' + t('totalWord') + ' \u2022 +' + newCount + ' ' + t('addedWord') + ' \u2022 ' + alreadyCount + ' ' + t('alreadyInLocker'), 'ok');
            } else {
                var diffTxt = newCount > 0 ? ' (+' + newCount + t('newSuffix') + ')' : '';
                setStatus(t('done') + ' ' + items.length);
                toast(items.length + t('itemsImported') + diffTxt, 'ok');
            }
            working = false; updateUI();

            var already = typeof currentSAC === 'string' && currentSAC.trim().toLowerCase() === SAC.toLowerCase();

            var s = getSettings();
            if (s.autoLogout === undefined || s.autoLogout) {GM_setValue('pendingAutoLogout', 'true');}

            $('smodal').dataset.url = importUrl;
            $('smodal').dataset.lockerurl = 'https://fortnite.gg/locker?id=' + fnggId;
            $('smodal').dataset.count = String(items.length);
            var countEl = $('icnt');
            if (countEl) {countEl.innerHTML = '<strong>' + items.length + '</strong>';}
            var cmpEl = $('icompare');
            if (cmpEl) {
                if (hasExisting) {
                    cmpEl.style.display = '';
                    cmpEl.innerHTML = '<br><span style="color:#4ade80">+' + newCount + ' ' + t('addedWord') + '</span><span style="color:#666"> \u2022 ' + alreadyCount + ' ' + t('alreadyInLocker') + '</span>';
                } else if (newCount > 0) {
                    cmpEl.style.display = '';
                    cmpEl.innerHTML = '<br><span style="color:#4ade80">+' + newCount + t('newSuffix') + '</span>';
                } else {
                    cmpEl.style.display = 'none';
                }
            }
            $('sacpitch').style.display = already ? 'none' : '';
            $('sacthanks').style.display = already ? '' : 'none';
            $('ybtn').style.display = already ? 'none' : '';
            $('nbtn').style.display = already ? 'none' : '';
            $('contbtn').style.display = already ? '' : 'none';
            setTimeout(function() { modal('smodal', true); }, 400);
            if (!getSettings().onboarded) {
                saveSetting('onboarded', true);
                updateTour('tour3');
            }
        } catch(e) {
            var msg = (e && typeof e === 'string') ? e : t('importFailed');
            working = false; setStatus(t('tryAgain')); updateUI();
            toast(msg, 'err');
        }
    }

    async function boot() {
        try { await ensureLocale(LANG); } catch(e) {}
        createUI();
        initChapterFilters();
    }

    if (document.readyState === 'loading') {document.addEventListener('DOMContentLoaded', boot);}
    else {boot();}
})();
