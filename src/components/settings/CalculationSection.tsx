import type { CalculationMethodName, HighLatitudeRuleName, MadhabName, SalaatSettings, UpdateSetting } from '../../types';
import { CALCULATION_METHODS, HIGH_LATITUDE_RULES } from '../../lib/constants';
import Choice from '../ui/Choice';
import Section from '../ui/Section';
import SelectField from '../ui/SelectField';

interface CalculationSectionProps {
  settings: SalaatSettings;
  onUpdate: UpdateSetting;
}

const MADHABS: { value: MadhabName; label: string; hint: string }[] = [
  { value: 'Shafi', label: 'Shafi', hint: 'Standard shadow' },
  { value: 'Hanafi', label: 'Hanafi', hint: 'Double shadow' },
];

export default function CalculationSection({ settings, onUpdate }: CalculationSectionProps) {
  const method = CALCULATION_METHODS[settings.calculationMethod];

  return (
    <Section title="Calculation">
      <SelectField
        label="Method"
        value={settings.calculationMethod}
        onChange={(next) => onUpdate('calculationMethod', next as CalculationMethodName)}
        hint={`${method.angles}. ${method.region}.`}
      >
        {Object.entries(CALCULATION_METHODS).map(([key, entry]) => (
          <option key={key} value={key}>{entry.displayName}</option>
        ))}
      </SelectField>

      <fieldset className="space-y-1">
        <legend className="text-xs text-muted">Madhab, which sets the time of Asr</legend>
        <div className="grid grid-cols-2 gap-2">
          {MADHABS.map(({ value, label, hint }) => (
            <Choice
              key={value}
              name="madhab"
              value={value}
              checked={settings.madhab === value}
              onSelect={() => onUpdate('madhab', value)}
            >
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs">{hint}</span>
              </span>
            </Choice>
          ))}
        </div>
      </fieldset>

      <SelectField
        label="High latitude rule"
        value={settings.highLatitudeRule}
        onChange={(next) => onUpdate('highLatitudeRule', next as HighLatitudeRuleName)}
        hint="Places Fajr and Isha where twilight is very long or never ends. Automatic uses the seventh of the night above 48° latitude and the middle of the night elsewhere."
      >
        {HIGH_LATITUDE_RULES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </SelectField>
    </Section>
  );
}
