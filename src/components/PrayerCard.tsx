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
        card: 'bg-[rgba(200,168,78,0.12)]',
        name: 'text-[#C8A84E]',
        time: 'text-[#C8A84E]',
      };
    case 'passed':
      return {
        card: '',
        name: 'text-[#4A5568]',
        time: 'text-[#4A5568]',
      };
    case 'upcoming':
    default:
      return {
        card: 'bg-[rgba(20,30,52,0.60)]',
        name: 'text-[#7B89A1]',
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
      <span className={`text-xs font-normal transition-colors duration-400 ${styles.name}`}>
        {displayName}
      </span>
      <span className={`text-base font-medium tabular-nums transition-colors duration-400 ${styles.time}`}>
        {formattedTime}
      </span>
    </div>
  );
}
