import type { LocationResult } from '../../types';
import Button from '../ui/Button';
import CityPicker from '../ui/CityPicker';

interface LocationStepProps {
  geoLocation: LocationResult | null;
  geoDetecting: boolean;
  geoError: string | null;
  onGeoDetect: () => Promise<void>;
  manual: boolean;
  setManual: (manual: boolean) => void;
  city: string;
  setCity: (label: string) => void;
}

export default function LocationStep({
  geoLocation,
  geoDetecting,
  geoError,
  onGeoDetect,
  manual,
  setManual,
  city,
  setCity,
}: LocationStepProps) {
  if (manual) {
    return (
      <div className="space-y-3">
        <CityPicker value={city} onSelect={(chosen) => setCity(`${chosen.name}, ${chosen.countryCode}`)} />
        <Button variant="quiet" onClick={() => setManual(false)}>Detect my location instead</Button>
      </div>
    );
  }

  const latitude = geoLocation && `${Math.abs(geoLocation.latitude).toFixed(2)}° ${geoLocation.latitude >= 0 ? 'N' : 'S'}`;
  const longitude = geoLocation && `${Math.abs(geoLocation.longitude).toFixed(2)}° ${geoLocation.longitude >= 0 ? 'E' : 'W'}`;

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-rule bg-raised p-4" aria-live="polite">
        {geoDetecting || (!geoLocation && !geoError) ? (
          <p className="text-sm text-muted">Detecting your location</p>
        ) : geoLocation ? (
          <>
            <p className="text-base font-semibold text-ink">
              {[geoLocation.city, geoLocation.country].filter(Boolean).join(', ')}
            </p>
            <p className="mt-1 text-xs text-muted">{latitude}, {longitude}</p>
          </>
        ) : (
          <p className="text-sm text-ink">Could not detect your location ({geoError}). Try again or choose a city.</p>
        )}
      </div>
      <div className="flex flex-wrap gap-x-2">
        <Button variant="quiet" onClick={() => setManual(true)}>Choose a city instead</Button>
        <Button variant="quiet" onClick={onGeoDetect} disabled={geoDetecting}>Detect again</Button>
      </div>
      <p className="text-xs text-faint">
        Detection looks up an approximate location from your IP address through ipapi.co. Choosing a city sends nothing.
      </p>
    </div>
  );
}
