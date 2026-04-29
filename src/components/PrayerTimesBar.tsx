import type { PrayerTimeResult } from '../types';
import { PRAYER_NAMES } from '../lib/constants';
import PrayerCard from './PrayerCard';
import CountdownTimer from './CountdownTimer';
import DragHandle from './DragHandle';
import ArabesqueDivider from './ArabesqueDivider';
import MuteButton from './MuteButton';
import SettingsButton from './SettingsButton';

interface PrayerTimesBarProps {
  prayerTimes: PrayerTimeResult;
  countdown: string;
  timeFormat: '12h' | '24h';
  onDragEnd: () => void;
  onSettingsOpen: () => void;
}

export default function PrayerTimesBar({ prayerTimes, countdown, timeFormat, onDragEnd, onSettingsOpen }: PrayerTimesBarProps) {
  const { prayers, currentPrayer, nextPrayer } = prayerTimes;
  const nextPrayerDisplay = nextPrayer ? PRAYER_NAMES[nextPrayer].english : null;

  return (
    <div className="h-full w-full flex items-center px-2 gap-1">
      <DragHandle orientation="vertical" onDragEnd={onDragEnd} />

      <div className="flex items-center gap-0 flex-1">
        {prayers.map((prayer, i) => {
          let state: 'upcoming' | 'current' | 'passed' = 'upcoming';
          if (prayer.name === currentPrayer) {
            state = 'current';
          } else if (currentPrayer && isPassed(prayer.name, currentPrayer, prayers.map((p) => p.name))) {
            state = 'passed';
          }

          return (
            <div key={prayer.name} className="flex items-center">
              {i > 0 && <ArabesqueDivider orientation="vertical" />}
              <PrayerCard
                displayName={prayer.displayName}
                arabicName={prayer.arabicName}
                time={prayer.time}
                state={state}
                timeFormat={timeFormat}
              />
            </div>
          );
        })}
      </div>

      <CountdownTimer nextPrayerName={nextPrayerDisplay} countdown={countdown} />

      <div className="flex items-center gap-1">
        <MuteButton />
        <SettingsButton onClick={onSettingsOpen} />
      </div>
    </div>
  );
}

function isPassed(prayer: string, current: string, order: string[]): boolean {
  const prayerIdx = order.indexOf(prayer);
  const currentIdx = order.indexOf(current);
  return prayerIdx < currentIdx;
}
