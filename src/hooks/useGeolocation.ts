import { useState, useEffect, useCallback } from 'react';
import { fetch } from '@tauri-apps/plugin-http';
import type { LocationResult } from '../types';
import { DEFAULT_SETTINGS } from '../lib/constants';

interface UseGeolocationResult {
  location: LocationResult;
  detecting: boolean;
  error: string | null;
  detect: () => Promise<void>;
}

const defaultLocation: LocationResult = {
  latitude: DEFAULT_SETTINGS.latitude,
  longitude: DEFAULT_SETTINGS.longitude,
  city: DEFAULT_SETTINGS.locationName.split(',')[0],
  country: 'Canada',
  countryCode: 'CA',
  timezone: DEFAULT_SETTINGS.timezone,
};

export function useGeolocation(enabled: boolean): UseGeolocationResult {
  const [location, setLocation] = useState<LocationResult>(defaultLocation);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async () => {
    setDetecting(true);
    setError(null);
    try {
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        headers: {
          'User-Agent': 'SalaatWidget/0.1.0',
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json() as Record<string, unknown>;
      const result: LocationResult = {
        latitude: data.latitude as number,
        longitude: data.longitude as number,
        city: (data.city as string) || 'Unknown',
        country: (data.country_name as string) || 'Unknown',
        countryCode: (data.country_code as string) || '',
        timezone: (data.timezone as string) || Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      if (typeof result.latitude !== 'number' || typeof result.longitude !== 'number') {
        throw new Error('Invalid coordinates in API response');
      }
      setLocation(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Location detection failed');
    } finally {
      setDetecting(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      detect();
    }
  }, [detect, enabled]);

  return { location, detecting, error, detect };
}
