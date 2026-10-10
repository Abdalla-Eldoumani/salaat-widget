import { describe, expect, it } from 'vitest';
import type { CalculationMethodName, DaySchedule, MadhabName, PrayerName } from '../types';
import { MAX_REFRESH_MS, calculateDaySchedule, msUntilRefresh, resolvePrayerState, toSchedulerEntries } from './prayer-calculator';

// Expected values come from outside this codebase so they cannot repeat a mistake made in it:
// - AlAdhan timetable (api.aladhan.com, v1 timings endpoint), fetched 2026-10-09. Method ids:
//   ISNA 2, MWL 3, Egyptian 5, Karachi 1, Umm al-Qura 4, Kuwait 9, Qatar 10, Singapore 11,
//   Tehran 7, Diyanet 13. Shown there in whole minutes, local time.
// - PyEphem 4.2 for Asr, checked against astropy 8.0 (a different ephemeris, within 1 s on every
//   row): the first moment after transit when the Sun's altitude equals atan(1 / (n + tan|lat - dec|)),
//   with the declination taken at that moment, n = 1 (Shafi) or 2 (Hanafi), no refraction.

const SECOND = 1000;
const MINUTE = 60 * SECOND;

interface Row {
  place: string;
  lat: number;
  lon: number;
  date: string;
  utcOffset: number;
  madhab: MadhabName;
  local: Record<'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', string>;
}

const ISNA_ROWS: Row[] = [
  { place: 'Makkah', lat: 21.4225, lon: 39.8262, date: '2026-03-20', utcOffset: 3, madhab: 'Shafi', local: { fajr: '05:24', sunrise: '06:25', dhuhr: '12:28', asr: '15:52', maghrib: '18:32', isha: '19:33' } },
  { place: 'Makkah', lat: 21.4225, lon: 39.8262, date: '2026-10-09', utcOffset: 3, madhab: 'Shafi', local: { fajr: '05:13', sunrise: '06:14', dhuhr: '12:08', asr: '15:30', maghrib: '18:01', isha: '19:02' } },
  { place: 'Jakarta', lat: -6.2088, lon: 106.8456, date: '2026-06-21', utcOffset: 7, madhab: 'Shafi', local: { fajr: '05:00', sunrise: '06:01', dhuhr: '11:54', asr: '15:16', maghrib: '17:47', isha: '18:49' } },
  { place: 'Los Angeles', lat: 34.0522, lon: -118.2437, date: '2026-03-20', utcOffset: -7, madhab: 'Shafi', local: { fajr: '05:48', sunrise: '06:56', dhuhr: '13:00', asr: '16:27', maghrib: '19:05', isha: '20:14' } },
  { place: 'Los Angeles', lat: 34.0522, lon: -118.2437, date: '2026-10-09', utcOffset: -7, madhab: 'Shafi', local: { fajr: '05:45', sunrise: '06:54', dhuhr: '12:40', asr: '15:57', maghrib: '18:26', isha: '19:35' } },
  { place: 'Sydney', lat: -33.8688, lon: 151.2093, date: '2026-06-21', utcOffset: 10, madhab: 'Shafi', local: { fajr: '05:46', sunrise: '07:00', dhuhr: '11:57', asr: '14:36', maghrib: '16:54', isha: '18:08' } },
  { place: 'Sydney', lat: -33.8688, lon: 151.2093, date: '2026-10-09', utcOffset: 11, madhab: 'Shafi', local: { fajr: '05:12', sunrise: '06:22', dhuhr: '12:43', asr: '16:17', maghrib: '19:04', isha: '20:14' } },
  { place: 'Calgary', lat: 51.0447, lon: -114.0719, date: '2026-03-20', utcOffset: -6, madhab: 'Shafi', local: { fajr: '06:07', sunrise: '07:39', dhuhr: '13:44', asr: '17:02', maghrib: '19:50', isha: '21:22' } },
  { place: 'Calgary', lat: 51.0447, lon: -114.0719, date: '2026-10-09', utcOffset: -6, madhab: 'Shafi', local: { fajr: '06:19', sunrise: '07:50', dhuhr: '13:23', asr: '16:19', maghrib: '18:56', isha: '20:26' } },
  { place: 'Calgary (Hanafi)', lat: 51.0447, lon: -114.0719, date: '2026-10-09', utcOffset: -6, madhab: 'Hanafi', local: { fajr: '06:19', sunrise: '07:50', dhuhr: '13:23', asr: '17:04', maghrib: '18:56', isha: '20:26' } },
  { place: 'London', lat: 51.5074, lon: -0.1278, date: '2026-12-21', utcOffset: 0, madhab: 'Shafi', local: { fajr: '06:20', sunrise: '08:04', dhuhr: '11:59', asr: '13:38', maghrib: '15:53', isha: '17:38' } },
];

