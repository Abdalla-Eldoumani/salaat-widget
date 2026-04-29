import type { SalaatSettings, CalculationMethodName, PrayerName } from '../types';

export const DEFAULT_SETTINGS: SalaatSettings = {
  latitude: 51.0447,
  longitude: -114.0719,
  timezone: 'America/Edmonton',
  locationName: 'Calgary, AB',
  autoDetectLocation: true,

  calculationMethod: 'ISNA',
  madhab: 'Shafi',
  highLatitudeRule: 'MiddleOfTheNight',

  notificationsEnabled: true,
  adhanEnabled: true,
  adhanReciter: 'adhan-makkah',
  mutedPrayers: [],

  dockEdge: 'top',
  alwaysOnTop: true,
  autostart: false,
  theme: 'dark',

  timeFormat: '12h',
  showCountdown: true,

  onboardingComplete: false,
  onboardingStep: 0,
};

// Display info for each calculation method.
// Region helps users pick the right one during onboarding.
export const CALCULATION_METHODS: Record<CalculationMethodName, {
  displayName: string;
  angles: string;
  region: string;
}> = {
  MuslimWorldLeague: {
    displayName: 'Muslim World League',
    angles: 'Fajr 18°, Isha 17°',
    region: 'Europe, Far East, parts of Americas',
  },
  Egyptian: {
    displayName: 'Egyptian General Authority',
    angles: 'Fajr 19.5°, Isha 17.5°',
    region: 'Africa, Syria, Lebanon, Malaysia',
  },
  Karachi: {
    displayName: 'University of Islamic Sciences, Karachi',
    angles: 'Fajr 18°, Isha 18°',
    region: 'Pakistan, Bangladesh, India, Afghanistan',
  },
  UmmAlQura: {
    displayName: 'Umm al-Qura, Makkah',
    angles: 'Fajr 18.5°, Isha 90min after Maghrib',
    region: 'Arabian Peninsula',
  },
  Dubai: {
    displayName: 'Dubai',
    angles: 'Fajr 18.2°, Isha 18.2°',
    region: 'UAE',
  },
  MoonsightingCommittee: {
    displayName: 'Moonsighting Committee',
    angles: 'Fajr 18°, Isha varies by season',
    region: 'Worldwide (Moonsighting methodology)',
  },
  ISNA: {
    displayName: 'Islamic Society of North America',
    angles: 'Fajr 15°, Isha 15°',
    region: 'North America',
  },
  Kuwait: {
    displayName: 'Kuwait',
    angles: 'Fajr 18°, Isha 17.5°',
    region: 'Kuwait',
  },
  Qatar: {
    displayName: 'Qatar',
    angles: 'Modified Umm al-Qura',
    region: 'Qatar',
  },
  Singapore: {
    displayName: 'Singapore',
    angles: 'Fajr 20°, Isha 18°',
    region: 'Singapore, Malaysia',
  },
  Tehran: {
    displayName: 'Institute of Geophysics, Tehran',
    angles: 'Fajr 17.7°, Maghrib 4.5°, Isha 14°',
    region: 'Iran',
  },
  Turkey: {
    displayName: 'Diyanet, Turkey',
    angles: 'Fajr 18°, Isha 17°',
    region: 'Turkey',
  },
};

// Used during onboarding to auto-suggest a method based on country code.
export const COUNTRY_TO_METHOD: Record<string, CalculationMethodName> = {
  US: 'ISNA',
  CA: 'ISNA',
  SA: 'UmmAlQura',
  EG: 'Egyptian',
  PK: 'Karachi',
  IN: 'Karachi',
  BD: 'Karachi',
  TR: 'Turkey',
  IR: 'Tehran',
  AE: 'Dubai',
  SG: 'Singapore',
  MY: 'Singapore',
  KW: 'Kuwait',
  QA: 'Qatar',
};

export const PRAYER_NAMES: Record<PrayerName, {
  english: string;
  arabic: string;
  hasAdhan: boolean;
}> = {
  fajr:    { english: 'Fajr',    arabic: 'الفجر',   hasAdhan: true },
  sunrise: { english: 'Sunrise', arabic: 'الشروق',  hasAdhan: false },
  dhuhr:   { english: 'Dhuhr',   arabic: 'الظهر',   hasAdhan: true },
  asr:     { english: 'Asr',     arabic: 'العصر',    hasAdhan: true },
  maghrib: { english: 'Maghrib', arabic: 'المغرب',   hasAdhan: true },
  isha:    { english: 'Isha',    arabic: 'العشاء',   hasAdhan: true },
};

// Available adhan reciters. Keys match filenames in src-tauri/resources/audio/ (without extension).
export const RECITERS: Record<string, string> = {
  'adhan-makkah': 'Makkah',
  'adhan-madinah': 'Madinah',
  'adhan-alaqsa': 'Al-Aqsa',
  'adhan-abdul-basit': 'Abdul Basit',
  'adhan-minshawi': 'Minshawi',
  'adhan-egypt': 'Egypt',
};

// Logical pixel dimensions for each layout mode.
export const WIDGET_DIMENSIONS = {
  horizontal: { width: 640, height: 60 },
  vertical:   { width: 200, height: 420 },
  compact:    { width: 240, height: 280 },
} as const;

// How close (logical pixels) the window must be to an edge before snapping.
export const SNAP_THRESHOLD_PX = 40;

// How often (ms) the frontend checks if the date has changed (for midnight rollover).
export const DATE_CHECK_INTERVAL_MS = 60_000;

// How often (ms) the countdown display updates.
export const COUNTDOWN_TICK_MS = 1_000;
