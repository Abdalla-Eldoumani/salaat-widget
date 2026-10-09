import type { LocationResult, SalaatSettings, UpdateSetting } from '../../types';
import { formatLocationName } from '../../lib/location';
import Button from '../ui/Button';
import CityPicker from '../ui/CityPicker';
import Section from '../ui/Section';
import Switch from '../ui/Switch';

interface LocationSectionProps {
  settings: SalaatSettings;
  onUpdate: UpdateSetting;
  geoLocation: LocationResult | null;
  geoDetecting: boolean;
  geoError: string | null;
  onGeoDetect: () => Promise<void>;
}

export default function LocationSection({ settings, onUpdate, geoLocation, geoDetecting, geoError, onGeoDetect }: LocationSectionProps) {
  return (
    <Section title="Location">
      <Switch
        label="Detect location automatically"
        hint="Looks up an approximate location from your IP address through ipapi.co each time the app starts."
        checked={settings.autoDetectLocation}
        onChange={(next) => onUpdate('autoDetectLocation', next)}
      />
      {settings.autoDetectLocation ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-ink" aria-live="polite">
              {geoDetecting ? 'Detecting' : geoLocation ? formatLocationName(geoLocation) : settings.locationName}
            </p>
            <Button variant="quiet" onClick={onGeoDetect} disabled={geoDetecting}>Refresh</Button>
          </div>
          {geoError && !geoDetecting && (
            <p role="status" className="text-xs text-gold-hi">
              Could not detect your location ({geoError}). Prayer times use the saved location, {settings.locationName}.
            </p>
          )}
        </div>
      ) : (
        <CityPicker
          value={settings.locationName}
          onSelect={async (city) => {
            await onUpdate('latitude', city.lat);
            await onUpdate('longitude', city.lon);
            await onUpdate('locationName', `${city.name}, ${city.countryCode}`);
          }}
        />
      )}
    </Section>
  );
}
