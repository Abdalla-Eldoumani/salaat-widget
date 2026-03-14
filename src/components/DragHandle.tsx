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

  return (
    <div
      className={`flex ${isHorizontal ? 'flex-row gap-1.5' : 'flex-col gap-1.5'} items-center cursor-grab active:cursor-grabbing p-1.5`}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-label="Drag to move widget"
    >
      <div className={`${isHorizontal ? 'w-[4px] h-px' : 'w-px h-[4px]'} bg-[#7B89A1] opacity-40 rounded-full`} />
      <div className={`${isHorizontal ? 'w-[4px] h-px' : 'w-px h-[4px]'} bg-[#7B89A1] opacity-40 rounded-full`} />
    </div>
  );
}
