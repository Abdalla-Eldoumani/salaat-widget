import { useState, useEffect, useCallback, useRef } from 'react';
import { fetch } from '@tauri-apps/plugin-http';
import type { LocationResult } from '../types';
import { parseLocationResponse } from '../lib/location';

interface UseGeolocationResult {
  // Null until a lookup has succeeded: callers fall back to the saved location, never to a guess.
  location: LocationResult | null;
  detecting: boolean;
  error: string | null;
  detect: () => Promise<void>;
}

const LOOKUP_URL = 'https://ipapi.co/json/';
const LOOKUP_TIMEOUT_MS = 10_000;

export function useGeolocation(enabled: boolean): UseGeolocationResult {
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only the newest lookup may update state, so a slow earlier one cannot overwrite it.
  const latest = useRef(0);

  const detect = useCallback(async () => {
    const id = ++latest.current;
    setDetecting(true);
    setError(null);
    try {
      const response = await fetch(LOOKUP_URL, {
        method: 'GET',
        headers: { 'User-Agent': 'SalaatWidget', Accept: 'application/json' },
        signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = parseLocationResponse(await response.json());
      if (id === latest.current) setLocation(result);
    } catch (e) {
      if (id !== latest.current) return;
      if (e instanceof Error && e.name === 'TimeoutError') setError('the lookup timed out');
      else setError(e instanceof Error ? e.message : 'lookup failed');
    } finally {
      if (id === latest.current) setDetecting(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) detect();
  }, [detect, enabled]);

  return { location, detecting, error, detect };
}
