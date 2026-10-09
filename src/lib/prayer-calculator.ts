import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Madhab,
  HighLatitudeRule,
  Qibla,
} from 'adhan';
import type {
  PrayerName,
  PrayerTimeResult,
  PrayerTime,
  PrayerTimeEntry,
  PrayerState,
  DaySchedule,
  CalculationMethodName,
  MadhabName,
  HighLatitudeRuleName,
} from '../types';
import { PRAYER_NAMES } from './constants';

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

const HIGH_LAT_MAP: Record<HighLatitudeRuleName, (typeof HighLatitudeRule)[keyof typeof HighLatitudeRule]> = {
  MiddleOfTheNight: HighLatitudeRule.MiddleOfTheNight,
  SeventhOfTheNight: HighLatitudeRule.SeventhOfTheNight,
  TwilightAngle: HighLatitudeRule.TwilightAngle,
};

// adhan returns prayer names as lowercase strings. Map to our PrayerName type.
function prayerToName(prayer: string): PrayerName | null {
  const map: Record<string, PrayerName> = {
    fajr: 'fajr', sunrise: 'sunrise', dhuhr: 'dhuhr',
    asr: 'asr', maghrib: 'maghrib', isha: 'isha',
  };
  return map[prayer] ?? null;
}

function buildParams(method: CalculationMethodName, madhab: MadhabName, highLatRule: HighLatitudeRuleName) {
  const params = METHOD_MAP[method]();
  params.madhab = MADHAB_MAP[madhab];
  params.highLatitudeRule = HIGH_LAT_MAP[highLatRule];
  return params;
}

export function calculateDaySchedule(
  latitude: number,
  longitude: number,
  date: Date,
  method: CalculationMethodName,
  madhab: MadhabName,
  highLatRule: HighLatitudeRuleName = 'MiddleOfTheNight',
): DaySchedule {
  const coordinates = new Coordinates(latitude, longitude);
  const params = buildParams(method, madhab, highLatRule);
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

// Sorted because near the polar circle twilight times can fall on the far side of the day.
export function resolvePrayerState({ prayers, nextFajr }: DaySchedule, now: Date): PrayerState {
  const t = now.getTime();
  const timeline = prayers
    .filter((p) => !isInvalidTime(p.time))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  const passed = timeline.filter((p) => p.time.getTime() <= t);
  const currentPrayer = passed.length > 0 ? passed[passed.length - 1].name : null;

  const upcoming = timeline.find((p) => p.time.getTime() > t);
  if (upcoming) return { currentPrayer, nextPrayer: upcoming.name, nextPrayerTime: upcoming.time };
  if (!isInvalidTime(nextFajr)) return { currentPrayer, nextPrayer: 'fajr', nextPrayerTime: nextFajr };
  return { currentPrayer, nextPrayer: null, nextPrayerTime: null };
}

export function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date,
  method: CalculationMethodName,
  madhab: MadhabName,
  highLatRule: HighLatitudeRuleName = 'MiddleOfTheNight',
): PrayerTimeResult {
  const coordinates = new Coordinates(latitude, longitude);
  const params = METHOD_MAP[method]();
  params.madhab = MADHAB_MAP[madhab];
  params.highLatitudeRule = HIGH_LAT_MAP[highLatRule];

  const pt = new PrayerTimes(coordinates, date, params);

  const prayers: PrayerTime[] = [
    makePrayerTime('fajr', pt.fajr),
    makePrayerTime('sunrise', pt.sunrise),
    makePrayerTime('dhuhr', pt.dhuhr),
    makePrayerTime('asr', pt.asr),
    makePrayerTime('maghrib', pt.maghrib),
    makePrayerTime('isha', pt.isha),
  ];

  const current = prayerToName(pt.currentPrayer());
  const next = prayerToName(pt.nextPrayer());
  const nextTime = next ? pt.timeForPrayer(pt.nextPrayer()) : null;

  return { prayers, currentPrayer: current, nextPrayer: next, nextPrayerTime: nextTime };
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

export function formatPrayerTime(date: Date, format: '12h' | '24h'): string {
  return date.toLocaleTimeString('en-US', {
    hour: format === '24h' ? '2-digit' : 'numeric',
    minute: '2-digit',
    hour12: format === '12h',
  });
}

// Returns true if the time is NaN (happens at extreme latitudes when fajr/isha are undefined).
export function isInvalidTime(date: Date): boolean {
  return isNaN(date.getTime());
}

export function getQiblaDirection(latitude: number, longitude: number): number {
  return Qibla(new Coordinates(latitude, longitude));
}
