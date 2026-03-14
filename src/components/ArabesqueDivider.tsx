interface ArabesqueDividerProps {
  orientation: 'horizontal' | 'vertical';
}

export default function ArabesqueDivider({ orientation }: ArabesqueDividerProps) {
  if (orientation === 'horizontal') {
    return (
      <div className="w-full h-px bg-[rgba(200,168,78,0.08)]" aria-hidden="true" />
    );
  }

  return (
    <div className="h-full w-px bg-[rgba(200,168,78,0.08)]" aria-hidden="true" />
  );
}
