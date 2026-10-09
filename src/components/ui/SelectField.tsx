import { useId } from 'react';
import type { ReactNode } from 'react';
import { ChevronIcon } from './icons';

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  // <option> and <optgroup> elements.
  children: ReactNode;
}

export default function SelectField({ label, value, onChange, hint, children }: SelectFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs text-muted">{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={hint ? hintId : undefined}
          className="min-h-11 w-full appearance-none rounded-md border border-edge bg-surface ps-3 pe-10 text-sm text-ink"
        >
          {children}
        </select>
        <ChevronIcon className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </div>
      {hint && <p id={hintId} className="text-xs text-faint">{hint}</p>}
    </div>
  );
}
