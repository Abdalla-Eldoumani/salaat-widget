import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: 'solid' | 'quiet';
}

const VARIANTS = {
  solid: 'bg-gold px-6 font-semibold text-on-gold hover:bg-gold-hi hover:text-on-gold',
  quiet: 'px-3 text-gold-hi hover:bg-raised',
} as const;

export default function Button({ variant = 'solid', className = '', ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center rounded-md text-sm transition-colors disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
}
