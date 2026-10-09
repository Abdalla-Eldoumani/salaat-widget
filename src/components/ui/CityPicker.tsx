import { CITIES, type City } from '../../lib/cities';
import SelectField from './SelectField';

export const cityLabel = (city: City) => `${city.name}, ${city.countryCode}`;

const BY_COUNTRY = CITIES.reduce<Map<string, City[]>>((groups, city) => {
  groups.set(city.country, [...(groups.get(city.country) ?? []), city]);
  return groups;
}, new Map());

interface CityPickerProps {
  // "Name, CC" of the chosen city, or '' before a choice. A value outside the list (a place
  // found by detection) is kept as its own entry so the box never shows a different city.
  value: string;
  onSelect: (city: City) => void;
  label?: string;
}

export default function CityPicker({ value, onSelect, label = 'City' }: CityPickerProps) {
  const listed = value === '' || CITIES.some((c) => cityLabel(c) === value);

  return (
    <SelectField
      label={label}
      value={value}
      onChange={(next) => {
        const city = CITIES.find((c) => cityLabel(c) === next);
        if (city) onSelect(city);
      }}
    >
      {value === '' && <option value="" disabled>Choose a city</option>}
      {!listed && <option value={value}>{value}</option>}
      {[...BY_COUNTRY].map(([country, cities]) => (
        <optgroup key={country} label={country}>
          {cities.map((city) => (
            <option key={cityLabel(city)} value={cityLabel(city)}>{city.name}</option>
          ))}
        </optgroup>
      ))}
    </SelectField>
  );
}
