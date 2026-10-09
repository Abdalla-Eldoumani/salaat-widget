import type { PrayerTime } from '../../types';
import type { PrayerStatus } from '../../lib/prayer-display';
import Star from '../ui/Star';
import ClockText from './ClockText';
import { TONE } from './tone';

interface PrayerRowProps {
  prayer: PrayerTime;
  status: PrayerStatus;
  timeFormat: '12h' | '24h';
  // Stacked puts the Arabic name under the Latin one; inline sets them side by side.
  names: 'stacked' | 'inline';
}

// One prayer in the vertical and compact layouts.
export default function PrayerRow({ prayer, status, timeFormat, names }: PrayerRowProps) {
  const tone = TONE[status];
  const current = status === 'current';

  const latin = <span className={`text-[13px] leading-4 ${tone.name}`}>{prayer.displayName}</span>;
  const arabic = (
    <span lang="ar" dir="rtl" className={`font-arabic text-base leading-5 ${tone.arabic}`}>
      {prayer.arabicName}
    </span>
  );

  return (
    <li
      aria-current={current ? 'time' : undefined}
      className={`relative flex min-h-8 flex-1 items-center justify-between gap-2 rounded-[3px] px-5 ${current ? 'bg-raised' : ''}`}
    >
      {current && <Star className="absolute start-1.5 top-1/2 size-2 -translate-y-1/2 text-gold-hi" />}
      {names === 'stacked' ? (
        <span className="flex flex-col items-start">{latin}{arabic}</span>
      ) : (
        <span className="flex items-baseline gap-2">{latin}{arabic}</span>
      )}
      <span className={`whitespace-nowrap text-sm tabular-nums ${prayer.hasAdhan ? 'font-semibold' : 'font-normal'} ${tone.time}`}>
        <ClockText date={prayer.time} format={timeFormat} />
      </span>
    </li>
  );
}
