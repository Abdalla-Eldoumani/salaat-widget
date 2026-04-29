# Architecture

How the frontend and backend work together, and where to look when you want to change something.

## Two halves

The app has a React frontend (renders the UI, calculates prayer times) and a Rust backend (plays audio, sends notifications, manages the system tray). They talk over Tauri's IPC bridge.

```
Frontend (React, runs in webview)        Backend (Rust, runs natively)
────────────────────────────────         ────────────────────────────

adhan-js calculates prayer times  ──►    set_prayer_times command
                                         Stores times in SchedulerState
                                         30-second timer loop checks them

                                  ◄──    "prayer-time" event when time hits
                                         Native OS notification (if enabled)
                                         Plays adhan via rodio (if not muted)

Window position (JS Window API)   ──►    set_position / set_size
Settings UI                       ──►    tauri-plugin-store (JSON file)
```

Prayer math lives in the frontend because `adhan` is a JavaScript library. The backend handles everything that needs to work when the webview is out of focus: audio playback, scheduled checks, and system notifications.

## Frontend structure

```
src/
├── App.tsx                  Routes between onboarding, settings, and widget views
├── hooks/
│   ├── usePrayerTimes.ts    Wraps adhan-js, pushes times to backend
│   ├── useCountdown.ts      Ticks every second, formats "2h 15m"
│   ├── useWindowDock.ts     Snap-to-edge logic, layout switching
│   ├── useSettings.ts       LazyStore wrapper, loads/saves settings
│   └── useGeolocation.ts    IP-based location via ipapi.co
├── components/
│   ├── PrayerTimesBar.tsx   Horizontal layout (top/bottom edge)
│   ├── PrayerTimesSidebar.tsx  Vertical layout (left/right edge)
│   ├── PrayerTimesCompact.tsx  Floating compact layout
│   ├── PrayerCard.tsx       Single prayer time display
│   ├── CountdownTimer.tsx   "Next · Maghrib in 2h 15m"
│   ├── DragHandle.tsx       Grip lines for window dragging
│   ├── SettingsPanel.tsx    Full settings UI (400x540 overlay)
│   ├── Switch.tsx           Toggle switch primitive (DPI-stable thumb)
│   ├── Onboarding.tsx       Three-step first-launch flow
│   ├── MuteButton.tsx       Speaker icon, toggles backend mute
│   ├── SettingsButton.tsx   Gear icon
│   └── ArabesqueDivider.tsx Decorative line divider
├── lib/
│   ├── prayer-calculator.ts Maps our settings to adhan-js calls
│   ├── dock-engine.ts       Pure math: edge detection, snap positions
│   ├── constants.ts         Defaults, method metadata, prayer names
│   ├── cities.ts            ~130 cities with coordinates/timezones
│   └── geo-utils.ts         Haversine distance formula
└── types/
    └── index.ts             All shared TypeScript types
```

### Layout system

The widget has three visual layouts, picked by dock position:

| Dock edge | Layout | Size | Component |
|-----------|--------|------|-----------|
| top, bottom | horizontal | 560x60 | PrayerTimesBar |
| left, right | vertical | 200x420 | PrayerTimesSidebar |
| floating | compact | 240x280 | PrayerTimesCompact |

`useWindowDock` detects which edge the window is near after a drag ends, then snaps it into position and switches the layout. The threshold is 40 logical pixels. Window resizing is deferred to a `useEffect` so React re-renders the correct layout component before the window changes size (prevents a flash of the wrong layout during transitions).

### Prayer time flow

1. `usePrayerTimes` calls `calculatePrayerTimes()` from `prayer-calculator.ts`
2. This creates an `adhan.PrayerTimes` object with coordinates, date, and calculation parameters
3. The result includes all six times, which prayer is current, and which is next
4. The hook builds `PrayerTimeEntry` objects for each prayer, applying user preferences:
   - `hasAdhan` is set to `false` if adhan is globally disabled, or this specific prayer is in the muted list
   - `sendNotification` is set based on the user's notification preference
