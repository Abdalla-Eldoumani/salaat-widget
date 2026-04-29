# Configuration

All settings are stored in a JSON file managed by `tauri-plugin-store`. You don't need to edit this file by hand - the settings panel covers everything. But if you want to know what each option does, here it is.

## Location

| Setting | Type | Default | What it does |
|---------|------|---------|--------------|
| `autoDetectLocation` | boolean | `true` | Uses your IP address to find your city via ipapi.co. Turn this off if you're behind a VPN or want to set your location manually. |
| `latitude` | number | `51.0447` | Latitude in decimal degrees. Positive = north. |
| `longitude` | number | `-114.0719` | Longitude in decimal degrees. Positive = east. |
| `timezone` | string | `America/Edmonton` | IANA timezone name. Used for display only - prayer calculations use the system clock. |
| `locationName` | string | `Calgary, AB` | Human-readable label shown in settings and onboarding. Format: `City, CountryCode`. |

If auto-detect is off, you pick from a list of ~130 cities (see `src/lib/cities.ts`). To add your city, add an entry to that file with `name`, `country`, `countryCode`, `lat`, `lon`, and `timezone`.

## Calculation method

| Setting | Type | Default | What it does |
|---------|------|---------|--------------|
| `calculationMethod` | string | `ISNA` | Which organization's angle convention to use for Fajr and Isha. |
| `madhab` | string | `Shafi` | Affects Asr time. `Shafi` = shadow equals object height. `Hanafi` = shadow equals double object height. |
| `highLatitudeRule` | string | `MiddleOfTheNight` | How to calculate Fajr/Isha at extreme latitudes (above ~48°) in summer when twilight never fully ends. |

### Available methods

| Method | Fajr angle | Isha angle | Region |
|--------|-----------|-----------|--------|
| ISNA | 15° | 15° | North America |
| MuslimWorldLeague | 18° | 17° | Europe, Far East |
| Egyptian | 19.5° | 17.5° | Africa, Syria, Malaysia |
| Karachi | 18° | 18° | Pakistan, India, Bangladesh |
| UmmAlQura | 18.5° | 90min after Maghrib | Arabian Peninsula |
| Dubai | 18.2° | 18.2° | UAE |
| MoonsightingCommittee | 18° | varies | Moonsighting methodology |
| Kuwait | 18° | 17.5° | Kuwait |
| Qatar | modified | modified | Qatar |
| Singapore | 20° | 18° | Singapore, Malaysia |
| Tehran | 17.7° | 14° | Iran |
| Turkey | 18° | 17° | Turkey |

### High-latitude rules

At latitudes above 48°, Fajr and Isha can get very late or very early (or undefined) during summer. The high-latitude rule decides what to do:

- **Middle of the night** - Splits the night in half. Fajr/Isha are never later/earlier than the midpoint.
- **Seventh of the night** - Uses 1/7th of the night for Fajr and Isha.
- **Twilight angle** - Uses a reduced twilight angle.

This setting only appears during onboarding if your latitude is above 48°. You can always change it in settings.

## Notifications and audio

| Setting | Type | Default | What it does |
|---------|------|---------|--------------|
| `notificationsEnabled` | boolean | `true` | Show a native OS notification when each prayer time arrives. |
| `adhanEnabled` | boolean | `true` | Play the adhan audio at prayer times. |
| `adhanReciter` | string | `adhan-makkah` | Which reciter to use. See table below. |
| `mutedPrayers` | string[] | `[]` | List of prayer names to skip adhan for. e.g. `["sunrise", "dhuhr"]`. |

### Available reciters

| Key | Name |
|-----|------|
| `adhan-makkah` | Makkah |
| `adhan-madinah` | Madinah |
| `adhan-alaqsa` | Al-Aqsa |
| `adhan-abdul-basit` | Abdul Basit |
| `adhan-minshawi` | Minshawi |
| `adhan-egypt` | Egypt |

The reciter dropdown only appears when adhan audio is enabled.

### Mute hierarchy

There are three independent mute controls. They compose:

| Control | Scope | Persistence | Where to find it |
|---------|-------|-------------|------------------|
| Adhan audio toggle | Permanently disable all adhan playback | Stored in settings | Settings panel, Notifications section |
| Per-prayer mute (`mutedPrayers`) | Permanently silence specific prayers | Stored in settings | Settings panel, "Mute individual prayers" |
| Global mute (now) | Temporarily silence all adhan | Backend state, not stored | Speaker icon on the widget, tray menu, settings panel "Mute now" row |

If the Adhan audio toggle is off, nothing plays regardless of mute state. If it's on, per-prayer mute filters which prayers can play, and global mute is the final on/off applied at playback time. The tray icon turns red when global mute is on.

Audio is played through Rust's rodio crate, not the browser. This means it keeps playing even if the widget loses focus.

## Display

| Setting | Type | Default | What it does |
|---------|------|---------|--------------|
| `timeFormat` | string | `12h` | `12h` for AM/PM, `24h` for military time. |
| `showCountdown` | boolean | `true` | Show the "Next · Maghrib in 2h 15m" countdown. |
| `theme` | string | `dark` | Only dark is implemented. Reserved for future light/system themes. |

## System

| Setting | Type | Default | What it does |
|---------|------|---------|--------------|
| `dockEdge` | string | `top` | Which screen edge the widget snaps to. `top`, `bottom`, `left`, `right`, or `floating`. |
| `alwaysOnTop` | boolean | `true` | Keep the widget above other windows. |
| `autostart` | boolean | `false` | Launch the widget when you log in. Uses the OS-native autostart mechanism. |

## Hide vs quit

Hiding the widget keeps the process running in the tray; quitting stops it. There are three ways to hide:

- The minus button beside the gold drag grip on the widget itself
- A click on the tray icon
- The `Ctrl+Shift+P` global shortcut

All three put the widget out of sight without stopping prayer notifications or the adhan. To bring it back, click the tray icon or press the shortcut again.

To fully exit, right-click the tray icon and choose **Quit**. After quitting, you'll need to launch the app again to start receiving prayer notifications.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Toggle widget visibility |
| `Escape` | Close the settings panel |
