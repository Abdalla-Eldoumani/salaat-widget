import { useState, useEffect, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { PrayerTimeResult, PrayerTimeEntry, PrayerName, CalculationMethodName, MadhabName, HighLatitudeRuleName } from '../types';
import { calculatePrayerTimes } from '../lib/prayer-calculator';
import { DATE_CHECK_INTERVAL_MS } from '../lib/constants';

interface UsePrayerTimesOptions {
  latitude: number;
  longitude: number;
  method: CalculationMethodName;
  madhab: MadhabName;
  highLatitudeRule?: HighLatitudeRuleName;
  adhanEnabled: boolean;
  mutedPrayers: PrayerName[];
  notificationsEnabled: boolean;
}

export function usePrayerTimes(options: UsePrayerTimesOptions): PrayerTimeResult {
  const { latitude, longitude, method, madhab, highLatitudeRule, adhanEnabled, mutedPrayers, notificationsEnabled } = options;

  // Track the current date (year/month/day) so we recalculate at midnight
  const [today, setToday] = useState(() => new Date());

  // Bump to force recalculation on wake from sleep
  const [wakeTick, setWakeTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // Only update if the date actually changed
      setToday((prev) => {
        if (
          prev.getFullYear() !== now.getFullYear() ||
          prev.getMonth() !== now.getMonth() ||
          prev.getDate() !== now.getDate()
        ) {
          return now;
        }
        return prev;
      });
    }, DATE_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  // Recalculate when the page becomes visible (after sleep/wake)
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        setWakeTick((t) => t + 1);
        // Also check date in case we slept past midnight
        setToday(new Date());
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const result = useMemo(
    () => calculatePrayerTimes(latitude, longitude, today, method, madhab, highLatitudeRule),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [latitude, longitude, today, method, madhab, highLatitudeRule, wakeTick],
  );

  // Push prayer times to the Rust scheduler whenever they change
  useEffect(() => {
    const entries: PrayerTimeEntry[] = result.prayers.map((p) => ({
      name: p.name,
      time: p.time.toISOString(),
      hasAdhan: adhanEnabled && p.hasAdhan && !mutedPrayers.includes(p.name),
      sendNotification: notificationsEnabled,
    }));
    invoke('set_prayer_times', { times: entries }).catch(() => {});
  }, [result, adhanEnabled, mutedPrayers, notificationsEnabled]);

  return result;
}
