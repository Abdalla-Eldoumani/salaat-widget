export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface PrayerTime {
  name: PrayerName;
  displayName: string;
  arabicName: string;
  time: Date;
  hasAdhan: boolean; // false for sunrise
}

export interface PrayerTimeResult {
  prayers: PrayerTime[];
  currentPrayer: PrayerName | null;
  nextPrayer: PrayerName | null;
  nextPrayerTime: Date | null;
}

export type DockEdge = 'top' | 'bottom' | 'left' | 'right' | 'floating';
export type WidgetLayout = 'horizontal' | 'vertical' | 'compact';

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MonitorBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleFactor: number;
}

export type CalculationMethodName =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'MoonsightingCommittee'
  | 'ISNA'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey';

export type MadhabName = 'Shafi' | 'Hanafi';

export type HighLatitudeRuleName =
  | 'MiddleOfTheNight'
  | 'SeventhOfTheNight'
  | 'TwilightAngle';

export interface SalaatSettings {
  latitude: number;
  longitude: number;
  timezone: string;
  locationName: string;
  autoDetectLocation: boolean;

  calculationMethod: CalculationMethodName;
  madhab: MadhabName;
  highLatitudeRule: HighLatitudeRuleName;

  notificationsEnabled: boolean;
  adhanEnabled: boolean;
  adhanReciter: string;
  mutedPrayers: PrayerName[];

  dockEdge: DockEdge;
  alwaysOnTop: boolean;
  autostart: boolean;
  theme: 'light' | 'dark' | 'system';

  timeFormat: '12h' | '24h';
  showCountdown: boolean;

  onboardingComplete: boolean;
  onboardingStep: number;
}

export interface LocationResult {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
}

// Sent from the frontend to the Rust scheduler
export interface PrayerTimeEntry {
  name: PrayerName;
  // ISO 8601 string because Date objects don't serialize across IPC
  time: string;
  hasAdhan: boolean;
  sendNotification: boolean;
}

// Emitted from Rust to the frontend when a prayer time arrives
export interface PrayerTimeEventPayload {
  prayer: PrayerName;
  time: string;
}
