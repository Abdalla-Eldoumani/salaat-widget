import { useState, useEffect, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { PrayerTimeResult, PrayerName, CalculationMethodName, MadhabName, HighLatitudeRuleName } from '../types';
import { calculateDaySchedule, msUntilRefresh, resolvePrayerState, toSchedulerEntries } from '../lib/prayer-calculator';

interface UsePrayerTimesOptions {
  latitude: number;
  longitude: number;
  method: CalculationMethodName;
  madhab: MadhabName;
  highLatitudeRule?: HighLatitudeRuleName;
  adhanEnabled: boolean;
  adhanReciter: string;
  mutedPrayers: PrayerName[];
  notificationsEnabled: boolean;
}

export function usePrayerTimes(options: UsePrayerTimesOptions): PrayerTimeResult {
  const { latitude, longitude, method, madhab, highLatitudeRule, adhanEnabled, adhanReciter, mutedPrayers, notificationsEnabled } = options;

  const [now, setNow] = useState(() => new Date());
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  // Keyed on the calendar day, not on `now`, so crossing a prayer does not recompute the day.
  const schedule = useMemo(
    () => calculateDaySchedule(latitude, longitude, new Date(year, month, date), method, madhab, highLatitudeRule),
    [latitude, longitude, year, month, date, method, madhab, highLatitudeRule],
  );

  const state = useMemo(() => resolvePrayerState(schedule, now), [schedule, now]);

  // One timer, re-armed after every tick: it fires at the next prayer or midnight, and at
  // least once a minute so a wake from sleep is corrected within that minute.
  useEffect(() => {
    const timer = setTimeout(() => setNow(new Date()), msUntilRefresh(schedule, now));
    return () => clearTimeout(timer);
  }, [schedule, now]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') setNow(new Date());
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  useEffect(() => {
    const entries = toSchedulerEntries(schedule, {
      adhanEnabled,
      mutedPrayers,
      notificationsEnabled,
      reciter: adhanReciter,
    });
    invoke('set_prayer_times', { times: entries }).catch((err) => console.error('set_prayer_times failed', err));
  }, [schedule, adhanEnabled, adhanReciter, mutedPrayers, notificationsEnabled]);

  return useMemo(() => ({ prayers: schedule.prayers, ...state }), [schedule, state]);
}
