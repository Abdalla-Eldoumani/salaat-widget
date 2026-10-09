import type { LocationResult } from '../types';

// "Calgary, CA" when both parts are known, otherwise whichever part the lookup returned.
export function formatLocationName(location: Pick<LocationResult, 'city' | 'country' | 'countryCode'>): string {
  const { city, country, countryCode } = location;
  if (city && countryCode) return `${city}, ${countryCode}`;
  return city || country || 'Detected location';
}
