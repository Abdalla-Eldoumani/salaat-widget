import { useEffect, useId, useRef } from 'react';
import type { LocationResult, SalaatSettings, UpdateSetting } from '../../types';
import IconButton from '../ui/IconButton';
import { CloseIcon } from '../ui/icons';
import Rule from '../ui/Rule';
import CalculationSection from './CalculationSection';
import DisplaySection from './DisplaySection';
import LocationSection from './LocationSection';
import NotificationsSection from './NotificationsSection';
import SystemSection from './SystemSection';

interface SettingsPanelProps {
  settings: SalaatSettings;
  onUpdate: UpdateSetting;
  onClose: () => void;
  geoLocation: LocationResult | null;
  geoDetecting: boolean;
  geoError: string | null;
  onGeoDetect: () => Promise<void>;
}

export default function SettingsPanel({ settings, onUpdate, onClose, geoLocation, geoDetecting, geoError, onGeoDetect }: SettingsPanelProps) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Opening settings replaces the widget, so a screen reader starts at the title.
  useEffect(() => titleRef.current?.focus(), []);

  return (
    <main aria-labelledby={titleId} className="flex h-full flex-col">
      <header className="space-y-1 px-6 pt-4">
        <div className="flex items-center justify-between">
          <h1 id={titleId} ref={titleRef} tabIndex={-1} className="font-display text-2xl font-bold text-ink">
            Settings
          </h1>
          <IconButton label="Close settings" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <Rule />
      </header>

      <div className="scroll-quiet min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
        <LocationSection
          settings={settings}
          onUpdate={onUpdate}
          geoLocation={geoLocation}
          geoDetecting={geoDetecting}
          geoError={geoError}
          onGeoDetect={onGeoDetect}
        />
        <CalculationSection settings={settings} onUpdate={onUpdate} />
        <NotificationsSection settings={settings} onUpdate={onUpdate} />
        <DisplaySection settings={settings} onUpdate={onUpdate} />
        <SystemSection settings={settings} onUpdate={onUpdate} />
      </div>
    </main>
  );
}
