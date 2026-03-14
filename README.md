# Salaat Widget

A desktop prayer times widget that sits on any screen edge. Shows the six daily prayer times, highlights the current one, and counts down to the next. Plays the adhan and sends native notifications when each prayer arrives.

Built with Tauri v2 (Rust backend) and React 18 (TypeScript frontend). Runs on Windows, macOS, and Linux.

Built as sadaqah jariyah.

## What it does

- Calculates prayer times using the `adhan` library's astronomical equations
- Docks to any screen edge (horizontal bar on top/bottom, vertical sidebar on left/right, compact floating window)
- Plays adhan audio through the OS audio system, even when the widget is out of focus
- Sends native notifications at each prayer time
- Detects your location automatically via IP geolocation, or lets you pick from ~130 cities
- Supports 12 calculation methods (ISNA, MWL, Egyptian, Umm al-Qura, etc.)
- Per-prayer muting — silence the adhan for individual prayers while keeping the rest
- Remembers your settings and window position across restarts
- Runs in the system tray — closing the window just hides it

## Download

Grab the latest installer from the [Releases](../../releases) page.

| Platform | File | Size |
|----------|------|------|
| Windows | `Salaat Widget_x64-setup.exe` (NSIS installer) | ~4 MB |
| Windows | `Salaat Widget_x64_en-US.msi` (MSI installer) | ~6 MB |
| macOS | `.dmg` | built via CI |
| Linux | `.deb` / `.AppImage` | built via CI |

The NSIS installer is the smallest option for Windows. It handles WebView2 runtime installation automatically if needed.

## Building from source

You need [Node.js](https://nodejs.org/) (18+), [pnpm](https://pnpm.io/), and [Rust](https://rustup.rs/). See [docs/getting-started.md](docs/getting-started.md) for full setup instructions.

```bash
pnpm install
pnpm tauri build
```

Installers land in `src-tauri/target/release/bundle/`.

## First launch

On first launch, you'll see a three-step setup:

1. **Location** — auto-detected from your IP, or pick a city manually
2. **Calculation method** — auto-suggested based on your country, plus madhab and high-latitude options
3. **Widget placement** — choose which screen edge to dock to

After setup, the widget snaps to your chosen edge and starts showing prayer times. Drag the grip to move it to a different edge. Right-click the tray icon or press `Ctrl+Shift+P` to show/hide the widget.

## Settings

Click the gear icon on the widget to open settings. Everything is documented in [docs/configuration.md](docs/configuration.md).

## Project structure

```
src/                     React frontend (prayer calculation, UI, settings)
src-tauri/               Rust backend (audio, notifications, scheduling, tray)
docs/                    User and developer documentation
```

For architecture details and how to modify the widget, see [docs/architecture.md](docs/architecture.md).

## License

MIT
