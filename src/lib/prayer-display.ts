import type { PrayerName, PrayerTime } from '../types';
import { isInvalidTime } from './prayer-calculator';

export type PrayerStatus = 'passed' | 'current' | 'upcoming' | 'unavailable';

// Sunrise ends the time for Fajr but is not a prayer, so it is never shown as the current one.
export function prayerStatus(prayers: PrayerTime[], name: PrayerName, currentPrayer: PrayerName | null): PrayerStatus {
  const prayer = prayers.find((p) => p.name === name);
  if (!prayer || isInvalidTime(prayer.time)) return 'unavailable';
  if (name === currentPrayer && prayer.hasAdhan) return 'current';

  const current = prayers.find((p) => p.name === currentPrayer);
  if (current && prayer.time.getTime() <= current.time.getTime()) return 'passed';
  return 'upcoming';
}

export interface Clock {
  clock: string;
  period: '' | 'AM' | 'PM';
}

const UNAVAILABLE_CLOCK: Clock = { clock: '--:--', period: '' };

// The 24-hour cycle is pinned to h23: with hour12 off, some engines print midnight as 24:05,
// and Isha lands after midnight at high latitudes.
export function formatClock(date: Date, format: '12h' | '24h'): Clock {
  if (isInvalidTime(date)) return UNAVAILABLE_CLOCK;

  const parts = new Intl.DateTimeFormat('en-US', {
    hour: format === '24h' ? '2-digit' : 'numeric',
    minute: '2-digit',
    hourCycle: format === '24h' ? 'h23' : 'h12',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';

  return {
    clock: `${part('hour')}:${part('minute')}`,
    period: format === '12h' ? (part('dayPeriod') as Clock['period']) : '',
  };
}

export const LESS_THAN_A_MINUTE = '<1m';

// Whole minutes, rounded down, so "0m" never shows while a prayer is still seconds away.
export function formatRemaining(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  if (totalMinutes < 1) return LESS_THAN_A_MINUTE;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
