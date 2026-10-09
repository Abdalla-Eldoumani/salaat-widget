import type { PrayerStatus } from '../../lib/prayer-display';

interface Tone {
  name: string;
  arabic: string;
  time: string;
}

// Text colours by status. Every pair clears 4.5:1 on both page grounds in both schemes.
export const TONE: Record<PrayerStatus, Tone> = {
  current: { name: 'text-gold-hi font-semibold', arabic: 'text-gold-hi', time: 'text-gold-hi' },
  upcoming: { name: 'text-muted', arabic: 'text-muted', time: 'text-ink' },
  passed: { name: 'text-faint', arabic: 'text-faint', time: 'text-faint' },
  unavailable: { name: 'text-faint', arabic: 'text-faint', time: 'text-faint' },
};
