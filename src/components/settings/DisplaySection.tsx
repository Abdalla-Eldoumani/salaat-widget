import type { SalaatSettings, UpdateSetting } from '../../types';
import Choice from '../ui/Choice';
import Section from '../ui/Section';
import Switch from '../ui/Switch';

interface DisplaySectionProps {
  settings: SalaatSettings;
  onUpdate: UpdateSetting;
}

const FORMATS = ['12h', '24h'] as const;

export default function DisplaySection({ settings, onUpdate }: DisplaySectionProps) {
  return (
    <Section title="Display">
      <fieldset className="space-y-1">
        <legend className="text-xs text-muted">Time format</legend>
        <div className="grid grid-cols-2 gap-2">
          {FORMATS.map((format) => (
            <Choice
              key={format}
              name="time-format"
              value={format}
              checked={settings.timeFormat === format}
              onSelect={() => onUpdate('timeFormat', format)}
              solid
            >
              {format}
            </Choice>
          ))}
        </div>
      </fieldset>
      <Switch
        label="Show time to the next prayer"
        checked={settings.showCountdown}
        onChange={(next) => onUpdate('showCountdown', next)}
      />
    </Section>
  );
}
