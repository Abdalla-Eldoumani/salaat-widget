import type { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'type'> {
  label: string;
}

// 44px square hit area around a small icon. The label is the accessible name and the tooltip
// unless a longer title is given.
export default function IconButton({ label, title, className = '', children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      className={`flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink aria-pressed:text-gold-hi ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
