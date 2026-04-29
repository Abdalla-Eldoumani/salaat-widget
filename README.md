# Salaat Widget

A desktop prayer times widget that sits on any screen edge. Shows the six daily prayer times in English and Arabic, highlights the current one, and counts down to the next. Plays the adhan and sends native notifications when each prayer arrives.

Built with Tauri v2 (Rust backend) and React 18 (TypeScript frontend). Runs on Windows, macOS, and Linux.

Built as sadaqah jariyah.

## What it does

- Calculates prayer times using the `adhan` library's astronomical equations
- Docks to any screen edge and reorients automatically: horizontal bar on top or bottom, vertical sidebar on left or right, compact floating window in between
- Shows English and Arabic prayer names (Amiri font) side by side
- Plays adhan audio through the OS audio system, even when the widget is out of focus
- Sends native notifications at each prayer time
- Detects your location automatically via IP geolocation, or lets you pick from ~130 cities
- Supports 12 calculation methods (ISNA, MWL, Egyptian, Umm al-Qura, etc.)
- Per-prayer muting - silence the adhan for individual prayers while keeping the rest
- Remembers your settings and window position across restarts
- Runs in the system tray - closing the window just hides it

## Download

Grab the latest installer from the [Releases](../../releases) page.

| Platform | File | Size |
|----------|------|------|
| Windows | `Salaat Widget_<version>_x64-setup.exe` (NSIS installer) | ~5 MB |
| Windows | `Salaat Widget_<version>_x64_en-US.msi` (MSI installer) | ~6 MB |
| macOS | `Salaat Widget_<version>_x64.dmg` | ~5 MB |
| Linux | `salaat-widget_<version>_amd64.deb` | ~6 MB |
| Linux | `Salaat Widget_<version>_amd64.AppImage` | ~90 MB |

Pick the NSIS installer on Windows for the smallest download. It auto-installs the WebView2 runtime if your system needs it. The MSI is there for IT-managed installs.

## Building from source

You need [Node.js](https://nodejs.org/) (18+), [pnpm](https://pnpm.io/), and [Rust](https://rustup.rs/). See [docs/getting-started.md](docs/getting-started.md) for full setup instructions.

```bash
pnpm install
pnpm tauri build
```

Installers land in `src-tauri/target/release/bundle/`.

## First launch

On first launch, you'll see a three-step setup:

1. **Location** - auto-detected from your IP, or pick a city manually
2. **Calculation method** - auto-suggested based on your country, plus madhab and high-latitude options
3. **Widget placement** - choose which screen edge to dock to

After setup, the widget snaps to your chosen edge and starts showing prayer times. Grab the gold grip at the top (or on the left of the bar layout) and drag the widget toward any edge - it reorients itself automatically when you let go. Drop it near the centre of the screen and it shrinks to a small floating window instead.

Click the tray icon (or press `Ctrl+Shift+P`) any time to hide or show the widget.

## Settings

Click the gear icon on the widget to open settings. Everything is documented in [docs/configuration.md](docs/configuration.md).

## Background process

The widget runs in the system tray. Hiding the window keeps the process alive so prayer notifications and the adhan still fire on time. To fully exit, right-click the tray icon and choose **Quit**.

| What | How |
|------|-----|
| Hide the widget | Click the small minus button beside the drag grip, click the tray icon, or press `Ctrl+Shift+P` |
| Bring the widget back | Click the tray icon, or press `Ctrl+Shift+P` again |
| Mute the adhan immediately | Speaker icon on the widget, "Mute now" in settings, or "Mute" in the tray menu |
| Quit the app | Right-click the tray icon then **Quit** |

## Where settings are stored

Settings, window position, and onboarding state are stored under the OS app-data directory:

| OS | Path |
|----|------|
| Windows | `%APPDATA%\com.salaat.widget\` |
| macOS | `~/Library/Application Support/com.salaat.widget/` |
| Linux | `~/.local/share/com.salaat.widget/` |

You can delete this directory to reset all settings; the widget will restart in the onboarding flow.

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

MIT
