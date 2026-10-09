# Configuration

All settings are stored in a JSON file managed by `tauri-plugin-store`. You don't need to edit this file by hand - the settings panel covers everything. But if you want to know what each option does, here it is.

## Location

| Setting | Type | Default | What it does |
|---------|------|---------|--------------|
| `autoDetectLocation` | boolean | `true` | Looks up an approximate location from your IP address through ipapi.co each time the app starts, which sends that address to the service. Turn it off if you use a VPN or want to choose a city. |
| `latitude` | number | `51.0447` | Latitude in decimal degrees. Positive = north. |
| `longitude` | number | `-114.0719` | Longitude in decimal degrees. Positive = east. |
| `locationName` | string | `Calgary, CA` | Label shown in settings and onboarding. Format: `City, CountryCode`. |

The saved latitude, longitude, and name change only when a detection succeeds or you choose a city. If detection fails (offline, rate limited, a bad response), prayer times keep using the saved location and settings says why.

If auto-detect is off, you pick from a list of 131 cities (see `src/lib/cities.ts`). To add your city, add an entry to that file with `name`, `country`, `countryCode`, `lat`, and `lon`. Times come from the coordinates and the system clock, so no timezone is stored.

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
| MoonsightingCommittee | seasonal | seasonal | Moonsighting methodology |
| Kuwait | 18° | 17.5° | Kuwait |
| Qatar | 18° | 90 min after Maghrib | Qatar |
| Singapore | 20° | 18° | Singapore, Malaysia |
| Tehran | 17.7° | 14° (Maghrib at 4.5°) | Iran |
| Turkey | 18° | 17° | Turkey |

The `adhan` library adds the small per-method adjustments that each organisation publishes, for example one minute to Dhuhr under ISNA, Muslim World League, Egyptian, and Karachi. The settings screen shows the angles but not these offsets.

### High-latitude rules

At latitudes above about 48°, twilight in summer can be so long that the angle-based Fajr and Isha fall absurdly far from the night, or do not exist. The rule sets a limit measured from sunrise and sunset, and Fajr or Isha is moved to the limit when the angle-based time is undefined or goes past it:

- **Middle of the night** - The limit is half the night. Fajr is never earlier than the midpoint of the night, and Isha never later.
- **Seventh of the night** - The limit is one seventh of the night after sunset for Isha and before sunrise for Fajr.
- **Twilight angle** - The limit is the method's twilight angle divided by 60, as a fraction of the night.

Onboarding shows this setting only when your latitude is above 48°. It is always available in settings. The Moonsighting Committee method uses its own seasonal rule and ignores this setting.

Near the polar circle, some times can still be undefined for a few days. The widget shows `--:--` for those and skips them when it picks the next prayer.

## Notifications and audio

| Setting | Type | Default | What it does |
|---------|------|---------|--------------|
| `notificationsEnabled` | boolean | `true` | Show a native OS notification when each prayer time arrives. |
| `adhanEnabled` | boolean | `true` | Play the adhan audio at prayer times. |
| `adhanReciter` | string | `adhan-makkah` | Which reciter to use. See table below. |
| `mutedPrayers` | string[] | `[]` | Prayers that play no adhan, for example `["fajr", "dhuhr"]`. Sunrise has no adhan to mute. |

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
| Per-prayer mute (`mutedPrayers`) | Permanently silence specific prayers | Stored in settings | Settings panel, "Adhan for each prayer" |
| Global mute (now) | Temporarily silence all adhan | Backend state, not stored | Speaker icon on the widget, tray menu, settings panel "Mute now" row |

If the Adhan audio toggle is off, nothing plays regardless of mute state. If it's on, per-prayer mute filters which prayers can play, and global mute is the final on/off applied at playback time. The tray icon changes to a muted variant when global mute is on.

Audio is played through Rust's rodio crate, not the browser. This means it keeps playing even if the widget loses focus.

## Display

| Setting | Type | Default | What it does |
|---------|------|---------|--------------|
| `timeFormat` | string | `12h` | `12h` for AM/PM, `24h` for military time. |
| `showCountdown` | boolean | `true` | Show the time left to the next prayer, for example "Maghrib in 2h 15m". |

The colours follow the operating system's light or dark setting. There is no theme setting.

## System

| Setting | Type | Default | What it does |
|---------|------|---------|--------------|
| `dockEdge` | string | `top` | Which screen edge the widget snaps to. `top`, `bottom`, `left`, `right`, or `floating`. |
| `alwaysOnTop` | boolean | `true` | Keep the widget above other windows. |
| `autostart` | boolean | `false` | Launch the widget when you log in. Uses the OS-native autostart mechanism. |

## Hide vs quit

Hiding the widget keeps the process running in the tray; quitting stops it. There are three ways to hide:

- The minus button on the widget itself
- A click on the tray icon
- The `Ctrl+Shift+P` global shortcut

All three put the widget out of sight without stopping prayer notifications or the adhan. To bring it back, click the tray icon or press the shortcut again.

To fully exit, right-click the tray icon and choose **Quit**. After quitting, you'll need to launch the app again to start receiving prayer notifications.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Toggle widget visibility |
| `Escape` | Close the settings panel |
