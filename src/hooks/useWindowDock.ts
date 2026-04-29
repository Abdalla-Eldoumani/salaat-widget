import { useState, useEffect, useCallback, useRef } from 'react';
import { Window, currentMonitor, availableMonitors } from '@tauri-apps/api/window';
import { LogicalPosition, LogicalSize } from '@tauri-apps/api/dpi';
import type { DockEdge, WidgetLayout, MonitorBounds, WindowBounds } from '../types';
import { calculateSnap, getDimensionsForLayout, getLayoutForEdge, isWithinBounds, getSnapPosition } from '../lib/dock-engine';
import { DEFAULT_SETTINGS } from '../lib/constants';

interface UseWindowDockResult {
  dockEdge: DockEdge;
  layout: WidgetLayout;
  onDragEnd: () => void;
  restoreToDock: () => Promise<void>;
}

async function getMonitorBounds(): Promise<MonitorBounds | null> {
  const monitor = await currentMonitor();
  if (!monitor) return null;

  const scale = monitor.scaleFactor;
  return {
    x: monitor.position.x / scale,
    y: monitor.position.y / scale,
    width: monitor.size.width / scale,
    height: monitor.size.height / scale,
    scaleFactor: scale,
  };
}

async function getWindowBounds(appWindow: Window, scale: number): Promise<WindowBounds> {
  const pos = await appWindow.outerPosition();
  const size = await appWindow.outerSize();
  return {
    x: pos.x / scale,
    y: pos.y / scale,
    width: size.width / scale,
    height: size.height / scale,
  };
}

interface PendingResize {
  width: number;
  height: number;
  x: number;
  y: number;
}

export function useWindowDock(enabled: boolean = true, defaultEdge: DockEdge = DEFAULT_SETTINGS.dockEdge): UseWindowDockResult {
  const [dockEdge, setDockEdge] = useState<DockEdge>(defaultEdge);
  const [layout, setLayout] = useState<WidgetLayout>(getLayoutForEdge(defaultEdge));
  const snapping = useRef(false);
  const pendingResize = useRef<PendingResize | null>(null);
  const initDone = useRef(false);

  // Apply window resize AFTER React has re-rendered with the new layout
  useEffect(() => {
    const resize = pendingResize.current;
    if (!resize) return;
    pendingResize.current = null;

    const appWindow = Window.getCurrent();
    (async () => {
      await appWindow.setSize(new LogicalSize(resize.width, resize.height));
      await appWindow.setPosition(new LogicalPosition(resize.x, resize.y));
      if (!initDone.current) {
        initDone.current = true;
        await appWindow.show();
      }
    })().catch(() => {});
  }, [dockEdge, layout]);

  const checkSnap = useCallback(async () => {
    if (snapping.current) return;
    snapping.current = true;

    try {
      const appWindow = Window.getCurrent();
      const monitorBounds = await getMonitorBounds();
      if (!monitorBounds) return;

      const windowBounds = await getWindowBounds(appWindow, monitorBounds.scaleFactor);
      const snap = calculateSnap(windowBounds, monitorBounds);

      if (snap) {
        pendingResize.current = { ...snap.size, ...snap.position };
        setDockEdge(snap.edge);
        setLayout(snap.layout);
      } else {
        const compactSize = getDimensionsForLayout('compact');
        // Keep current position for floating
        const pos = await appWindow.outerPosition();
        const scale = monitorBounds.scaleFactor;
        pendingResize.current = { ...compactSize, x: pos.x / scale, y: pos.y / scale };
        setDockEdge('floating');
        setLayout('compact');
      }
    } finally {
      setTimeout(() => { snapping.current = false; }, 300);
    }
  }, []);

  // Apply current dock layout's size+position. Used to restore from settings/onboarding
  // overlays whose oversized window must not bleed into the snap-detection logic.
  const restoreToDock = useCallback(async () => {
    if (snapping.current) return;
    snapping.current = true;
    try {
      const appWindow = Window.getCurrent();
      const monitorBounds = await getMonitorBounds();
      if (!monitorBounds) return;
      const size = getDimensionsForLayout(layout);
      let pos: { x: number; y: number };
      if (dockEdge === 'floating') {
        const current = await appWindow.outerPosition();
        pos = { x: current.x / monitorBounds.scaleFactor, y: current.y / monitorBounds.scaleFactor };
      } else {
        pos = getSnapPosition(dockEdge, size, monitorBounds);
      }
      await appWindow.setSize(new LogicalSize(size.width, size.height));
      await appWindow.setPosition(new LogicalPosition(pos.x, pos.y));
    } finally {
      setTimeout(() => { snapping.current = false; }, 300);
    }
  }, [dockEdge, layout]);

  // Listen for window move events (native drag, programmatic move). Debounce so
  // we only run snap detection once the user finishes moving. This is what makes
  // the layout auto-flip when the user drags between edges - relying on a
  // mouseup listener instead misses the event when the OS owns the drag loop.
  useEffect(() => {
    if (!enabled) return;
    let moveTimer: ReturnType<typeof setTimeout> | null = null;
    let unlisten: (() => void) | undefined;

    Window.getCurrent().onMoved(() => {
      if (snapping.current) return;
      if (moveTimer) clearTimeout(moveTimer);
      moveTimer = setTimeout(() => { checkSnap(); }, 200);
    }).then((u) => { unlisten = u; }).catch(() => {});

    return () => {
      if (moveTimer) clearTimeout(moveTimer);
      unlisten?.();
    };
  }, [enabled, checkSnap]);

  // Initialize: snap to restored position or default dock edge, then show window
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function init() {
      const appWindow = Window.getCurrent();
      const monitorBounds = await getMonitorBounds();
      if (!monitorBounds || cancelled) return;

      const windowBounds = await getWindowBounds(appWindow, monitorBounds.scaleFactor);
      const allMonitors = await availableMonitors();
      const monitorList: MonitorBounds[] = allMonitors.map((m) => ({
        x: m.position.x / m.scaleFactor,
        y: m.position.y / m.scaleFactor,
        width: m.size.width / m.scaleFactor,
        height: m.size.height / m.scaleFactor,
        scaleFactor: m.scaleFactor,
      }));

      const onScreen = isWithinBounds(
        { x: windowBounds.x, y: windowBounds.y },
        { width: windowBounds.width, height: windowBounds.height },
        monitorList,
      );

      // Try to snap to nearest edge from restored position
      const snap = onScreen ? calculateSnap(windowBounds, monitorBounds) : null;

      if (snap) {
        pendingResize.current = { ...snap.size, ...snap.position };
        setDockEdge(snap.edge);
        setLayout(snap.layout);
      } else {
        // First launch or off-screen - use saved/default dock position
        const edgeLayout = getLayoutForEdge(defaultEdge);
        const size = getDimensionsForLayout(edgeLayout);
        const pos = getSnapPosition(defaultEdge, size, monitorBounds);

        pendingResize.current = { ...size, ...pos };
        setDockEdge(defaultEdge);
        setLayout(edgeLayout);
      }
    }

    init().catch(() => {});
    return () => { cancelled = true; };
  }, [enabled, defaultEdge, checkSnap]);

  return { dockEdge, layout, onDragEnd: checkSnap, restoreToDock };
}
