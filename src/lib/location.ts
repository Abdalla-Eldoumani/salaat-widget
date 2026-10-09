import type { LocationResult, SalaatSettings } from '../types';

// "Calgary, CA" when both parts are known, otherwise whichever part the lookup returned.
export function formatLocationName(location: Pick<LocationResult, 'city' | 'country' | 'countryCode'>): string {
  const { city, country, countryCode } = location;
  if (city && countryCode) return `${city}, ${countryCode}`;
  return city || country || 'Detected location';
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

// Reads the ipapi.co JSON body. A refused lookup comes back as {"error": true, "reason": ...},
// and a body without usable coordinates must never be mistaken for a location.
export function parseLocationResponse(data: unknown): LocationResult {
  if (typeof data !== 'object' || data === null) throw new Error('unexpected response');
  const body = data as Record<string, unknown>;
  if (body.error) throw new Error(text(body.reason) || 'lookup refused');

  const { latitude, longitude } = body;
  if (
    typeof latitude !== 'number' || typeof longitude !== 'number' ||
    !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 || Math.abs(longitude) > 180
  ) {
    throw new Error('no usable coordinates in the response');
  }

  return {
    latitude,
    longitude,
    city: text(body.city),
    country: text(body.country_name),
    countryCode: text(body.country_code),
  };
}

type SavedLocation = Pick<SalaatSettings, 'latitude' | 'longitude' | 'locationName'>;

// The settings that differ from a successful detection. Without a detection nothing changes, so
// a failed lookup or a slow one can never replace the location the user saved.
export function locationUpdates(detected: LocationResult | null, saved: SavedLocation): Partial<SavedLocation> {
  if (!detected) return {};
  const updates: Partial<SavedLocation> = {};
  if (detected.latitude !== saved.latitude) updates.latitude = detected.latitude;
  if (detected.longitude !== saved.longitude) updates.longitude = detected.longitude;
  const name = formatLocationName(detected);
  if (name !== saved.locationName) updates.locationName = name;
  return updates;
}
