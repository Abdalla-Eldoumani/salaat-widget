import { useCountdown } from '../../hooks/useCountdown';
import { LESS_THAN_A_MINUTE } from '../../lib/prayer-display';

interface NextPrayerProps {
  name: string | null;
  target: Date | null;
  showCountdown: boolean;
  className?: string;
}

export default function NextPrayer({ name, target, showCountdown, className = '' }: NextPrayerProps) {
  const countdown = useCountdown(target);

  if (!showCountdown) return null;

  if (!name || !countdown) {
    return <p className={`text-xs text-faint ${className}`}>No more times today</p>;
  }

  const spoken = countdown === LESS_THAN_A_MINUTE ? 'less than a minute' : countdown;

  return (
    <div role="timer" aria-label={`${name} in ${spoken}`} className={className}>
      <span className="block text-xs leading-4 text-muted">{name} in</span>
      <span className="block text-sm font-semibold leading-5 tabular-nums text-gold-hi">{countdown}</span>
    </div>
  );
}
