interface ArabesqueDividerProps {
  orientation: 'horizontal' | 'vertical';
}

export default function ArabesqueDivider({ orientation }: ArabesqueDividerProps) {
  if (orientation === 'horizontal') {
    return (
      <div className="flex items-center gap-0" aria-hidden="true">
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.05)]" />
        <div className="w-[4px] h-[4px] rotate-45 bg-[rgba(200,168,78,0.15)]" />
        <div className="flex-1 h-px bg-[rgba(255,255,255,0.05)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0" aria-hidden="true">
      <div className="flex-1 w-px bg-[rgba(255,255,255,0.05)]" />
      <div className="w-[4px] h-[4px] rotate-45 bg-[rgba(200,168,78,0.15)]" />
      <div className="flex-1 w-px bg-[rgba(255,255,255,0.05)]" />
    </div>
  );
}
