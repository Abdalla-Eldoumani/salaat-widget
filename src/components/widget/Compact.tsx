import type { WidgetViewProps } from '../../types';
import { PRAYER_NAMES } from '../../lib/constants';
import { prayerStatus } from '../../lib/prayer-display';
import HideButton from './HideButton';
import MuteButton from './MuteButton';
import NextPrayer from './NextPrayer';
import PrayerRow from './PrayerRow';
import SettingsButton from './SettingsButton';

// Floating layout, 240 x 280.
export default function Compact({ prayerTimes, showCountdown, timeFormat, onSettingsOpen }: WidgetViewProps) {
  const { prayers, currentPrayer, nextPrayer } = prayerTimes;

  return (
    <div className="flex h-full flex-col px-2 py-1">
      <ol className="flex min-h-0 flex-1 flex-col divide-y divide-rule-faint pt-1">
        {prayers.map((prayer) => (
          <PrayerRow
            key={prayer.name}
            prayer={prayer}
            status={prayerStatus(prayers, prayer.name, currentPrayer)}
            timeFormat={timeFormat}
            names="inline"
          />
        ))}
      </ol>
      <div className="flex items-center">
        <HideButton />
        <div className="min-w-0 flex-1">
          <NextPrayer
            name={nextPrayer ? PRAYER_NAMES[nextPrayer].english : null}
            target={prayerTimes.nextPrayerTime}
            showCountdown={showCountdown}
            className="text-center"
          />
        </div>
        <MuteButton />
        <SettingsButton onClick={onSettingsOpen} />
      </div>
    </div>
  );
}
