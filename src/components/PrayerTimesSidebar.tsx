import type { PrayerTimeResult, PrayerName } from '../types';
import { PRAYER_NAMES } from '../lib/constants';
import { formatPrayerTime, isInvalidTime } from '../lib/prayer-calculator';
import CountdownTimer from './CountdownTimer';
import DragHandle from './DragHandle';
import ArabesqueDivider from './ArabesqueDivider';
import MuteButton from './MuteButton';
import SettingsButton from './SettingsButton';

interface PrayerTimesSidebarProps {
  prayerTimes: PrayerTimeResult;
  countdown: string;
  timeFormat: '12h' | '24h';
  onDragEnd: () => void;
  onSettingsOpen: () => void;
}

function getState(prayerName: PrayerName, currentPrayer: PrayerName | null, order: PrayerName[]): 'current' | 'passed' | 'upcoming' {
  if (prayerName === currentPrayer) return 'current';
  if (currentPrayer && order.indexOf(prayerName) < order.indexOf(currentPrayer)) return 'passed';
  return 'upcoming';
}

function getTextClass(state: 'current' | 'passed' | 'upcoming'): { name: string; time: string } {
  switch (state) {
    case 'current': return { name: 'text-[#C8A84E] font-medium', time: 'text-[#C8A84E]' };
    case 'passed': return { name: 'text-[#5A6577]', time: 'text-[#5A6577]' };
    default: return { name: 'text-[#8B95A8]', time: 'text-[#E8E2D6]' };
  }
}

export default function PrayerTimesSidebar({ prayerTimes, countdown, timeFormat, onDragEnd, onSettingsOpen }: PrayerTimesSidebarProps) {
  const { prayers, currentPrayer, nextPrayer } = prayerTimes;
  const nextPrayerDisplay = nextPrayer ? PRAYER_NAMES[nextPrayer].english : null;
  const order = prayers.map((p) => p.name);

  return (
    <div className="h-full w-full flex flex-col items-center py-2 gap-1">
      <DragHandle orientation="horizontal" onDragEnd={onDragEnd} />

      <div className="flex flex-col gap-0 flex-1 w-full px-3">
        {prayers.map((prayer, i) => {
          const state = getState(prayer.name, currentPrayer, order);
          const styles = getTextClass(state);
          const time = isInvalidTime(prayer.time) ? '--:--' : formatPrayerTime(prayer.time, timeFormat);
          const isActive = state === 'current';

          return (
            <div key={prayer.name} className="w-full">
              {i > 0 && <ArabesqueDivider orientation="horizontal" />}
              <div
                className={`flex items-center justify-between px-2 py-1.5 rounded-md transition-colors duration-400
                  ${isActive ? 'border-l-2 border-l-[#C8A84E] bg-[rgba(200,168,78,0.08)]' : 'border-l-2 border-l-transparent'}`}
                aria-label={`${prayer.displayName} prayer time: ${time}`}
              >
                <span className={`text-xs transition-colors duration-400 ${styles.name}`}>
                  {prayer.displayName}
                </span>
                <span className={`text-sm font-medium tabular-nums transition-colors duration-400 ${styles.time}`}>
                  {time}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <CountdownTimer nextPrayerName={nextPrayerDisplay} countdown={countdown} />
      <div className="flex gap-1">
        <MuteButton />
        <SettingsButton onClick={onSettingsOpen} />
      </div>
    </div>
  );
}
