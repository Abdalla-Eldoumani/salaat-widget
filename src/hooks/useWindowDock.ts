import { useCallback, useEffect, useRef, useState } from 'react';
import { Window } from '@tauri-apps/api/window';
import type { DockEdge, WidgetLayout, WindowBounds } from '../types';
import { OVERLAY_DIMENSIONS } from '../lib/constants';
import { calculateSnap, clampToMonitor, frameForEdge, getLayoutForEdge, getSnapPosition, isWithinBounds } from '../lib/dock-engine';
import {
  getAllMonitorBounds,
  getMonitorBounds,
  getPrimaryMonitorBounds,
  getWindowBounds,
  setWindowFrame,
} from '../lib/monitor';

export type Overlay = keyof typeof OVERLAY_DIMENSIONS;

interface Options {
  enabled: boolean;
  savedEdge: DockEdge;
  // Settings and onboarding borrow the window; the dock is restored when they close.
  overlay: Overlay | null;
  onEdgeChange: (edge: DockEdge) => void;
}

interface Result {
  layout: WidgetLayout;
  onDragEnd: () => void;
}

// A frame we set comes back from the OS a pixel or two off on fractional scale factors.
const SAME_FRAME_PX = 2;
// Move events arrive continuously during a drag; snapping waits until they stop.
const MOVE_SETTLE_MS = 200;

function sameFrame(a: WindowBounds, b: WindowBounds): boolean {
  return (
    Math.abs(a.x - b.x) <= SAME_FRAME_PX &&
    Math.abs(a.y - b.y) <= SAME_FRAME_PX &&
    Math.abs(a.width - b.width) <= SAME_FRAME_PX &&
    Math.abs(a.height - b.height) <= SAME_FRAME_PX
  );
}

export function useWindowDock({ enabled, savedEdge, overlay, onEdgeChange }: Options): Result {
  const [view, setView] = useState({ layout: getLayoutForEdge(savedEdge), tick: 0 });

  const pendingFrame = useRef<WindowBounds | null>(null);
  const lastFrame = useRef<WindowBounds | null>(null);
  const floatingOrigin = useRef<{ x: number; y: number } | null>(null);
  const shown = useRef(false);
  // True until this hook has placed the window itself, so the geometry the window-state
  // plugin restored is only read once.
  const restoredGeometry = useRef(true);

  const savedEdgeRef = useRef(savedEdge);
  const onEdgeChangeRef = useRef(onEdgeChange);
  const overlayRef = useRef(overlay);
  useEffect(() => {
    savedEdgeRef.current = savedEdge;
    onEdgeChangeRef.current = onEdgeChange;
    overlayRef.current = overlay;
  });

  // The window is resized only after React has drawn the new layout, so the content never
  // shows squeezed into the old window size.
  const applyFrame = useCallback(async (frame: WindowBounds) => {
    const appWindow = Window.getCurrent();
    lastFrame.current = frame;
    try {
      await setWindowFrame(appWindow, frame, frame);
    } finally {
      // A window that could not be placed is still better visible than lost.
      if (!shown.current) {
        shown.current = true;
        await appWindow.show();
      }
    }
  }, []);

  useEffect(() => {
    const frame = pendingFrame.current;
    if (!frame) return;
    pendingFrame.current = null;
    applyFrame(frame).catch((err) => console.error('window placement failed', err));
  }, [view.tick, applyFrame]);

  const dockAt = useCallback((edge: DockEdge, frame: WindowBounds) => {
    pendingFrame.current = frame;
    if (edge === 'floating') floatingOrigin.current = { x: frame.x, y: frame.y };
    if (edge !== savedEdgeRef.current) onEdgeChangeRef.current(edge);
    setView((v) => ({ layout: getLayoutForEdge(edge), tick: v.tick + 1 }));
  }, []);

  // Runs after a drag: dock to the nearest edge, or float where the widget was dropped.
  const checkSnap = useCallback(async () => {
    if (overlayRef.current) return;
    const monitor = await getMonitorBounds();
    if (!monitor) return;
    const bounds = await getWindowBounds(Window.getCurrent(), monitor.scaleFactor);
    if (lastFrame.current && sameFrame(bounds, lastFrame.current)) return;

    const snap = calculateSnap(bounds, monitor);
    if (snap) {
      dockAt(snap.edge, { ...snap.size, ...snap.position });
    } else {
      dockAt('floating', frameForEdge('floating', monitor, { x: bounds.x, y: bounds.y }));
    }
  }, [dockAt]);

  useEffect(() => {
    if (!enabled || overlay) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let unlisten: (() => void) | undefined;
    let cancelled = false;

    Window.getCurrent()
      .onMoved(() => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          checkSnap().catch((err) => console.error('dock check failed', err));
        }, MOVE_SETTLE_MS);
      })
      .then((stop) => {
        if (cancelled) stop();
        else unlisten = stop;
      })
      .catch((err) => console.error('could not watch window moves', err));

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unlisten?.();
    };
  }, [enabled, overlay, checkSnap]);

  // Places the window: first launch, return from an overlay, or an overlay opening.
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function place() {
      const appWindow = Window.getCurrent();
      const current = await getMonitorBounds();
      const bounds = current ? await getWindowBounds(appWindow, current.scaleFactor) : null;

      if (overlay) {
        const monitor = current ?? (await getPrimaryMonitorBounds());
        if (!monitor || cancelled) return;
        const size = OVERLAY_DIMENSIONS[overlay];
        // Settings opens where the widget is, pulled back in; onboarding opens centred.
        const position = overlay === 'settings' && bounds
          ? clampToMonitor({ x: bounds.x, y: bounds.y }, size, monitor)
          : getSnapPosition('floating', size, monitor);
        restoredGeometry.current = false;
        await applyFrame({ ...size, ...position });
        return;
      }

      // A window the user left on a monitor that is gone gets the primary monitor instead.
      let monitor = current;
      let origin = bounds ? { x: bounds.x, y: bounds.y } : null;
      if (restoredGeometry.current) {
        const onScreen = bounds !== null && isWithinBounds(bounds, bounds, await getAllMonitorBounds());
        if (!onScreen) {
          monitor = await getPrimaryMonitorBounds();
          origin = null;
        }
      } else {
        origin = floatingOrigin.current;
      }
      if (!monitor || cancelled) return;

      restoredGeometry.current = false;
      dockAt(savedEdgeRef.current, frameForEdge(savedEdgeRef.current, monitor, origin));
    }

    place().catch((err) => console.error('window placement failed', err));
    return () => { cancelled = true; };
  }, [enabled, overlay, applyFrame, dockAt]);

  return { layout: view.layout, onDragEnd: () => { checkSnap().catch(() => {}); } };
}
