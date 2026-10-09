import type { ReactNode } from 'react';

interface ChoiceProps {
  name: string;
  value: string;
  checked: boolean;
  onSelect: (value: string) => void;
  children: ReactNode;
  // A filled gold face for compact toggles; the default is a gold outline on a raised face.
  solid?: boolean;
  className?: string;
}

// A native radio, so arrow keys and grouping come from the browser. The input is hidden and the
// face next to it is styled from :checked (see index.css).
export default function Choice({ name, value, checked, onSelect, children, solid = false, className = '' }: ChoiceProps) {
  return (
    <label className={`block ${solid ? 'choice-solid' : ''} ${className}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="choice-input sr-only"
      />
      <span className="choice-face h-full">{children}</span>
    </label>
  );
}
