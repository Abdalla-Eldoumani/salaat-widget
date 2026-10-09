import { describe, expect, it } from 'vitest';
import { formatLocationName } from './location';

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
