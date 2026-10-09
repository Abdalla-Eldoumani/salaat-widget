import type { PrayerName, SalaatSettings, UpdateSetting } from '../../types';
import { PRAYER_NAMES, RECITERS } from '../../lib/constants';
import MuteButton from '../widget/MuteButton';
import Section from '../ui/Section';
import SelectField from '../ui/SelectField';
import Switch from '../ui/Switch';

interface NotificationsSectionProps {
  settings: SalaatSettings;
  onUpdate: UpdateSetting;
}

const ADHAN_PRAYERS = (Object.keys(PRAYER_NAMES) as PrayerName[]).filter((name) => PRAYER_NAMES[name].hasAdhan);

export default function NotificationsSection({ settings, onUpdate }: NotificationsSectionProps) {
  function toggleAdhan(prayer: PrayerName, on: boolean) {
    const muted = on ? settings.mutedPrayers.filter((p) => p !== prayer) : [...settings.mutedPrayers, prayer];
    return onUpdate('mutedPrayers', muted);
  }

  return (
    <Section title="Notifications">
      <Switch
        label="Desktop notifications"
        checked={settings.notificationsEnabled}
        onChange={(next) => onUpdate('notificationsEnabled', next)}
      />
      <Switch
        label="Play the adhan"
        checked={settings.adhanEnabled}
        onChange={(next) => onUpdate('adhanEnabled', next)}
      />
      <div className="flex min-h-11 items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink">Mute now</p>
          <p className="text-xs text-muted">Silences the adhan until you unmute. The tray icon shows the state.</p>
        </div>
        <MuteButton />
      </div>

      {settings.adhanEnabled && (
        <>
          <SelectField
            label="Reciter"
            value={settings.adhanReciter}
            onChange={(next) => onUpdate('adhanReciter', next)}
          >
            {Object.entries(RECITERS).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </SelectField>

          <fieldset className="space-y-1">
            <legend className="text-xs text-muted">Adhan for each prayer</legend>
            <div className="flex flex-wrap gap-2">
              {ADHAN_PRAYERS.map((prayer) => {
                const on = !settings.mutedPrayers.includes(prayer);
                return (
                  <button
                    key={prayer}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleAdhan(prayer, !on)}
                    className={`min-h-11 rounded-md border px-4 text-sm transition-colors ${
                      on ? 'border-gold bg-raised text-gold-hi' : 'border-edge text-muted hover:bg-raised hover:text-ink'
                    }`}
                  >
                    {PRAYER_NAMES[prayer].english}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </>
      )}
    </Section>
  );
}
