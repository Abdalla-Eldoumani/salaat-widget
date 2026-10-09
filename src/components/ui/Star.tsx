// Eight-point khatam: a square and the same square turned 45 degrees. The only ornament in the
// app, used for section marks, the current prayer and step markers.
export default function Star({ className = '', outline = false }: { className?: string; outline?: boolean }) {
  const paint = outline ? { fill: 'none', stroke: 'currentColor', strokeWidth: 1.25 } : { fill: 'currentColor' };

  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className} {...paint}>
      <rect x="2.5" y="2.5" width="11" height="11" />
      <rect x="2.5" y="2.5" width="11" height="11" transform="rotate(45 8 8)" />
    </svg>
  );
}
