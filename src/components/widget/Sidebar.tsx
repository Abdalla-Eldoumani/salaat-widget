import type { WidgetViewProps } from '../../types';
import { PRAYER_NAMES } from '../../lib/constants';
import { prayerStatus } from '../../lib/prayer-display';
import HideButton from './HideButton';
import MuteButton from './MuteButton';
import NextPrayer from './NextPrayer';
import PrayerRow from './PrayerRow';
import SettingsButton from './SettingsButton';

// Vertical layout, 200 x 420.
export default function Sidebar({ prayerTimes, showCountdown, timeFormat, onSettingsOpen }: WidgetViewProps) {
  const { prayers, currentPrayer, nextPrayer } = prayerTimes;

  return (
    <div className="flex h-full flex-col px-2 py-1">
      <div className="flex items-center justify-between">
        <HideButton />
        <div className="flex">
          <MuteButton />
          <SettingsButton onClick={onSettingsOpen} />
        </div>
      </div>
      <ol className="flex min-h-0 flex-1 flex-col divide-y divide-rule-faint py-1">
        {prayers.map((prayer) => (
          <PrayerRow
            key={prayer.name}
            prayer={prayer}
            status={prayerStatus(prayers, prayer.name, currentPrayer)}
            timeFormat={timeFormat}
            names="stacked"
          />
        ))}
      </ol>
      <NextPrayer
        name={nextPrayer ? PRAYER_NAMES[nextPrayer].english : null}
        target={prayerTimes.nextPrayerTime}
        showCountdown={showCountdown}
        className="pb-2 text-center"
      />
    </div>
  );
}
