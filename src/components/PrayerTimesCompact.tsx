import type { PrayerTimeResult, PrayerName } from '../types';
import { PRAYER_NAMES } from '../lib/constants';
import { formatPrayerTime, isInvalidTime } from '../lib/prayer-calculator';
import CountdownTimer from './CountdownTimer';
import DragHandle from './DragHandle';
import MuteButton from './MuteButton';
import SettingsButton from './SettingsButton';

interface PrayerTimesCompactProps {
  prayerTimes: PrayerTimeResult;
  countdown: string;
  timeFormat: '12h' | '24h';
  onDragEnd: () => void;
  onSettingsOpen: () => void;
}

function getRowClasses(prayerName: PrayerName, currentPrayer: PrayerName | null, order: PrayerName[]): {
  bg: string;
  name: string;
  time: string;
  indicator: boolean;
} {
  if (prayerName === currentPrayer) {
    return { bg: 'bg-[rgba(200,168,78,0.12)]', name: 'text-[#C8A84E]', time: 'text-[#C8A84E]', indicator: true };
  }
  if (currentPrayer && order.indexOf(prayerName) < order.indexOf(currentPrayer)) {
    return { bg: '', name: 'text-[#4A5568]', time: 'text-[#4A5568]', indicator: false };
  }
  return { bg: '', name: 'text-[#7B89A1]', time: 'text-[#E8E2D6]', indicator: false };
}

export default function PrayerTimesCompact({ prayerTimes, countdown, timeFormat, onDragEnd, onSettingsOpen }: PrayerTimesCompactProps) {
  const { prayers, currentPrayer, nextPrayer } = prayerTimes;
  const nextPrayerDisplay = nextPrayer ? PRAYER_NAMES[nextPrayer].english : null;
  const order = prayers.map((p) => p.name);

  return (
    <div className="h-full w-full flex flex-col p-3 gap-2">
      <div className="flex items-center justify-between">
        <DragHandle orientation="horizontal" onDragEnd={onDragEnd} />
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
              className={`flex items-center justify-between px-2 py-1 rounded-md transition-all duration-400 ease-in-out ${styles.bg}`}
              aria-label={`${prayer.displayName} prayer time: ${time}`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`w-3 text-xs ${styles.indicator ? 'text-[#C8A84E]' : 'text-transparent'}`} aria-hidden="true">
                  {styles.indicator ? '\u25B6' : ''}
                </span>
                <span className={`text-xs transition-colors duration-400 ${styles.name}`}>
                  {prayer.displayName}
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
