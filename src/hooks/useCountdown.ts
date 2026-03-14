import { useState, useEffect } from 'react';
import { COUNTDOWN_TICK_MS } from '../lib/constants';

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0m';

  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function useCountdown(target: Date | null): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;

    const interval = setInterval(() => setNow(Date.now()), COUNTDOWN_TICK_MS);
    return () => clearInterval(interval);
  }, [target]);

  if (!target) return '';
  const remaining = target.getTime() - now;
  if (remaining <= 0) return '0m';
  return formatCountdown(remaining);
}
