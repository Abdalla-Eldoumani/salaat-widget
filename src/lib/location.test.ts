import { describe, expect, it } from 'vitest';
import { formatLocationName, locationUpdates, parseLocationResponse } from './location';

describe('formatLocationName', () => {
  it('joins city and country code', () => {
    expect(formatLocationName({ city: 'Calgary', country: 'Canada', countryCode: 'CA' })).toBe('Calgary, CA');
  });

  it('falls back to the country when the lookup has no city', () => {
    expect(formatLocationName({ city: '', country: 'Iceland', countryCode: 'IS' })).toBe('Iceland');
  });

  it('never returns an empty label', () => {
    expect(formatLocationName({ city: '', country: '', countryCode: '' })).toBe('Detected location');
  });
});

describe('parseLocationResponse', () => {
  const calgary = {
    ip: '203.0.113.7',
    city: 'Calgary',
    region: 'Alberta',
    region_code: 'AB',
    country_code: 'CA',
    country_name: 'Canada',
    latitude: 51.0486,
    longitude: -114.0708,
    timezone: 'America/Edmonton',
  };

  it('reads coordinates and place names', () => {
    expect(parseLocationResponse(calgary)).toEqual({
      latitude: 51.0486,
      longitude: -114.0708,
      city: 'Calgary',
      country: 'Canada',
      countryCode: 'CA',
    });
  });

  it('keeps coordinates when the place names are missing', () => {
    expect(parseLocationResponse({ latitude: 0, longitude: 0 })).toEqual({
      latitude: 0,
      longitude: 0,
      city: '',
      country: '',
      countryCode: '',
    });
  });

  it('reports the reason when the service refuses the lookup', () => {
    // Body returned with HTTP 429 when the address is over its quota.
    expect(() => parseLocationResponse({ error: true, reason: 'RateLimited', message: 'Visit the site for details' }))
      .toThrow('RateLimited');
  });

  it.each([
    ['text coordinates', { latitude: '51.04', longitude: '-114.07' }],
    ['a missing longitude', { latitude: 51.04 }],
    ['a latitude past the pole', { latitude: 91, longitude: 10 }],
    ['a longitude past the date line', { latitude: 10, longitude: 181 }],
    ['not a number', { latitude: Number.NaN, longitude: 10 }],
  ])('rejects %s', (_label, body) => {
    expect(() => parseLocationResponse(body)).toThrow();
  });

  it('rejects a body that is not an object', () => {
    expect(() => parseLocationResponse(null)).toThrow();
    expect(() => parseLocationResponse('Calgary')).toThrow();
  });
});

describe('locationUpdates', () => {
  const saved = { latitude: 52.52, longitude: 13.405, locationName: 'Berlin, DE' };

  it('leaves the saved location alone when nothing was detected', () => {
    // The widget used to rewrite the saved location with Calgary on every launch.
    expect(locationUpdates(null, saved)).toEqual({});
  });

  it('writes nothing when the detection matches what is saved', () => {
    const same = { latitude: 52.52, longitude: 13.405, city: 'Berlin', country: 'Germany', countryCode: 'DE' };
    expect(locationUpdates(same, saved)).toEqual({});
  });

  it('writes only the fields that changed', () => {
    const moved = { latitude: 48.1374, longitude: 11.5755, city: 'Munich', country: 'Germany', countryCode: 'DE' };
    expect(locationUpdates(moved, saved)).toEqual({ latitude: 48.1374, longitude: 11.5755, locationName: 'Munich, DE' });
  });
});
