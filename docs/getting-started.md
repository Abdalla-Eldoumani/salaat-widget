# Getting started

How to build, run, and develop the Salaat Widget.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| pnpm | 9+ | `npm install -g pnpm` |
| Rust | stable | [rustup.rs](https://rustup.rs/) |

### Linux-only dependencies

```bash
# Ubuntu / Debian
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev libasound2-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel libappindicator-gtk3-devel alsa-lib-devel

# Arch
sudo pacman -S webkit2gtk-4.1 libappindicator-gtk3 alsa-lib
```

## Development

```bash
# Install frontend dependencies
pnpm install

# Start dev mode (hot reload for frontend, recompiles Rust on change)
pnpm tauri dev
```

The first build compiles all Rust dependencies and takes a few minutes. After that, incremental builds are fast.

The widget starts hidden and positions itself at the top edge of your screen. If you've never launched before, you'll see the onboarding flow instead.

## Building for release

```bash
pnpm tauri build
```

Output goes to `src-tauri/target/release/bundle/`:
- **Windows**: `.msi` installer, NSIS `.exe` installer, and standalone `.exe`
- **macOS**: `.dmg` and `.app`
- **Linux**: `.deb` and `.AppImage`

The standalone executable is at `src-tauri/target/release/salaat-widget.exe` (Windows) — you can run it directly without installing.

## Project layout

| Directory | What's there |
|-----------|-------------|
| `src/` | React frontend — components, hooks, library code |
| `src-tauri/` | Rust backend — commands, audio, scheduler, tray |
| `src-tauri/resources/audio/` | Bundled adhan audio files |
| `src-tauri/icons/` | App icons (generated from 1024x1024 source) |
| `docs/` | User and developer documentation |

## Useful commands

| Command | What it does |
|---------|-------------|
| `pnpm tauri dev` | Dev mode with hot reload |
| `pnpm tauri build` | Production build |
| `pnpm exec tsc --noEmit` | Type-check the frontend |
| `cd src-tauri && cargo check` | Type-check the backend |
| `cd src-tauri && cargo clippy` | Lint the Rust code |

## Regenerating app icons

If you change the app icon, replace `src-tauri/icons/app-icon-1024.png` with your new 1024x1024 PNG, then run:

```bash
pnpm tauri icon src-tauri/icons/app-icon-1024.png
```

This generates all platform-specific sizes (`.ico`, `.icns`, various PNGs).

The tray icons (`tray-default.png`, `tray-playing.png`, `tray-muted.png`) are separate 32x32 images and need to be updated manually.

## CI / CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that builds for Windows, macOS, and Linux on every push. Built artifacts are uploaded and can be downloaded from the Actions tab.

## Troubleshooting

**Port 1420 already in use**
A previous dev server is still running. Kill it:
```bash
# Windows
taskkill /F /IM node.exe

# macOS/Linux
pkill -f "vite"
```

**Rust build fails with PDB error on Windows**
Long paths combined with parallel linking can cause `LNK1318`. Limit parallelism:
```bash
CARGO_BUILD_JOBS=2 pnpm tauri dev
```

**No audio on Linux**
Make sure ALSA is available. PulseAudio and PipeWire both work since they use ALSA underneath. Check that `libasound2` is installed.

**Widget is off-screen after disconnecting a monitor**
The widget detects this on startup and resets to the default dock edge. If it doesn't, delete the window state file in your OS app data directory and restart.
