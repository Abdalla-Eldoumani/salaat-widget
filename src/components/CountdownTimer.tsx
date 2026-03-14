interface CountdownTimerProps {
  nextPrayerName: string | null;
  countdown: string;
}

export default function CountdownTimer({ nextPrayerName, countdown }: CountdownTimerProps) {
  if (!nextPrayerName || !countdown) return null;

  return (
    <div className="flex items-center gap-1 text-xs" aria-live="polite" aria-label={`Next prayer: ${nextPrayerName} in ${countdown}`}>
      <span className="text-[#5A6577]">Next</span>
      <span className="text-[#5A6577]">&middot;</span>
      <span className="text-[#C8A84E] font-medium">{nextPrayerName}</span>
      <span className="text-[#5A6577]">in</span>
      <span className="text-[#E8E2D6] font-medium tabular-nums">{countdown}</span>
    </div>
  );
}
