# Architecture

How the frontend and backend work together, and where to look when you want to change something.

## Two halves

The app has a React frontend (renders the UI, calculates prayer times) and a Rust backend (plays audio, sends notifications, manages the system tray). They talk over Tauri's IPC bridge.

```
Frontend (React, runs in webview)        Backend (Rust, runs natively)
────────────────────────────────         ────────────────────────────

adhan-js calculates prayer times  ──►    set_prayer_times command
                                         Stores times in SchedulerState
                                         5-second timer loop checks them

                                  ◄──    "prayer-time" event when time hits
                                         Native OS notification (if enabled)
                                         Plays adhan via rodio (if not muted)

Window frame (JS Window API)      ──►    set_position / set_size
Settings UI                       ──►    tauri-plugin-store (JSON file)
```

Prayer math lives in the frontend because `adhan` is a JavaScript library. The backend handles everything that needs to work when the webview is out of focus: audio playback, scheduled checks, and system notifications.

## Frontend structure

```
src/
├── App.tsx                  Picks the screen: onboarding, settings, or the widget
├── main.tsx                 Mounts App inside the error boundary
├── hooks/
│   ├── usePrayerTimes.ts    Calculates the day, tracks the clock, pushes times to the backend
│   ├── useCountdown.ts      Ticks every second, formats "2h 15m"
│   ├── useWindowDock.ts     Snap-to-edge logic, layout switching, window placement
│   ├── useSettings.ts       LazyStore wrapper, loads/saves settings
│   └── useGeolocation.ts    IP-based location via ipapi.co
├── components/
│   ├── Page.tsx             Framed ground shared by every screen
│   ├── ErrorBoundary.tsx    Message and reload button after a render error
│   ├── DesktopOnly.tsx      Notice shown when the page is opened outside Tauri
│   ├── widget/              Bar, Sidebar, Compact layouts and their parts
│   ├── onboarding/          Three-step first-launch flow
│   ├── settings/            Settings panel, one file per section
│   └── ui/                  Buttons, switch, select, radio choice, city picker, ornaments
├── lib/
│   ├── prayer-calculator.ts Maps settings to adhan-js; picks the current and next prayer
│   ├── prayer-display.ts    Status, clock text and remaining-time formatting
│   ├── dock-engine.ts       Pure math: edge detection, snap positions, frames
│   ├── monitor.ts           Monitor and window geometry through the Tauri API
│   ├── location.ts          Parses ipapi.co responses; decides when to save a location
│   ├── constants.ts         Defaults, method metadata, prayer names, sizes
│   └── cities.ts            131 cities with coordinates
└── types/
    └── index.ts             Shared TypeScript types
```

### Layout system

The widget has three visual layouts, picked by dock position:

| Dock edge | Layout | Size | Component |
|-----------|--------|------|-----------|
| top, bottom | horizontal | 640x60 | `widget/Bar.tsx` |
| left, right | vertical | 200x420 | `widget/Sidebar.tsx` |
| floating | compact | 240x280 | `widget/Compact.tsx` |

`useWindowDock` listens for the window's native `onMoved` events. When the window stops moving for 200ms, it runs edge detection: if the window is within 40 logical pixels of any edge it snaps and switches layout, otherwise it falls back to the floating compact size. While settings or onboarding is open the hook enlarges the window for that screen and stops watching moves, and when the overlay closes it puts the widget back at its dock frame instead of running snap detection from the inflated size. A window left on a monitor that no longer exists is moved to the primary monitor at startup. Window resizing is deferred to a `useEffect` so React re-renders the correct layout component before the window changes size (prevents a flash of the wrong layout during transitions).

### Prayer time flow

