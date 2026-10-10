import type { CalculationMethodName, HighLatitudeRuleName, MadhabName } from '../../types';
import { CALCULATION_METHODS, HIGH_LATITUDE_RULES } from '../../lib/constants';
import Choice from '../ui/Choice';
import SelectField from '../ui/SelectField';

interface MethodStepProps {
  method: CalculationMethodName;
  setMethod: (method: CalculationMethodName) => void;
  madhab: MadhabName;
  setMadhab: (madhab: MadhabName) => void;
  highLatitudeRule: HighLatitudeRuleName;
  setHighLatitudeRule: (rule: HighLatitudeRuleName) => void;
  isHighLatitude: boolean;
}

export default function MethodStep({
  method,
  setMethod,
  madhab,
  setMadhab,
  highLatitudeRule,
  setHighLatitudeRule,
  isHighLatitude,
}: MethodStepProps) {
  const info = CALCULATION_METHODS[method];

  return (
    <>
      <SelectField
        label="Method"
        value={method}
        onChange={(next) => setMethod(next as CalculationMethodName)}
        hint={`${info.angles}. ${info.region}.`}
      >
        {Object.entries(CALCULATION_METHODS).map(([key, entry]) => (
          <option key={key} value={key}>{entry.displayName}</option>
        ))}
      </SelectField>

      <fieldset className="space-y-1">
        <legend className="text-xs text-muted">Madhab, which sets the time of Asr</legend>
        <div className="grid grid-cols-2 gap-2">
          <Choice name="madhab" value="Shafi" checked={madhab === 'Shafi'} onSelect={() => setMadhab('Shafi')}>
            <span>
              <span className="block text-sm font-semibold">Shafi</span>
              <span className="block text-xs">Standard shadow</span>
            </span>
          </Choice>
          <Choice name="madhab" value="Hanafi" checked={madhab === 'Hanafi'} onSelect={() => setMadhab('Hanafi')}>
            <span>
              <span className="block text-sm font-semibold">Hanafi</span>
              <span className="block text-xs">Double shadow</span>
            </span>
          </Choice>
        </div>
      </fieldset>

      {isHighLatitude && (
        <div className="space-y-2 rounded-md border border-rule bg-raised p-3">
          <p className="text-xs text-gold-hi">
            Your location is above 48° latitude. Fajr and Isha may need adjustment in summer.
          </p>
          <SelectField
            label="High latitude rule"
            value={highLatitudeRule}
            onChange={(next) => setHighLatitudeRule(next as HighLatitudeRuleName)}
            hint="Automatic uses the seventh of the night at this latitude."
          >
            {HIGH_LATITUDE_RULES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectField>
        </div>
      )}
    </>
  );
}
