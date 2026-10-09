import { describe, expect, it } from 'vitest';
import type { MonitorBounds } from '../types';
import {
  calculateSnap,
  classifyDockEdge,
  clampToMonitor,
  getLayoutForEdge,
  getSnapPosition,
  isWithinBounds,
} from './dock-engine';

// A 1920x1080 screen whose bottom 40 px is a taskbar, so the work area is 1920x1040.
const monitor: MonitorBounds = { x: 0, y: 0, width: 1920, height: 1040, scaleFactor: 1 };
const secondMonitor: MonitorBounds = { x: 1920, y: 0, width: 1280, height: 1024, scaleFactor: 1 };

describe('snapping to an edge', () => {
  const bar = { width: 640, height: 60 };

  it.each([
    ['top', { x: 640, y: 12 }, 'top'],
    ['bottom', { x: 640, y: 1040 - 60 - 30 }, 'bottom'],
    ['left', { x: 25, y: 300 }, 'left'],
    ['right', { x: 1920 - 640 - 39, y: 300 }, 'right'],
  ])('a widget near the %s edge docks there', (_name, pos, edge) => {
    expect(classifyDockEdge({ ...pos, ...bar }, monitor)).toBe(edge);
  });

  it('floats when every edge is further than the threshold', () => {
    expect(classifyDockEdge({ x: 700, y: 400, ...bar }, monitor)).toBe('floating');
    expect(calculateSnap({ x: 700, y: 400, ...bar }, monitor)).toBeNull();
  });

  it('treats 40 px as docked and 41 px as floating', () => {
    expect(classifyDockEdge({ x: 700, y: 40, ...bar }, monitor)).toBe('top');
    expect(classifyDockEdge({ x: 700, y: 41, ...bar }, monitor)).toBe('floating');
  });

  it('places a bottom dock above the taskbar, centred along the edge', () => {
    expect(getSnapPosition('bottom', bar, monitor)).toEqual({ x: 640, y: 980 });
  });

  it('places a right dock against the right edge, centred vertically', () => {
    const sidebar = { width: 200, height: 420 };
    expect(getSnapPosition('right', sidebar, monitor)).toEqual({ x: 1720, y: 310 });
  });

  it('respects a monitor that does not start at the origin', () => {
    expect(getSnapPosition('top', bar, secondMonitor)).toEqual({ x: 1920 + 320, y: 0 });
  });

  it('chooses the layout from the edge', () => {
    expect(getLayoutForEdge('top')).toBe('horizontal');
    expect(getLayoutForEdge('bottom')).toBe('horizontal');
    expect(getLayoutForEdge('left')).toBe('vertical');
    expect(getLayoutForEdge('right')).toBe('vertical');
    expect(getLayoutForEdge('floating')).toBe('compact');
  });

  it('returns the size and position for the snapped layout', () => {
    expect(calculateSnap({ x: 10, y: 400, width: 200, height: 420 }, monitor)).toEqual({
      edge: 'left',
      layout: 'vertical',
      size: { width: 200, height: 420 },
      position: { x: 0, y: 310 },
    });
  });
});

describe('keeping a window on screen', () => {
  it('pulls a window that hangs below the work area back up', () => {
    // The 400x540 settings panel opened from a bottom dock at y = 980.
    expect(clampToMonitor({ x: 640, y: 980 }, { width: 400, height: 540 }, monitor)).toEqual({ x: 640, y: 500 });
  });

  it('pulls a window that hangs past the right edge back left', () => {
    expect(clampToMonitor({ x: 1720, y: 310 }, { width: 400, height: 540 }, monitor)).toEqual({ x: 1520, y: 310 });
  });

  it('leaves a window that already fits alone', () => {
    expect(clampToMonitor({ x: 100, y: 100 }, { width: 400, height: 540 }, monitor)).toEqual({ x: 100, y: 100 });
  });

  it('pins to the top-left when the window is larger than the screen', () => {
    expect(clampToMonitor({ x: 50, y: 50 }, { width: 3000, height: 2000 }, monitor)).toEqual({ x: 0, y: 0 });
  });

  it('counts a window as stranded when less than half of it is on any monitor', () => {
    const size = { width: 240, height: 280 };
    expect(isWithinBounds({ x: 100, y: 100 }, size, [monitor])).toBe(true);
    // 20 px of a 240 px wide window is still on the only monitor.
    expect(isWithinBounds({ x: 1900, y: 100 }, size, [monitor])).toBe(false);
    // The same position is fine once a second monitor holds 220 px of it.
    expect(isWithinBounds({ x: 1900, y: 100 }, size, [monitor, secondMonitor])).toBe(true);
    expect(isWithinBounds({ x: 5000, y: 100 }, size, [monitor, secondMonitor])).toBe(false);
    // Only 10 of 280 px are above the bottom of the work area.
    expect(isWithinBounds({ x: 100, y: 1030 }, size, [monitor])).toBe(false);
  });
});
