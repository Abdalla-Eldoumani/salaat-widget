import { Window } from '@tauri-apps/api/window';

interface DragHandleProps {
  orientation: 'horizontal' | 'vertical';
  onDragEnd?: () => void;
}

export default function DragHandle({ orientation, onDragEnd }: DragHandleProps) {
  const handleMouseDown = async (e: React.MouseEvent) => {
    e.preventDefault();
    // On Windows, startDragging() resolves at drag-start, so awaiting it and then
    // calling onDragEnd snaps against the starting position. Wait for real mouseup
    // before firing the snap check.
    const onUp = () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('pointerup', onUp);
      onDragEnd?.();
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('pointerup', onUp);
    const appWindow = Window.getCurrent();
    await appWindow.startDragging();
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