// Makkah, 2026-10-09, one row per method. Dubai and Moonsighting Committee are left out: AlAdhan's
// Dubai preset is marked experimental and its Moonsighting seasonal rule differs from adhan's.
const METHOD_ROWS: Partial<Record<CalculationMethodName, Row['local']>> = {
  MuslimWorldLeague: { fajr: '05:00', sunrise: '06:14', dhuhr: '12:08', asr: '15:31', maghrib: '18:01', isha: '19:11' },
  Egyptian: { fajr: '04:54', sunrise: '06:14', dhuhr: '12:08', asr: '15:31', maghrib: '18:01', isha: '19:13' },
  Karachi: { fajr: '05:00', sunrise: '06:14', dhuhr: '12:08', asr: '15:31', maghrib: '18:01', isha: '19:15' },
  UmmAlQura: { fajr: '04:58', sunrise: '06:14', dhuhr: '12:08', asr: '15:30', maghrib: '18:01', isha: '19:31' },
  Kuwait: { fajr: '05:00', sunrise: '06:14', dhuhr: '12:08', asr: '15:31', maghrib: '18:01', isha: '19:13' },
  Qatar: { fajr: '05:00', sunrise: '06:14', dhuhr: '12:08', asr: '15:31', maghrib: '18:01', isha: '19:31' },
  Singapore: { fajr: '04:52', sunrise: '06:14', dhuhr: '12:08', asr: '15:31', maghrib: '18:01', isha: '19:15' },
  Tehran: { fajr: '05:02', sunrise: '06:14', dhuhr: '12:08', asr: '15:31', maghrib: '18:17', isha: '18:58' },
  Turkey: { fajr: '05:00', sunrise: '06:07', dhuhr: '12:13', asr: '15:35', maghrib: '18:08', isha: '19:11' },
};

// Asr from PyEphem, UTC to the second. Includes places where adhan was early (Calgary, Toronto,
// London, Oslo, Honolulu) and late (Los Angeles, Calgary in March), and Honolulu, where Asr falls on
// the next UTC day.
const ASR_ROWS: Array<{ place: string; lat: number; lon: number; date: string; madhab: MadhabName; asr: string }> = [
  { place: 'Calgary', lat: 51.0447, lon: -114.0719, date: '2026-10-09', madhab: 'Shafi', asr: '2026-10-09T22:18:44Z' },
  { place: 'Calgary', lat: 51.0447, lon: -114.0719, date: '2026-10-09', madhab: 'Hanafi', asr: '2026-10-09T23:03:29Z' },
  { place: 'Calgary', lat: 51.0447, lon: -114.0719, date: '2026-03-20', madhab: 'Shafi', asr: '2026-03-20T23:02:07Z' },
  { place: 'Toronto', lat: 43.6532, lon: -79.3832, date: '2026-10-09', madhab: 'Shafi', asr: '2026-10-09T20:11:49Z' },
  { place: 'London', lat: 51.5074, lon: -0.1278, date: '2026-10-09', madhab: 'Shafi', asr: '2026-10-09T14:42:37Z' },
  { place: 'London', lat: 51.5074, lon: -0.1278, date: '2026-12-21', madhab: 'Shafi', asr: '2026-12-21T13:37:31Z' },
  { place: 'Los Angeles', lat: 34.0522, lon: -118.2437, date: '2026-03-20', madhab: 'Shafi', asr: '2026-03-20T23:27:38Z' },
  { place: 'Sydney', lat: -33.8688, lon: 151.2093, date: '2026-10-09', madhab: 'Shafi', asr: '2026-10-09T05:17:29Z' },
  { place: 'Makkah', lat: 21.4225, lon: 39.8262, date: '2026-03-20', madhab: 'Shafi', asr: '2026-03-20T12:52:53Z' },
  { place: 'Jakarta', lat: -6.2088, lon: 106.8456, date: '2026-06-21', madhab: 'Hanafi', asr: '2026-06-21T09:08:44Z' },
  { place: 'Honolulu', lat: 21.3069, lon: -157.8583, date: '2026-10-09', madhab: 'Shafi', asr: '2026-10-10T01:40:26Z' },
  { place: 'Auckland', lat: -36.8485, lon: 174.7633, date: '2026-03-20', madhab: 'Shafi', asr: '2026-03-20T03:55:27Z' },
  { place: 'Oslo', lat: 59.9139, lon: 10.7522, date: '2026-09-22', madhab: 'Shafi', asr: '2026-09-22T14:16:50Z' },
];

