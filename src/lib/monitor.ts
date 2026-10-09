import { Window, currentMonitor, availableMonitors, type Monitor } from '@tauri-apps/api/window';
import { LogicalPosition, LogicalSize } from '@tauri-apps/api/dpi';
import type { MonitorBounds, WindowBounds } from '../types';

// The work area is the monitor minus the taskbar, dock and menu bar, so a docked widget never
// sits underneath them. Everything is in logical pixels.
function toBounds(monitor: Monitor): MonitorBounds {
  const scale = monitor.scaleFactor;
  const { position, size } = monitor.workArea;
  return {
    x: position.x / scale,
    y: position.y / scale,
    width: size.width / scale,
    height: size.height / scale,
    scaleFactor: scale,
  };
}

export async function getMonitorBounds(): Promise<MonitorBounds | null> {
  const monitor = await currentMonitor();
  return monitor ? toBounds(monitor) : null;
}

export async function getAllMonitorBounds(): Promise<MonitorBounds[]> {
  return (await availableMonitors()).map(toBounds);
}

export async function getWindowBounds(appWindow: Window, scale: number): Promise<WindowBounds> {
  const [pos, size] = await Promise.all([appWindow.outerPosition(), appWindow.outerSize()]);
  return {
    x: pos.x / scale,
    y: pos.y / scale,
    width: size.width / scale,
    height: size.height / scale,
  };
}

export async function setWindowFrame(
  appWindow: Window,
  size: { width: number; height: number },
  pos: { x: number; y: number },
): Promise<void> {
  await appWindow.setSize(new LogicalSize(size.width, size.height));
  await appWindow.setPosition(new LogicalPosition(pos.x, pos.y));
}
