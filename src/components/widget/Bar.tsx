import type { WidgetViewProps } from '../../types';
import { PRAYER_NAMES } from '../../lib/constants';
import { prayerStatus } from '../../lib/prayer-display';
import HideButton from './HideButton';
import MuteButton from './MuteButton';
import NextPrayer from './NextPrayer';
import PrayerCell from './PrayerCell';
import SettingsButton from './SettingsButton';

// Horizontal layout, 640 x 60.
export default function Bar({ prayerTimes, showCountdown, timeFormat, onSettingsOpen }: WidgetViewProps) {
  const { prayers, currentPrayer, nextPrayer } = prayerTimes;

  return (
    <div className="flex h-full items-center gap-1 px-2">
      <HideButton />
      <ol className="flex h-full min-w-0 flex-1 items-stretch py-1">
        {prayers.map((prayer) => (
          <PrayerCell
            key={prayer.name}
            prayer={prayer}
            status={prayerStatus(prayers, prayer.name, currentPrayer)}
            timeFormat={timeFormat}
          />
        ))}
      </ol>
      <NextPrayer
        name={nextPrayer ? PRAYER_NAMES[nextPrayer].english : null}
        target={prayerTimes.nextPrayerTime}
        showCountdown={showCountdown}
        className="w-24 shrink-0 ps-1"
      />
      <MuteButton />
      <SettingsButton onClick={onSettingsOpen} />
    </div>
  );
}