const MAKKAH = { lat: 21.4225, lon: 39.8262, utcOffset: 3 };
const MAKKAH_NEXT_DAY_FAJR = '05:14'; // AlAdhan, 2026-10-10

const NAMES: Array<keyof Row['local']> = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

function localDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function instant(iso: string, hhmm: string, utcOffset: number): number {
  const [y, m, d] = iso.split('-').map(Number);
  const [h, min] = hhmm.split(':').map(Number);
  return Date.UTC(y, m - 1, d, h, min) - utcOffset * 60 * MINUTE;
}

function timeOf(schedule: DaySchedule, name: PrayerName): number {
  return schedule.prayers.find((p) => p.name === name)!.time.getTime();
}

describe('daily times against the AlAdhan timetable', () => {
  // Dhuhr carries the +1 minute that adhan adds for ISNA, so the allowance is one minute.
  it.each(ISNA_ROWS)('$place $date ($madhab)', (row) => {
    const schedule = calculateDaySchedule(row.lat, row.lon, localDate(row.date), 'ISNA', row.madhab);
    for (const name of NAMES) {
      const expected = instant(row.date, row.local[name], row.utcOffset);
      expect(Math.abs(timeOf(schedule, name) - expected), name).toBeLessThanOrEqual(MINUTE);
    }
  });

  it.each(Object.entries(METHOD_ROWS))('%s maps to the right convention', (method, local) => {
    const schedule = calculateDaySchedule(MAKKAH.lat, MAKKAH.lon, localDate('2026-10-09'), method as CalculationMethodName, 'Shafi');
    for (const name of NAMES) {
      const expected = instant('2026-10-09', local![name], MAKKAH.utcOffset);
      expect(Math.abs(timeOf(schedule, name) - expected), name).toBeLessThanOrEqual(MINUTE);
    }
  });

  it('puts Hanafi Asr after Shafi Asr by the double-shadow margin', () => {
    const shafi = calculateDaySchedule(51.0447, -114.0719, localDate('2026-10-09'), 'ISNA', 'Shafi');
    const hanafi = calculateDaySchedule(51.0447, -114.0719, localDate('2026-10-09'), 'ISNA', 'Hanafi');
    // AlAdhan: 16:19 against 17:04.
    expect((timeOf(hanafi, 'asr') - timeOf(shafi, 'asr')) / MINUTE).toBeGreaterThanOrEqual(43);
    expect((timeOf(hanafi, 'asr') - timeOf(shafi, 'asr')) / MINUTE).toBeLessThanOrEqual(47);
  });

  // adhan 4.4.6 takes the Sun's declination at 0h UT when it derives the Asr altitude, which is up
  // to a day before the Asr moment in the western hemisphere and puts Asr up to 95 s off. The
  // patch in patches/ takes it at the Asr moment. Without it, six of these rows miss the allowance:
  // both Calgary Shafi rows, Toronto, Los Angeles, Honolulu and Oslo. The shown time is rounded to
  // the minute, so the allowance is 30 s of rounding plus 15 s, the largest difference left against
  // PyEphem.
  it.each(ASR_ROWS)('Asr in $place on $date ($madhab) matches the Sun\'s position', (row) => {
    const schedule = calculateDaySchedule(row.lat, row.lon, localDate(row.date), 'ISNA', row.madhab);
    expect(Math.abs(timeOf(schedule, 'asr') - Date.parse(row.asr))).toBeLessThanOrEqual(45 * SECOND);
  });
});

