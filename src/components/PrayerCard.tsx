import { formatPrayerTime, isInvalidTime } from '../lib/prayer-calculator';

type PrayerState = 'upcoming' | 'current' | 'passed';

interface PrayerCardProps {
  displayName: string;
  time: Date;
  state: PrayerState;
  timeFormat: '12h' | '24h';
}

function getStateClasses(state: PrayerState): { card: string; name: string; time: string } {
  switch (state) {
    case 'current':
      return {
        card: 'border-l-2 border-l-[#C8A84E] bg-[rgba(200,168,78,0.08)] shadow-[inset_0_0_8px_rgba(200,168,78,0.06)]',
        name: 'text-[#C8A84E] font-medium',
        time: 'text-[#C8A84E]',
      };
    case 'passed':
      return {
        card: 'border-l-2 border-l-transparent',
        name: 'text-[#5A6577]',
        time: 'text-[#5A6577]',
      };
    case 'upcoming':
    default:
      return {
        card: 'border-l-2 border-l-transparent',
        name: 'text-[#8B95A8]',
        time: 'text-[#E8E2D6]',
      };
  }
}

export default function PrayerCard({ displayName, time, state, timeFormat }: PrayerCardProps) {
  const styles = getStateClasses(state);
  const formattedTime = isInvalidTime(time) ? '--:--' : formatPrayerTime(time, timeFormat);

  return (
    <div
      className={`flex flex-col items-center px-3 py-1.5 rounded-md transition-all duration-400 ease-in-out ${styles.card}`}
      aria-label={`${displayName} prayer time: ${formattedTime}`}
    >
      <span className={`text-xs transition-colors duration-400 ${styles.name}`}>
        {displayName}
      </span>
      <span className={`text-base font-medium tabular-nums transition-colors duration-400 ${styles.time}`}>
        {formattedTime}
      </span>
    </div>
  );
}
