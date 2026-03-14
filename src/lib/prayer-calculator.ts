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

// Converts PrayerTimeResult into the serializable format the Rust backend expects.
export function toSchedulerEntries(result: PrayerTimeResult, notificationsEnabled = true): PrayerTimeEntry[] {
  return result.prayers.map((p) => ({
    name: p.name,
    time: p.time.toISOString(),
    hasAdhan: p.hasAdhan,
    sendNotification: notificationsEnabled,
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
