import { Window } from '@tauri-apps/api/window';

interface DragHandleProps {
  orientation: 'horizontal' | 'vertical';
  onDragEnd?: () => void;
}

export default function DragHandle({ orientation, onDragEnd }: DragHandleProps) {
  const handleMouseDown = async (e: React.MouseEvent) => {
    e.preventDefault();
    const appWindow = Window.getCurrent();
    await appWindow.startDragging();
    onDragEnd?.();
  };

  const isHorizontal = orientation === 'horizontal';
  const diamonds = [0, 1, 2];

  return (
    <div
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center gap-1 cursor-grab active:cursor-grabbing p-1.5`}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-label="Drag to move widget"
    >
      {diamonds.map((i) => (
        <div
          key={i}
          className="w-[5px] h-[5px] rotate-45 bg-[#8B7235] opacity-60"
        />
      ))}
    </div>
  );
}
