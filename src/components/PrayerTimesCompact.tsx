import type { PrayerTimeResult, PrayerName } from '../types';
import { PRAYER_NAMES } from '../lib/constants';
import { formatPrayerTime, isInvalidTime } from '../lib/prayer-calculator';
import CountdownTimer from './CountdownTimer';
import DragHandle from './DragHandle';
import MuteButton from './MuteButton';
import SettingsButton from './SettingsButton';
import HideButton from './HideButton';

interface PrayerTimesCompactProps {
  prayerTimes: PrayerTimeResult;
  countdown: string;
  timeFormat: '12h' | '24h';
  onDragEnd: () => void;
  onSettingsOpen: () => void;
}

function getRowClasses(prayerName: PrayerName, currentPrayer: PrayerName | null, order: PrayerName[]): {
  card: string;
  name: string;
  arabic: string;
  time: string;
} {
  if (prayerName === currentPrayer) {
    return {
      card: 'border-l-2 border-l-[#C8A84E] bg-[rgba(200,168,78,0.08)]',
      name: 'text-[#C8A84E] font-medium',
      arabic: 'text-[#C8A84E]/70',
      time: 'text-[#C8A84E]',
    };
  }
  if (currentPrayer && order.indexOf(prayerName) < order.indexOf(currentPrayer)) {
    return { card: 'border-l-2 border-l-transparent', name: 'text-[#5A6577]', arabic: 'text-[#5A6577]/70', time: 'text-[#5A6577]' };
  }
  return { card: 'border-l-2 border-l-transparent', name: 'text-[#8B95A8]', arabic: 'text-[#8B95A8]/60', time: 'text-[#E8E2D6]' };
}

export default function PrayerTimesCompact({ prayerTimes, countdown, timeFormat, onDragEnd, onSettingsOpen }: PrayerTimesCompactProps) {
  const { prayers, currentPrayer, nextPrayer } = prayerTimes;
  const nextPrayerDisplay = nextPrayer ? PRAYER_NAMES[nextPrayer].english : null;
  const order = prayers.map((p) => p.name);

  return (
    <div className="h-full w-full flex flex-col p-3 gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <DragHandle orientation="horizontal" onDragEnd={onDragEnd} />
          <HideButton />
        </div>
        <div className="flex gap-1">
          <MuteButton />
          <SettingsButton onClick={onSettingsOpen} />
        </div>
      </div>

      <div className="flex flex-col gap-0.5 flex-1">
        {prayers.map((prayer) => {
          const styles = getRowClasses(prayer.name, currentPrayer, order);
          const time = isInvalidTime(prayer.time) ? '--:--' : formatPrayerTime(prayer.time, timeFormat);

          return (
            <div
              key={prayer.name}
              className={`flex items-center justify-between px-2 py-0.5 rounded-md transition-all duration-400 ease-in-out ${styles.card}`}
              aria-label={`${prayer.displayName} prayer time: ${time}`}
            >
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xs transition-colors duration-400 ${styles.name}`}>
                  {prayer.displayName}
                </span>
                <span className={`text-[11px] font-arabic transition-colors duration-400 ${styles.arabic}`}>
                  {prayer.arabicName}
                </span>
              </div>
              <span className={`text-sm font-medium tabular-nums transition-colors duration-400 ${styles.time}`}>
                {time}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2">
        <CountdownTimer nextPrayerName={nextPrayerDisplay} countdown={countdown} />
      </div>
    </div>
  );
}
