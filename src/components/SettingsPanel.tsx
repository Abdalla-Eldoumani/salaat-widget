import { useEffect } from 'react';
import { Window } from '@tauri-apps/api/window';
import { LogicalSize } from '@tauri-apps/api/dpi';
import { enable, disable, isEnabled } from '@tauri-apps/plugin-autostart';
import type {
  SalaatSettings,
  CalculationMethodName,
  MadhabName,
  HighLatitudeRuleName,
  PrayerName,
  LocationResult,
} from '../types';
import { CALCULATION_METHODS, PRAYER_NAMES, RECITERS } from '../lib/constants';
import { CITIES } from '../lib/cities';

const SETTINGS_SIZE = { width: 400, height: 520 };

interface SettingsPanelProps {
  settings: SalaatSettings;
  onUpdate: <K extends keyof SalaatSettings>(key: K, value: SalaatSettings[K]) => Promise<void>;
  onClose: () => void;
  geoLocation: LocationResult | null;
  geoDetecting: boolean;
  onGeoDetect: () => Promise<void>;
}

export default function SettingsPanel({
  settings,
  onUpdate,
  onClose,
  geoLocation,
  geoDetecting,
  onGeoDetect,
}: SettingsPanelProps) {
  // Resize window when settings open
  useEffect(() => {
    const appWindow = Window.getCurrent();
    appWindow.setSize(new LogicalSize(SETTINGS_SIZE.width, SETTINGS_SIZE.height)).catch(() => {});
    return () => {
      // Size will be restored by the dock system on next onDragEnd or init
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-[rgba(26,38,66,0.95)] backdrop-blur-xl overflow-y-auto khatam-pattern">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(200,168,78,0.10)]">
        <h2 className="text-sm font-semibold text-[#E8E2D6]">Settings</h2>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded text-[#7B89A1] hover:text-[#E8E2D6] focus:outline-none focus:ring-1 focus:ring-[#C8A84E]"
          aria-label="Close settings"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Location */}
        <Section title="Location">
          <Toggle
            label="Auto-detect location"
            checked={settings.autoDetectLocation}
            onChange={(v) => onUpdate('autoDetectLocation', v)}
          />
          {settings.autoDetectLocation ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7B89A1]">
                {geoDetecting ? 'Detecting...' : geoLocation ? `${geoLocation.city}, ${geoLocation.countryCode}` : settings.locationName}
              </span>
              <button
                onClick={onGeoDetect}
                disabled={geoDetecting}
                className="text-[10px] text-[#C8A84E] hover:text-[#E8E2D6] disabled:text-[#4A5568]"
              >
                Refresh
              </button>
            </div>
          ) : (
            <CityPicker
              value={settings.locationName}
              onSelect={(city) => {
                onUpdate('latitude', city.lat);
                onUpdate('longitude', city.lon);
                onUpdate('timezone', city.timezone);
                onUpdate('locationName', `${city.name}, ${city.countryCode}`);
              }}
            />
          )}
        </Section>

        {/* Calculation */}
        <Section title="Calculation">
          <Select
            label="Method"
            value={settings.calculationMethod}
            options={Object.entries(CALCULATION_METHODS).map(([key, info]) => ({
              value: key as CalculationMethodName,
              label: info.displayName,
              hint: info.region,
            }))}
            onChange={(v) => onUpdate('calculationMethod', v as CalculationMethodName)}
          />
          <Select
            label="Madhab"
            value={settings.madhab}
            options={[
              { value: 'Shafi' as MadhabName, label: 'Shafi (standard shadow length)' },
              { value: 'Hanafi' as MadhabName, label: 'Hanafi (double shadow length)' },
            ]}
            onChange={(v) => onUpdate('madhab', v as MadhabName)}
          />
          <Select
            label="High latitude rule"
            value={settings.highLatitudeRule}
            options={[
              { value: 'MiddleOfTheNight' as HighLatitudeRuleName, label: 'Middle of the night' },
              { value: 'SeventhOfTheNight' as HighLatitudeRuleName, label: 'Seventh of the night' },
              { value: 'TwilightAngle' as HighLatitudeRuleName, label: 'Twilight angle' },
            ]}
            onChange={(v) => onUpdate('highLatitudeRule', v as HighLatitudeRuleName)}
          />
        </Section>

        {/* Notifications & Audio */}
        <Section title="Notifications">
          <Toggle
            label="Notifications"
            checked={settings.notificationsEnabled}
            onChange={(v) => onUpdate('notificationsEnabled', v)}
          />
          <Toggle
            label="Adhan audio"
            checked={settings.adhanEnabled}
            onChange={(v) => onUpdate('adhanEnabled', v)}
          />
          {settings.adhanEnabled && (
            <Select
              label="Reciter"
              value={settings.adhanReciter}
              options={Object.entries(RECITERS).map(([key, name]) => ({
                value: key,
                label: name,
              }))}
              onChange={(v) => onUpdate('adhanReciter', v)}
            />
          )}
          <div className="space-y-1">
            <span className="text-[10px] text-[#7B89A1]">Mute individual prayers:</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PRAYER_NAMES) as PrayerName[])
                .filter((p) => PRAYER_NAMES[p].hasAdhan)
                .map((prayer) => {
                  const isMuted = settings.mutedPrayers.includes(prayer);
                  return (
                    <button
                      key={prayer}
                      onClick={() => {
                        const next = isMuted
                          ? settings.mutedPrayers.filter((p) => p !== prayer)
                          : [...settings.mutedPrayers, prayer];
                        onUpdate('mutedPrayers', next);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors
                        ${isMuted
                          ? 'border-[#4A5568] text-[#4A5568]'
                          : 'border-[#C8A84E] text-[#C8A84E]'
                        }
                        focus:outline-none focus:ring-1 focus:ring-[#C8A84E]`}
                      aria-label={`${isMuted ? 'Unmute' : 'Mute'} ${PRAYER_NAMES[prayer].english}`}
                    >
                      {PRAYER_NAMES[prayer].english}
                    </button>
                  );
                })}
            </div>
          </div>
        </Section>

        {/* Display */}
        <Section title="Display">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#7B89A1]">Time format</span>
            <div className="flex rounded overflow-hidden border border-[rgba(200,168,78,0.10)]">
              <button
                onClick={() => onUpdate('timeFormat', '12h')}
                className={`text-[10px] px-3 py-1 ${settings.timeFormat === '12h' ? 'bg-[#C8A84E] text-[#0B1120]' : 'text-[#7B89A1]'}`}
              >
                12h
              </button>
              <button
                onClick={() => onUpdate('timeFormat', '24h')}
                className={`text-[10px] px-3 py-1 ${settings.timeFormat === '24h' ? 'bg-[#C8A84E] text-[#0B1120]' : 'text-[#7B89A1]'}`}
              >
                24h
              </button>
            </div>
          </div>
          <Toggle
            label="Show countdown"
            checked={settings.showCountdown}
            onChange={(v) => onUpdate('showCountdown', v)}
          />
        </Section>

        {/* System */}
        <Section title="System">
          <AutostartToggle
            checked={settings.autostart}
            onChange={(v) => onUpdate('autostart', v)}
          />
          <AlwaysOnTopToggle
            checked={settings.alwaysOnTop}
            onChange={(v) => onUpdate('alwaysOnTop', v)}
          />
          <div className="text-[10px] text-[#4A5568] space-y-0.5">
            <p>Toggle widget: Ctrl+Shift+P</p>
            <p>Close settings: Escape</p>
          </div>
        </Section>
      </div>
    </div>
  );
}