describe('current and next prayer', () => {
  const schedule = calculateDaySchedule(MAKKAH.lat, MAKKAH.lon, localDate('2026-10-09'), 'ISNA', 'Shafi');
  const at = (hhmm: string) => new Date(instant('2026-10-09', hhmm, MAKKAH.utcOffset));

  it.each([
    ['04:00', null, 'fajr'],
    ['05:30', 'fajr', 'sunrise'],
    ['06:30', 'sunrise', 'dhuhr'],
    ['13:00', 'dhuhr', 'asr'],
    ['17:00', 'asr', 'maghrib'],
    ['18:30', 'maghrib', 'isha'],
    ['22:00', 'isha', 'fajr'],
  ])('at %s the current prayer is %s and the next is %s', (hhmm, current, next) => {
    const state = resolvePrayerState(schedule, at(hhmm));
    expect(state.currentPrayer).toBe(current);
    expect(state.nextPrayer).toBe(next);
  });

  it('counts down to tomorrow\'s Fajr after Isha', () => {
    const state = resolvePrayerState(schedule, at('22:00'));
    const expected = instant('2026-10-10', MAKKAH_NEXT_DAY_FAJR, MAKKAH.utcOffset);
    expect(Math.abs(state.nextPrayerTime!.getTime() - expected)).toBeLessThanOrEqual(MINUTE);
  });

  it('counts a prayer as current from its exact time', () => {
    const asr = schedule.prayers.find((p) => p.name === 'asr')!.time;
    expect(resolvePrayerState(schedule, asr).currentPrayer).toBe('asr');
    expect(resolvePrayerState(schedule, new Date(asr.getTime() - 1)).currentPrayer).toBe('dhuhr');
  });

  // Tromso on 26 July: the twilight times land on the far side of the local day, so the list in
  // calculation order is not chronological. Whatever the instant, the next prayer must be the
  // earliest valid time after it.
  it('names the earliest valid time after the clock when the list is out of order', () => {
    const arctic = calculateDaySchedule(69.6492, 18.9553, localDate('2026-07-26'), 'ISNA', 'Shafi');
    const valid = arctic.prayers.map((p) => p.time.getTime()).filter((t) => !Number.isNaN(t)).sort((a, b) => a - b);
    expect(valid.length).toBeGreaterThan(1);
    const start = Date.UTC(2026, 6, 25, 12, 0);
    for (let t = start; t < start + 36 * 60 * MINUTE; t += 10 * MINUTE) {
      const state = resolvePrayerState(arctic, new Date(t));
      const earliestAfter = valid.find((v) => v > t);
      if (earliestAfter !== undefined) expect(state.nextPrayerTime!.getTime()).toBe(earliestAfter);
      else expect(state.nextPrayerTime === null || state.nextPrayerTime.getTime() > t).toBe(true);
    }
  });
});

