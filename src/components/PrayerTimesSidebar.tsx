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

function getTextClass(prayerName: PrayerName, currentPrayer: PrayerName | null, order: PrayerName[]): string {
  if (prayerName === currentPrayer) return 'text-[#C8A84E]';
  if (currentPrayer && order.indexOf(prayerName) < order.indexOf(currentPrayer)) return 'text-[#4A5568]';
  return 'text-[#E8E2D6]';
}

export default function PrayerTimesSidebar({ prayerTimes, countdown, timeFormat, onDragEnd, onSettingsOpen }: PrayerTimesSidebarProps) {
  const { prayers, currentPrayer, nextPrayer } = prayerTimes;
  const nextPrayerDisplay = nextPrayer ? PRAYER_NAMES[nextPrayer].english : null;
  const order = prayers.map((p) => p.name);

  return (
    <div className="h-full w-full flex flex-col items-center py-2 gap-1">
      <DragHandle orientation="horizontal" onDragEnd={onDragEnd} />

      <div className="flex flex-col items-center gap-0 flex-1 w-full px-2">
        {prayers.map((prayer, i) => {
          const textClass = getTextClass(prayer.name, currentPrayer, order);
          const time = isInvalidTime(prayer.time) ? '--:--' : formatPrayerTime(prayer.time, timeFormat);
          const isActive = prayer.name === currentPrayer;

          return (
            <div key={prayer.name} className="w-full">
              {i > 0 && <ArabesqueDivider orientation="horizontal" />}
              <div
                className={`flex flex-col items-center px-2 py-1 rounded-md transition-colors duration-400 ${isActive ? 'bg-[rgba(200,168,78,0.12)]' : ''}`}
                aria-label={`${prayer.displayName} prayer time: ${time}`}
              >
                <span className={`text-[10px] ${isActive ? 'text-[#C8A84E]' : 'text-[#7B89A1]'}`}>
                  {prayer.displayName}
                </span>
                <span className={`text-sm font-medium tabular-nums ${textClass}`}>
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