// --- Sub-components ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-[#C8A84E]">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-xs text-[#7B89A1] group-hover:text-[#E8E2D6]">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-8 h-4 rounded-full relative transition-colors focus:outline-none focus:ring-1 focus:ring-[#C8A84E]
          ${checked ? 'bg-[#C8A84E]' : 'bg-[#4A5568]'}`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform
            ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </button>
    </label>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-[#7B89A1]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs bg-[rgba(15,23,42,0.85)] text-[#E8E2D6] border border-[rgba(200,168,78,0.10)] rounded px-2 py-1.5
          focus:outline-none focus:ring-1 focus:ring-[#C8A84E]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}{opt.hint ? ` — ${opt.hint}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

function CityPicker({ value, onSelect }: {
  value: string;
  onSelect: (city: { name: string; countryCode: string; lat: number; lon: number; timezone: string }) => void;
}) {
  const isKnownCity = CITIES.some((c) => `${c.name}, ${c.countryCode}` === value);

  return (
    <div className="space-y-1">
      <label className="text-xs text-[#7B89A1]">City</label>
      <select
        value={value}
        onChange={(e) => {
          const city = CITIES.find((c) => `${c.name}, ${c.countryCode}` === e.target.value);
          if (city) onSelect(city);
        }}
        className="w-full text-xs bg-[rgba(15,23,42,0.85)] text-[#E8E2D6] border border-[rgba(200,168,78,0.10)] rounded px-2 py-1.5
          focus:outline-none focus:ring-1 focus:ring-[#C8A84E]"
      >
        {!isKnownCity && <option value={value}>{value}</option>}
        {CITIES.map((city) => {
          const label = `${city.name}, ${city.countryCode}`;
          return (
            <option key={`${city.name}-${city.countryCode}`} value={label}>
              {city.name}, {city.country}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function AutostartToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  async function toggle() {
    const next = !checked;
    try {
      if (next) {
        await enable();
      } else {
        await disable();
      }
      // Verify the actual state
      const actual = await isEnabled();
      onChange(actual);
    } catch {
      // Silently fail — autostart may not be supported
      onChange(next);
    }
  }

  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-xs text-[#7B89A1] group-hover:text-[#E8E2D6]">Launch at startup</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={toggle}
        className={`w-8 h-4 rounded-full relative transition-colors focus:outline-none focus:ring-1 focus:ring-[#C8A84E]
          ${checked ? 'bg-[#C8A84E]' : 'bg-[#4A5568]'}`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform
            ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </button>
    </label>
  );
}

function AlwaysOnTopToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  async function toggle() {
    const next = !checked;
    try {
      const appWindow = Window.getCurrent();
      await appWindow.setAlwaysOnTop(next);
      onChange(next);
    } catch {
      onChange(next);
    }
  }

  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-xs text-[#7B89A1] group-hover:text-[#E8E2D6]">Always on top</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={toggle}
        className={`w-8 h-4 rounded-full relative transition-colors focus:outline-none focus:ring-1 focus:ring-[#C8A84E]
          ${checked ? 'bg-[#C8A84E]' : 'bg-[#4A5568]'}`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform
            ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </button>
    </label>
  );
}
