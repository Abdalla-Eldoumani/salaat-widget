import { describe, expect, it } from 'vitest';
import type { PrayerName, PrayerTime } from '../types';
import { calculateDaySchedule, resolvePrayerState } from './prayer-calculator';
import { formatClock, formatRemaining, prayerStatus } from './prayer-display';

const MINUTE = 60_000;

// Local wall-clock times, so the expected strings do not depend on the machine's time zone.
const at = (hour: number, minute: number) => new Date(2026, 9, 9, hour, minute);

function prayer(name: PrayerName, time: Date): PrayerTime {
  return { name, displayName: name, arabicName: name, time, hasAdhan: name !== 'sunrise' };
}

const DAY: PrayerTime[] = [
  prayer('fajr', at(5, 0)),
  prayer('sunrise', at(6, 30)),
  prayer('dhuhr', at(12, 30)),
  prayer('asr', at(15, 45)),
  prayer('maghrib', at(18, 10)),
  prayer('isha', at(19, 40)),
];

const statuses = (current: PrayerName | null) => DAY.map((p) => prayerStatus(DAY, p.name, current));

describe('clock text', () => {
  it.each([
    [at(17, 41), '12h', '5:41', 'PM'],
    [at(5, 3), '12h', '5:03', 'AM'],
    [at(12, 0), '12h', '12:00', 'PM'],
    [at(0, 5), '12h', '12:05', 'AM'],
    [at(17, 41), '24h', '17:41', ''],
    [at(5, 3), '24h', '05:03', ''],
    [at(0, 5), '24h', '00:05', ''],
  ] as const)('%s in %s is %s %s', (date, format, clock, period) => {
    expect(formatClock(date, format)).toEqual({ clock, period });
  });

  it('shows dashes for a time that does not exist', () => {
    expect(formatClock(new Date(NaN), '12h')).toEqual({ clock: '--:--', period: '' });
  });
});

describe('time remaining', () => {
  it.each([
    [-5_000, '<1m'],
    [0, '<1m'],
    [59_999, '<1m'],
    [60_000, '1m'],
    [59 * MINUTE + 59_000, '59m'],
    [60 * MINUTE, '1h 0m'],
    [(2 * 60 + 14) * MINUTE + 59_000, '2h 14m'],
    [(26 * 60 + 5) * MINUTE, '26h 5m'],
  ])('%i ms reads %s', (ms, text) => {
    expect(formatRemaining(ms)).toBe(text);
  });
});

describe('prayer status', () => {
  it('marks every prayer upcoming before the first one', () => {
    expect(statuses(null)).toEqual(['upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming']);
  });

  it('marks the current prayer and everything before it', () => {
    expect(statuses('dhuhr')).toEqual(['passed', 'passed', 'current', 'upcoming', 'upcoming', 'upcoming']);
    expect(statuses('isha')).toEqual(['passed', 'passed', 'passed', 'passed', 'passed', 'current']);
  });

  it('never calls sunrise the current prayer', () => {
    expect(statuses('sunrise')).toEqual(['passed', 'passed', 'upcoming', 'upcoming', 'upcoming', 'upcoming']);
  });

  it('flags a time that does not exist', () => {
    const polar = DAY.map((p) => (p.name === 'maghrib' ? { ...p, time: new Date(NaN) } : p));
    expect(prayerStatus(polar, 'maghrib', 'asr')).toBe('unavailable');
    expect(prayerStatus(polar, 'isha', 'asr')).toBe('upcoming');
  });

  // Whatever the day looks like, "passed" must mean the clock is past it and "upcoming" must
  // mean it is not, including where twilight times fall on the far side of the day.
  it.each([
    ['Tromso, 26 July', 69.6492, 18.9553, '2026-07-26'],
    ['Tromso, 21 June', 69.6492, 18.9553, '2026-06-21'],
    ['Makkah, 9 October', 21.4225, 39.8262, '2026-10-09'],
  ])('agrees with the clock at %s', (_place, lat, lon, day) => {
    const [y, m, d] = day.split('-').map(Number);
    const schedule = calculateDaySchedule(lat, lon, new Date(y, m - 1, d), 'ISNA', 'Shafi');
    for (let t = new Date(y, m - 1, d).getTime(); t < new Date(y, m - 1, d + 1).getTime(); t += 10 * MINUTE) {
      const state = resolvePrayerState(schedule, new Date(t));
      let current = 0;
      for (const p of schedule.prayers) {
        const status = prayerStatus(schedule.prayers, p.name, state.currentPrayer);
        const ms = p.time.getTime();
        if (status === 'passed') expect(ms).toBeLessThanOrEqual(t);
        if (status === 'upcoming') expect(ms).toBeGreaterThan(t);
        if (status === 'unavailable') expect(Number.isNaN(ms)).toBe(true);
        if (status === 'current') current += 1;
      }
      expect(current).toBeLessThanOrEqual(1);
    }
  });
});
