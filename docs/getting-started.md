# Getting started

How to build, run, and develop the Salaat Widget.

## Installing as an end user

Download the installer for your OS from the [Releases](../../../releases) page.

**Windows**

The NSIS installer (`Salaat.Widget_<version>_x64-setup.exe`) is the smallest option and installs the WebView2 runtime if needed. The MSI (`Salaat.Widget_<version>_x64_en-US.msi`) is for managed environments. The installers are not code-signed, so SmartScreen warns on first run; click **More info** then **Run anyway**.

**macOS**

The only macOS build is for Apple Silicon (`Salaat.Widget_<version>_aarch64.dmg`). Drag the `.app` from the `.dmg` to `/Applications`. On first launch right-click and choose **Open** to get past Gatekeeper, since the app is not signed. macOS will prompt once for notification permission when the first prayer time fires.

**Linux**

```bash
# Debian / Ubuntu
sudo dpkg -i Salaat.Widget_*_amd64.deb

# Fedora / openSUSE
sudo rpm -i Salaat.Widget-*.x86_64.rpm

# Or use the AppImage (portable)
chmod +x Salaat.Widget_*_amd64.AppImage
./Salaat.Widget_*_amd64.AppImage
```

If you use GNOME, install the AppIndicator extension so the tray icon shows. KDE Plasma, XFCE, and most other DEs work out of the box.

## Background behaviour

The widget lives in the system tray. Hiding the window keeps the process running so prayer alerts can fire. Click the tray icon (or press `Ctrl+Shift+P`) to toggle the window. Right-click the tray icon and choose **Quit** to stop the process.

The first time the app launches it positions itself at the top edge of your primary monitor. Drag the card by any part that is not a button; release near another edge and it reorients on its own (vertical sidebar on the left or right, horizontal bar on the top or bottom). Drop it near the centre of the screen and it shrinks to a small floating window.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 22+ | [nodejs.org](https://nodejs.org/) |
| pnpm | 10 | `npm install -g pnpm@10` |
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

The widget starts hidden and shows itself once it has been placed on your saved dock edge. If you've never launched before, you'll see the onboarding flow instead.

The front end alone (`pnpm dev`) shows a notice when opened in a browser, because settings, prayer times, and window control all go through the Tauri shell. Always start it with `pnpm tauri dev`.

## Building for release

```bash
pnpm tauri build
```

Output goes to `src-tauri/target/release/bundle/`:
- **Windows**: `.msi` installer, NSIS `.exe` installer, and standalone `.exe`
- **macOS**: `.dmg` and `.app`
- **Linux**: `.deb`, `.rpm`, and `.AppImage`

On Windows the standalone executable is at `src-tauri/target/release/salaat-widget.exe`; you can run it directly without installing.

## Project layout

| Directory | What's there |
|-----------|-------------|
| `src/` | React frontend - components, hooks, library code |
| `src-tauri/` | Rust backend - commands, audio, scheduler, tray |
| `src-tauri/resources/audio/` | Bundled adhan audio files |
| `src-tauri/icons/` | App icons (generated from 1024x1024 source) |
| `docs/` | User and developer documentation |

## Useful commands

| Command | What it does |
|---------|-------------|
| `pnpm tauri dev` | Dev mode with hot reload |
| `pnpm tauri build` | Production build |
| `pnpm typecheck` | Type-check the frontend |
| `pnpm lint` | Lint the frontend |
| `pnpm test` | Run the frontend tests |
| `cd src-tauri && cargo check` | Type-check the backend |
| `cd src-tauri && cargo test` | Run the backend tests |
| `cd src-tauri && cargo clippy` | Lint the Rust code |

## Regenerating app icons

If you change the app icon, replace `src-tauri/icons/app-icon-1024.png` with your new 1024x1024 PNG, then run:

```bash
pnpm tauri icon src-tauri/icons/app-icon-1024.png
```

This generates all platform-specific sizes (`.ico`, `.icns`, various PNGs).

The tray icons (`tray-default.png`, `tray-playing.png`, `tray-muted.png`) are separate 32x32 images and need to be updated manually.

## CI / CD

The project has two GitHub Actions workflows:

- **CI** (`.github/workflows/ci.yml`) - runs on every push to `main` and on PRs. Typechecks, lints, and tests the frontend, then builds for all three platforms and runs the Rust tests on Linux. Artifacts are uploaded and can be downloaded from the Actions tab.
- **Release** (`.github/workflows/release.yml`) - runs when you push a version tag (e.g. `git tag v<version> && git push origin v<version>`). Builds for all platforms and creates a draft GitHub Release with installers attached. Review the draft and publish it when ready.

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
On the next start the widget notices that its monitor is gone and appears on the primary monitor. If it still does not show, delete `.window-state.json` from the app config directory (see the README for the path) and restart.
