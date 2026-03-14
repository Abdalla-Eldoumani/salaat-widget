interface CountdownTimerProps {
  nextPrayerName: string | null;
  countdown: string;
}

export default function CountdownTimer({ nextPrayerName, countdown }: CountdownTimerProps) {
  if (!nextPrayerName || !countdown) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs" aria-live="polite" aria-label={`Next prayer: ${nextPrayerName} in ${countdown}`}>
      <span className="text-[#7B89A1]">Next:</span>
      <span className="inline-flex items-center px-2 py-0.5 border border-[#8B7235] rounded-sm octagon-clip">
        <span className="text-[#C8A84E] font-semibold tabular-nums">{nextPrayerName} in {countdown}</span>
      </span>
    </div>
  );
}
