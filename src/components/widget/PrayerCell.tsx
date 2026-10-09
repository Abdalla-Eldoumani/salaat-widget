import type { PrayerTime } from '../../types';
import type { PrayerStatus } from '../../lib/prayer-display';
import Star from '../ui/Star';
import ClockText from './ClockText';
import { TONE } from './tone';

interface PrayerCellProps {
  prayer: PrayerTime;
  status: PrayerStatus;
  timeFormat: '12h' | '24h';
}

// One prayer in the horizontal bar: Latin name, Arabic name, time.
export default function PrayerCell({ prayer, status, timeFormat }: PrayerCellProps) {
  const tone = TONE[status];
  const current = status === 'current';

  return (
    <li
      aria-current={current ? 'time' : undefined}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-[3px] border-s border-rule-faint first:border-s-0 ${
        current ? 'bg-raised shadow-[inset_0_-2px_0_var(--gold)]' : ''
      }`}
    >
      <span className={`flex items-center gap-1 text-xs leading-4 ${tone.name}`}>
        {current && <Star className="size-2 shrink-0" />}
        {prayer.displayName}
      </span>
      <span lang="ar" dir="rtl" className={`font-arabic text-[15px] leading-[18px] ${tone.arabic}`}>
        {prayer.arabicName}
      </span>
      <span className={`whitespace-nowrap text-sm leading-4 tabular-nums ${prayer.hasAdhan ? 'font-semibold' : 'font-normal'} ${tone.time}`}>
        <ClockText date={prayer.time} format={timeFormat} />
      </span>
    </li>
  );
}