5. These entries are pushed to the Rust backend via `invoke('set_prayer_times', { times })`
6. Times recalculate when: the date changes (midnight check every 60s), settings change, or the system wakes from sleep

### Settings flow

Settings load from `tauri-plugin-store` on mount (single `entries()` call). Each change writes to the store with a 100ms debounce and updates React state. The store file lives in the OS app data directory.

Settings that affect backend behavior (adhan, notifications, muting) are applied at the frontend level before sending data to the backend. The backend doesn't read the store directly - it uses whatever the frontend pushes.

## Backend structure

```
src-tauri/src/
├── lib.rs          Plugin registration, setup (tray + shortcut + scheduler), window events
├── main.rs         Entry point, calls lib::run()
├── state.rs        AppState: audio handle, mute flag, scheduler state, tray state
├── tray.rs         System tray icon (3 states), context menu, click handler
├── audio.rs        AudioHandle: dedicated thread with rodio, mpsc channel
├── scheduler.rs    30-second timer loop, notification + adhan triggering
└── commands/
    ├── mod.rs      Re-exports
    ├── audio.rs    play_adhan, stop_adhan, set_mute, get_mute
    ├── prayer.rs   set_prayer_times
    └── location.rs (empty - geolocation is frontend-only)
```

### Audio architecture

rodio's `OutputStream` is `!Send`, so it can't live in Tauri's managed state. Instead, `AudioHandle` spawns a dedicated OS thread that owns the output stream and sink. The main app talks to it through an `mpsc::Sender<AudioCommand>` channel, which is `Send`. If there's no audio device, the handle is `None` and audio is silently skipped.

### Tray icon states

The tray icon has three variants, embedded at compile time:

| State | Icon | When |
|-------|------|------|
| Default | Gold star on navy | Normal operation |
| Playing | Gold star + green dot | Adhan is playing (auto-reverts after 120s) |
| Muted | Dim star + red strike | User muted via button or tray menu |

### Scheduler

A tokio background task ticks every 30 seconds. On each tick, it:

1. Locks the scheduler state and reads the prayer times
2. Checks if any prayer time fell within the last 0-29 seconds
3. If yes and it hasn't already been triggered:
   - Emits a `"prayer-time"` event to the frontend (always)
   - Sends a native OS notification (if `sendNotification` is `true` for that prayer)
   - Plays the adhan audio (if `hasAdhan` is `true` and the global mute is off)

The frontend re-pushes times whenever they change (settings update, date change, wake from sleep), which resets the `last_triggered` flag.

## Adding a new calculation method

1. Add the key to `CalculationMethodName` in `src/types/index.ts`
2. Add metadata (display name, angles, region) to `CALCULATION_METHODS` in `src/lib/constants.ts`
3. Add the constructor mapping to `METHOD_MAP` in `src/lib/prayer-calculator.ts`
4. Optionally add country-code mappings to `COUNTRY_TO_METHOD` in `src/lib/constants.ts`

## Adding a city

Add an entry to the `CITIES` array in `src/lib/cities.ts`:

```typescript
{ name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', lat: -36.8485, lon: 174.7633, timezone: 'Pacific/Auckland' },
```

## Adding an adhan recording

1. Place the MP3 file in `src-tauri/resources/audio/` named `adhan-{identifier}.mp3`
2. Add a matching entry to `RECITERS` in `src/lib/constants.ts`

The frontend sends the reciter key (e.g. `adhan-makkah`) through `PrayerTimeEntry.reciter`. The scheduler in `scheduler.rs` constructs the path `audio/{reciter}.mp3` at playback time.

## Platform notes

- **Windows**: Requires WebView2 runtime (Tauri's NSIS installer handles this automatically). Uses `.ico` format for icons.
- **macOS**: First notification triggers the OS permission dialog. Uses `.icns` for icons. Autostart via LaunchAgent.
- **Linux**: Needs webkit2gtk 4.1, libappindicator3, and libasound2 at build time. PulseAudio and PipeWire work fine (they sit on top of ALSA).