1. `usePrayerTimes` calls `calculateDaySchedule()` from `prayer-calculator.ts` for the current calendar day
2. This creates an `adhan.PrayerTimes` object with coordinates, date, and calculation parameters, and a second one for tomorrow's Fajr
3. The schedule holds the six times (five prayers and sunrise). `resolvePrayerState()` picks the current and next prayer from the clock, falls back to tomorrow's Fajr once Isha has passed, and skips times that are undefined near the polar circle
4. `toSchedulerEntries()` builds a `PrayerTimeEntry` for each prayer that has a valid time, plus tomorrow's Fajr, applying user preferences:
   - `hasAdhan` is `false` if adhan is globally disabled or this prayer is in the muted list
   - `sendNotification` follows the notification preference
   - sunrise is left out, so it never notifies or plays
5. These entries are pushed to the Rust backend via `invoke('set_prayer_times', { times })`
6. A single timer re-arms after every tick and fires at the next prayer, at midnight, or within a minute, whichever is first. The clock is also read again when the window becomes visible, so a laptop waking from sleep corrects itself within a minute

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
├── scheduler.rs    5-second timer loop, notification + adhan triggering
└── commands/
    ├── mod.rs      Re-exports
    ├── audio.rs    play_adhan, stop_adhan, set_mute, get_mute
    └── prayer.rs   set_prayer_times
```

### Audio architecture

rodio's `OutputStream` is `!Send`, so it can't live in Tauri's managed state. Instead, `AudioHandle` spawns a dedicated OS thread that owns the output stream and sink. The main app talks to it through an `mpsc::Sender<AudioCommand>` channel, which is `Send`. The output device is opened on the first play and again after a failure, so a machine that had no audio device at login still plays once one appears. A failed open is skipped and the tray returns to its default icon.

### Tray icon states

The tray icon has three variants, embedded at compile time:

| State | Icon | When |
|-------|------|------|
| Default | Gold star on navy | Normal operation |
| Playing | Gold star + green dot | Adhan is playing; reverts when playback ends |
| Muted | Dim star + red strike | User muted via button or tray menu |

### Scheduler

A tokio background task ticks every 5 seconds. On each tick, it:

1. Locks the scheduler state and reads the prayer times
2. Looks for a prayer whose time fell within the last 0-59 seconds
3. If one is due and has not already fired for that instant, marks it fired and:
   - Emits a `"prayer-time"` event to the frontend (always)
   - Sends a native OS notification (if `sendNotification` is `true` for that prayer)
   - Plays the adhan audio (if `hasAdhan` is `true` and the global mute is off)

The frontend re-pushes times whenever they change (settings update, date change, wake from sleep). Fired prayers are remembered by name and instant for a day, so a re-push inside the trigger window cannot play the adhan twice.

## Adding a new calculation method

1. Add the key to `CalculationMethodName` in `src/types/index.ts`
2. Add metadata (display name, angles, region) to `CALCULATION_METHODS` in `src/lib/constants.ts`
3. Add the constructor mapping to `METHOD_MAP` in `src/lib/prayer-calculator.ts`
4. Add expected times from an independent source to `src/lib/prayer-calculator.test.ts`
5. Optionally add country-code mappings to `COUNTRY_TO_METHOD` in `src/lib/constants.ts`

## Adding a city

Add an entry to the `CITIES` array in `src/lib/cities.ts`:

```typescript
{ name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', lat: -36.8485, lon: 174.7633 },
```

## Adding an adhan recording

1. Place the MP3 file in `src-tauri/resources/audio/` named `adhan-{identifier}.mp3`
2. Add a matching entry to `RECITERS` in `src/lib/constants.ts`

The frontend sends the reciter key (e.g. `adhan-makkah`) through `PrayerTimeEntry.reciter`. The scheduler in `scheduler.rs` constructs the path `audio/{reciter}.mp3` at playback time.

## Platform notes

- **Windows**: Requires WebView2 runtime (Tauri's NSIS installer handles this automatically). Uses `.ico` format for icons.
- **macOS**: First notification triggers the OS permission dialog. Uses `.icns` for icons. Autostart via LaunchAgent.
- **Linux**: Needs webkit2gtk 4.1, libappindicator3, and libasound2 at build time. PulseAudio and PipeWire work fine (they sit on top of ALSA).
