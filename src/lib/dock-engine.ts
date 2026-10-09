import type { DockEdge, WidgetLayout, WindowBounds, MonitorBounds } from '../types';
import { SNAP_THRESHOLD_PX, WIDGET_DIMENSIONS } from './constants';

// Figures out which screen edge the widget is closest to.
// Returns 'floating' if nothing is within the snap threshold.
export function classifyDockEdge(
  window: WindowBounds,
  monitor: MonitorBounds,
  threshold: number = SNAP_THRESHOLD_PX,
): DockEdge {
  const distances = {
    top: Math.abs(window.y - monitor.y),
    bottom: Math.abs((window.y + window.height) - (monitor.y + monitor.height)),
    left: Math.abs(window.x - monitor.x),
    right: Math.abs((window.x + window.width) - (monitor.x + monitor.width)),
  };

  const closest = (Object.keys(distances) as DockEdge[])
    .reduce((a, b) => (distances[a as keyof typeof distances] < distances[b as keyof typeof distances] ? a : b));

  const minDist = distances[closest as keyof typeof distances];
  return minDist <= threshold ? closest : 'floating';
}

// Returns the position to place the widget when snapping to an edge.
// Centers the widget along the edge.
export function getSnapPosition(
  edge: DockEdge,
  widgetSize: { width: number; height: number },
  monitor: MonitorBounds,
): { x: number; y: number } {
  const centerX = monitor.x + Math.round((monitor.width - widgetSize.width) / 2);
  const centerY = monitor.y + Math.round((monitor.height - widgetSize.height) / 2);

  switch (edge) {
    case 'top':
      return { x: centerX, y: monitor.y };
    case 'bottom':
      return { x: centerX, y: monitor.y + monitor.height - widgetSize.height };
    case 'left':
      return { x: monitor.x, y: centerY };
    case 'right':
      return { x: monitor.x + monitor.width - widgetSize.width, y: centerY };
    default:
      return { x: centerX, y: centerY };
  }
}

// Moves a window of the given size the shortest distance that puts it fully inside the monitor.
export function clampToMonitor(
  pos: { x: number; y: number },
  size: { width: number; height: number },
  monitor: MonitorBounds,
): { x: number; y: number } {
  const maxX = monitor.x + Math.max(0, monitor.width - size.width);
  const maxY = monitor.y + Math.max(0, monitor.height - size.height);
  return {
    x: Math.min(Math.max(pos.x, monitor.x), maxX),
    y: Math.min(Math.max(pos.y, monitor.y), maxY),
  };
}

export function getLayoutForEdge(edge: DockEdge): WidgetLayout {
  if (edge === 'top' || edge === 'bottom') return 'horizontal';
  if (edge === 'left' || edge === 'right') return 'vertical';
  return 'compact';
}

export function getDimensionsForLayout(layout: WidgetLayout): { width: number; height: number } {
  return { ...WIDGET_DIMENSIONS[layout] };
}

// All-in-one: given current window and monitor, should we snap?
// Returns null if the widget should stay floating.
export function calculateSnap(
  window: WindowBounds,
  monitor: MonitorBounds,
  threshold: number = SNAP_THRESHOLD_PX,
): {
  edge: DockEdge;
  layout: WidgetLayout;
  position: { x: number; y: number };
  size: { width: number; height: number };
} | null {
  const edge = classifyDockEdge(window, monitor, threshold);
  if (edge === 'floating') return null;

  const layout = getLayoutForEdge(edge);
  const size = getDimensionsForLayout(layout);
  const position = getSnapPosition(edge, size, monitor);

  return { edge, layout, position, size };
}

// Checks if a window position is within any monitor's bounds.
// Used on startup to detect if the widget got stranded off-screen
// (e.g., a monitor was disconnected).
export function isWithinBounds(
  windowPos: { x: number; y: number },
  windowSize: { width: number; height: number },
  monitors: MonitorBounds[],
): boolean {
  return monitors.some((m) => {
    const windowRight = windowPos.x + windowSize.width;
    const windowBottom = windowPos.y + windowSize.height;
    const monitorRight = m.x + m.width;
    const monitorBottom = m.y + m.height;

    // At least half the widget should be visible on some monitor.
    const overlapX = Math.max(0, Math.min(windowRight, monitorRight) - Math.max(windowPos.x, m.x));
    const overlapY = Math.max(0, Math.min(windowBottom, monitorBottom) - Math.max(windowPos.y, m.y));
    return overlapX > windowSize.width / 2 && overlapY > windowSize.height / 2;
  });
}
