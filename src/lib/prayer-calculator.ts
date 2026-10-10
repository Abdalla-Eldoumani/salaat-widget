import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Madhab,
  HighLatitudeRule,
} from 'adhan';
import type {
  PrayerName,
  PrayerTime,
  PrayerTimeEntry,
  PrayerState,
  DaySchedule,
  CalculationMethodName,
  MadhabName,
  HighLatitudeRuleName,
} from '../types';
import { HIGH_LATITUDE, PRAYER_NAMES } from './constants';

// Maps our string identifiers to adhan-js constructor calls.
const METHOD_MAP: Record<CalculationMethodName, () => ReturnType<typeof CalculationMethod.MuslimWorldLeague>> = {
  MuslimWorldLeague: () => CalculationMethod.MuslimWorldLeague(),
  Egyptian: () => CalculationMethod.Egyptian(),
  Karachi: () => CalculationMethod.Karachi(),
  UmmAlQura: () => CalculationMethod.UmmAlQura(),
  Dubai: () => CalculationMethod.Dubai(),
  MoonsightingCommittee: () => CalculationMethod.MoonsightingCommittee(),
  ISNA: () => CalculationMethod.NorthAmerica(),
  Kuwait: () => CalculationMethod.Kuwait(),
  Qatar: () => CalculationMethod.Qatar(),
  Singapore: () => CalculationMethod.Singapore(),
  Tehran: () => CalculationMethod.Tehran(),
  Turkey: () => CalculationMethod.Turkey(),
};

const MADHAB_MAP: Record<MadhabName, (typeof Madhab)[keyof typeof Madhab]> = {
  Shafi: Madhab.Shafi,
  Hanafi: Madhab.Hanafi,
};

type ChosenRule = Exclude<HighLatitudeRuleName, 'Automatic'>;

const HIGH_LAT_MAP: Record<ChosenRule, (typeof HighLatitudeRule)[keyof typeof HighLatitudeRule]> = {
  MiddleOfTheNight: HighLatitudeRule.MiddleOfTheNight,
  SeventhOfTheNight: HighLatitudeRule.SeventhOfTheNight,
  TwilightAngle: HighLatitudeRule.TwilightAngle,
};

// adhan's own recommended() looks at the northern hemisphere only.
function resolveHighLatitudeRule(rule: HighLatitudeRuleName, latitude: number): ChosenRule {
  if (rule !== 'Automatic') return rule;
  return Math.abs(latitude) > HIGH_LATITUDE ? 'SeventhOfTheNight' : 'MiddleOfTheNight';
}

function buildParams(latitude: number, method: CalculationMethodName, madhab: MadhabName, highLatRule: HighLatitudeRuleName) {
  const params = METHOD_MAP[method]();
  params.madhab = MADHAB_MAP[madhab];
  params.highLatitudeRule = HIGH_LAT_MAP[resolveHighLatitudeRule(highLatRule, latitude)];
  return params;
}

export function calculateDaySchedule(
  latitude: number,
  longitude: number,
  date: Date,
  method: CalculationMethodName,
  madhab: MadhabName,
  highLatRule: HighLatitudeRuleName = 'Automatic',
): DaySchedule {
  const coordinates = new Coordinates(latitude, longitude);
  const params = buildParams(latitude, method, madhab, highLatRule);
  const pt = new PrayerTimes(coordinates, date, params);
  const tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  return {
    prayers: [
      makePrayerTime('fajr', pt.fajr),
      makePrayerTime('sunrise', pt.sunrise),
      makePrayerTime('dhuhr', pt.dhuhr),
      makePrayerTime('asr', pt.asr),
      makePrayerTime('maghrib', pt.maghrib),
      makePrayerTime('isha', pt.isha),
    ],
    nextFajr: new PrayerTimes(coordinates, tomorrow, params).fajr,
  };
}

// Sorted because near the polar circle twilight times can fall on the far side of the day, and
// tomorrow's Fajr can then precede tonight's Isha, so a stale one is never offered as upcoming.
export function resolvePrayerState({ prayers, nextFajr }: DaySchedule, now: Date): PrayerState {
  const t = now.getTime();
  const timeline = prayers
    .filter((p) => !isInvalidTime(p.time))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  const passed = timeline.filter((p) => p.time.getTime() <= t);
  const currentPrayer = passed.length > 0 ? passed[passed.length - 1].name : null;

  const upcoming = timeline.find((p) => p.time.getTime() > t);
  if (upcoming) return { currentPrayer, nextPrayer: upcoming.name, nextPrayerTime: upcoming.time };
  if (nextFajr.getTime() > t) return { currentPrayer, nextPrayer: 'fajr', nextPrayerTime: nextFajr };
  return { currentPrayer, nextPrayer: null, nextPrayerTime: null };
}

// The widget redraws when the clock crosses a prayer, tomorrow's Fajr or local midnight. The cap
// also bounds how late a redraw can be after the machine sleeps, because timers do not count
// the time asleep.
export const MAX_REFRESH_MS = 60_000;
const MIN_REFRESH_MS = 250;
const SETTLE_MS = 50;

export function msUntilRefresh({ prayers, nextFajr }: DaySchedule, now: Date): number {
  const t = now.getTime();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  const next = Math.min(midnight, ...[nextFajr, ...prayers.map((p) => p.time)].map((d) => d.getTime()).filter((ms) => ms > t));
  return Math.min(Math.max(next - t + SETTLE_MS, MIN_REFRESH_MS), MAX_REFRESH_MS);
}

function makePrayerTime(name: PrayerName, time: Date): PrayerTime {
  const meta = PRAYER_NAMES[name];
  return {
    name,
    displayName: meta.english,
    arabicName: meta.arabic,
    time,
    hasAdhan: meta.hasAdhan,
  };
}

interface SchedulerPreferences {
  adhanEnabled: boolean;
  mutedPrayers: PrayerName[];
  notificationsEnabled: boolean;
  reciter: string;
}

// Sunrise is a landmark, not a prayer, so it never reaches the scheduler. Tomorrow's Fajr
// is included so it still fires if the app misses the midnight rollover.
export function toSchedulerEntries({ prayers, nextFajr }: DaySchedule, prefs: SchedulerPreferences): PrayerTimeEntry[] {
  const fajr = prayers.find((p) => p.name === 'fajr');
  const candidates = prayers.filter((p) => p.hasAdhan);
  if (fajr) candidates.push({ ...fajr, time: nextFajr });

  return candidates
    .filter((p) => !isInvalidTime(p.time))
    .map((p) => ({
      name: p.name,
      time: p.time.toISOString(),
      hasAdhan: prefs.adhanEnabled && !prefs.mutedPrayers.includes(p.name),
      sendNotification: prefs.notificationsEnabled,
      reciter: prefs.reciter,
    }));
}

// Returns true if the time is NaN (happens at extreme latitudes when fajr/isha are undefined).
export function isInvalidTime(date: Date): boolean {
  return isNaN(date.getTime());
}
