import { useId } from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}

// The whole row is the click target, so the switch itself can stay compact.
export default function Switch({ checked, onChange, label, hint, disabled = false }: SwitchProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;

  return (
    <label className="flex min-h-11 items-center justify-between gap-4 py-1">
      <span className="min-w-0">
        <span id={labelId} className="block text-sm text-ink">{label}</span>
        {hint && <span id={hintId} className="block text-xs text-muted">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={hint ? hintId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-50 ${
          checked ? 'border-gold bg-gold' : 'border-edge bg-transparent'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute left-[3px] top-[3px] size-4 rounded-full transition-transform ${
            checked ? 'translate-x-5 bg-on-gold' : 'bg-muted'
          }`}
        />
      </button>
    </label>
  );
}