describe('scheduler entries', () => {
  const schedule = calculateDaySchedule(MAKKAH.lat, MAKKAH.lon, localDate('2026-10-09'), 'ISNA', 'Shafi');
  const prefs = { adhanEnabled: true, mutedPrayers: [] as PrayerName[], notificationsEnabled: true, reciter: 'adhan-makkah' };

  it('lists the five prayers and tomorrow\'s Fajr, never sunrise', () => {
    const entries = toSchedulerEntries(schedule, prefs);
    expect(entries.map((e) => e.name)).toEqual(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'fajr']);
    const expected = instant('2026-10-10', MAKKAH_NEXT_DAY_FAJR, MAKKAH.utcOffset);
    expect(Math.abs(Date.parse(entries[5].time) - expected)).toBeLessThanOrEqual(MINUTE);
  });

  it('applies the adhan, mute and notification preferences', () => {
    const entries = toSchedulerEntries(schedule, { ...prefs, mutedPrayers: ['asr'], notificationsEnabled: false });
    expect(entries.find((e) => e.name === 'asr')!.hasAdhan).toBe(false);
    expect(entries.find((e) => e.name === 'dhuhr')!.hasAdhan).toBe(true);
    expect(entries.every((e) => !e.sendNotification)).toBe(true);
    expect(toSchedulerEntries(schedule, { ...prefs, adhanEnabled: false }).every((e) => !e.hasAdhan)).toBe(true);
  });
});

describe('latitudes with no sunrise or sunset', () => {
  // Tromso, 21 June: the Sun does not set, so sunrise, Maghrib and the twilight times do not exist.
  const tromso = calculateDaySchedule(69.6492, 18.9553, localDate('2026-06-21'), 'ISNA', 'Shafi');
  const prefs = { adhanEnabled: true, mutedPrayers: [] as PrayerName[], notificationsEnabled: true, reciter: 'adhan-makkah' };

  it('reports the missing times as invalid instead of throwing', () => {
    expect(Number.isNaN(timeOf(tromso, 'sunrise'))).toBe(true);
    expect(Number.isNaN(timeOf(tromso, 'maghrib'))).toBe(true);
    expect(Number.isNaN(timeOf(tromso, 'dhuhr'))).toBe(false);
  });

  it('sends only the times that exist to the scheduler', () => {
    const entries = toSchedulerEntries(tromso, prefs);
    expect(entries.map((e) => e.name)).toEqual(['dhuhr', 'asr']);
    expect(entries.every((e) => !Number.isNaN(Date.parse(e.time)))).toBe(true);
  });

  it('still resolves a current and next prayer', () => {
    const state = resolvePrayerState(tromso, new Date(Date.UTC(2026, 5, 21, 12, 0)));
    expect(state.currentPrayer).toBe('dhuhr');
    expect(state.nextPrayer).toBe('asr');
  });

  it('has no next prayer after the last valid time when tomorrow has none either', () => {
    const state = resolvePrayerState(tromso, new Date(Date.UTC(2026, 5, 21, 20, 0)));
    expect(state).toEqual({ currentPrayer: 'asr', nextPrayer: null, nextPrayerTime: null });
  });
});

describe('redraw timing', () => {
  const schedule = calculateDaySchedule(MAKKAH.lat, MAKKAH.lon, localDate('2026-10-09'), 'ISNA', 'Shafi');
  const asr = schedule.prayers.find((p) => p.name === 'asr')!.time.getTime();

  it('fires just after a prayer that is closer than the cap', () => {
    const delay = msUntilRefresh(schedule, new Date(asr - 10 * SECOND));
    expect(delay).toBeGreaterThan(10 * SECOND);
    expect(delay).toBeLessThan(11 * SECOND);
  });

  it('never waits longer than the cap, so a wake from sleep is corrected within it', () => {
    expect(msUntilRefresh(schedule, new Date(asr - 3 * 60 * MINUTE))).toBe(MAX_REFRESH_MS);
  });

  it('skips prayers that have passed and prayers that do not exist', () => {
    const tromso = calculateDaySchedule(69.6492, 18.9553, localDate('2026-06-21'), 'ISNA', 'Shafi');
    const delay = msUntilRefresh(tromso, new Date(Date.UTC(2026, 5, 21, 20, 0)));
    expect(delay).toBeGreaterThanOrEqual(250);
    expect(delay).toBeLessThanOrEqual(MAX_REFRESH_MS);
  });
});
