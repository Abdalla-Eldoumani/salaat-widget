import { useEffect, useState } from 'react';
import { COUNTDOWN_TICK_MS } from '../lib/constants';
import { formatRemaining } from '../lib/prayer-display';

// Lives in the component that shows the text, so the per-second tick redraws only that part.
export function useCountdown(target: Date | null): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;

    const interval = setInterval(() => setNow(Date.now()), COUNTDOWN_TICK_MS);
    return () => clearInterval(interval);
  }, [target]);

  return target ? formatRemaining(target.getTime() - now) : '';
}
