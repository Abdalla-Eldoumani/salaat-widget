/*
 * Track is 40px wide with a 16px thumb. The thumb's left edge sits at 2px when off
 * and at calc(100% - 18px) when on. The calc value pins the thumb's right edge
 * mathematically at 100% - 2px regardless of HiDPI scaling, which is what
 * eliminates the sub-pixel overflow that the previous transform-based toggle hit.
 */

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export default function Switch({ checked, onChange, label, ariaLabel, disabled = false }: SwitchProps) {
  return (
    <label className={`flex items-center justify-between cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <span className="text-xs text-[#7B89A1] group-hover:text-[#E8E2D6]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-10 h-5 rounded-full overflow-hidden transition-colors focus:outline-none focus:ring-1 focus:ring-[#C8A84E]
          ${checked ? 'bg-[#C8A84E]' : 'bg-[#4A5568]'}`}
      >
        <span
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow transition-[left] duration-200"
          style={{ left: checked ? 'calc(100% - 18px)' : '2px' }}
        />
      </button>
    </label>
  );
}
