import { isInvalidTime } from '../../lib/prayer-calculator';
import { formatClock } from '../../lib/prayer-display';

// A time with a small AM or PM. Where the sun gives no answer for the day, dashes are shown and
// screen readers are told why.
export default function ClockText({ date, format }: { date: Date; format: '12h' | '24h' }) {
  const { clock, period } = formatClock(date, format);

  if (isInvalidTime(date)) {
    return (
      <>
        <span aria-hidden="true">{clock}</span>
        <span className="sr-only">not available today</span>
      </>
    );
  }

  return (
    <>
      <time dateTime={date.toISOString()}>{clock}</time>
      {period && <span className="ms-0.5 text-[10px] font-normal">{period}</span>}
    </>
  );
}
