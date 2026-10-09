# Salaat Widget

A desktop prayer times widget that sits on any screen edge. Shows the five daily prayers and sunrise in English and Arabic, marks the current prayer, and counts down to the next one. Plays the adhan and sends native notifications when each prayer arrives.

Built with Tauri v2 (Rust backend) and React 18 (TypeScript frontend). Runs on Windows (x64), macOS (Apple Silicon), and Linux (x64).

Built as sadaqah jariyah.

## What it does

- Calculates prayer times using the `adhan` library's astronomical equations
- Docks to any screen edge and reorients automatically: horizontal bar on top or bottom, vertical sidebar on left or right, compact floating window in between
- Shows English and Arabic prayer names side by side, set in Amiri, which ships with the app
- Follows the system light or dark setting
- Plays adhan audio through the OS audio system, even when the widget is out of focus
- Sends native notifications at each prayer time
- Detects your location from your IP address through ipapi.co, or lets you pick from 131 cities (see Network use below)
- Supports 12 calculation methods (ISNA, MWL, Egyptian, Umm al-Qura, etc.)
- Per-prayer muting - silence the adhan for individual prayers while keeping the rest
- Remembers your settings and dock edge across restarts; a floating widget reopens where it was last placed
- Runs in the system tray - closing the window just hides it

## Download

Grab the latest installer from the [Releases](../../releases) page.

| Platform | File | Size in v0.2.0 |
|----------|------|------|
| Windows | `Salaat.Widget_<version>_x64-setup.exe` (NSIS installer) | 5.3 MB |
| Windows | `Salaat.Widget_<version>_x64_en-US.msi` (MSI installer) | 7.2 MB |
| macOS, Apple Silicon only | `Salaat.Widget_<version>_aarch64.dmg` | 7.8 MB |
| Linux | `Salaat.Widget_<version>_amd64.deb` | 8.9 MB |
| Linux | `Salaat.Widget-<version>-1.x86_64.rpm` | 8.9 MB |
| Linux | `Salaat.Widget_<version>_amd64.AppImage` | 86 MB |

There is no Intel Mac build. None of the installers are code-signed. Pick the NSIS installer on Windows for the smallest download. It installs the WebView2 runtime if your system needs it. The MSI is there for managed installs.

## Building from source

You need [Node.js](https://nodejs.org/) 22 or newer, [pnpm](https://pnpm.io/) 10, and [Rust](https://rustup.rs/). See [docs/getting-started.md](docs/getting-started.md) for full setup instructions.

```bash
pnpm install
pnpm tauri build
```

Installers land in `src-tauri/target/release/bundle/`.

Checks: `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `cargo test` inside `src-tauri/`. The front end only works inside the Tauri window, so `pnpm dev` in a plain browser shows a notice instead of the widget; use `pnpm tauri dev`.

## First launch

On first launch, you'll see a three-step setup:

1. **Location** - auto-detected from your IP, or pick a city manually
2. **Calculation method** - auto-suggested based on your country, plus madhab and high-latitude options
3. **Widget placement** - choose which screen edge to dock to

After setup, the widget snaps to your chosen edge and starts showing prayer times. Drag the card by any part that is not a button and drop it near an edge: it reorients itself when you let go. Drop it near the centre of the screen and it shrinks to a small floating window instead.

Click the tray icon (or press `Ctrl+Shift+P`) any time to hide or show the widget.

## Settings

Click the gear icon on the widget to open settings. Everything is documented in [docs/configuration.md](docs/configuration.md).

## Background process

The widget runs in the system tray. Hiding the window keeps the process alive so prayer notifications and the adhan still fire on time. To fully exit, right-click the tray icon and choose **Quit**.

| What | How |
|------|-----|
| Hide the widget | Click the minus button on the widget, click the tray icon, or press `Ctrl+Shift+P` |
| Bring the widget back | Click the tray icon, or press `Ctrl+Shift+P` again |
| Mute the adhan immediately | Speaker icon on the widget, "Mute now" in settings, or "Mute" in the tray menu |
| Quit the app | Right-click the tray icon then **Quit** |

## Where settings are stored

Settings and onboarding state are stored under the OS app-data directory. The window position is kept in the app config directory, which is the same folder on Windows and macOS.

| OS | Settings | Window position |
|----|----------|-----------------|
| Windows | `%APPDATA%\com.salaat.widget\` | same folder |
| macOS | `~/Library/Application Support/com.salaat.widget/` | same folder |
| Linux | `~/.local/share/com.salaat.widget/` | `~/.config/com.salaat.widget/` |

Delete the settings directory to reset everything; the widget restarts in the onboarding flow.

## Network use

With automatic location on, the app asks ipapi.co for an approximate location when it starts, which sends your IP address to that service. The free tier is rate limited; when a request fails, prayer times use the last saved location and settings shows why. Choose a city by hand in settings to stop the request. The app makes no other network requests.

## First-launch notes

- **Windows**: SmartScreen may flag the unsigned binary. Click **More info** then **Run anyway**. The NSIS installer auto-installs WebView2 if your system lacks it.
- **macOS**: Gatekeeper blocks unsigned binaries on first launch. Right-click the `.app` and choose **Open** the first time. macOS will also prompt for notification permission the first time a prayer time fires.
- **Linux**: A working ALSA audio device is required for the adhan. PulseAudio and PipeWire both work since they sit on top of ALSA. If you use GNOME, install the AppIndicator extension so the tray icon appears.

## Project structure

```
src/                     React frontend (prayer calculation, UI, settings)
src-tauri/               Rust backend (audio, notifications, scheduling, tray)
docs/                    User and developer documentation
```

For architecture details and how to modify the widget, see [docs/architecture.md](docs/architecture.md).

## License

The code is MIT licensed. The adhan recordings in `src-tauri/resources/audio/` are not covered by that licence, and their origin and terms are not recorded. See the README in that folder.
