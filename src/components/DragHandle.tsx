import { Window } from '@tauri-apps/api/window';

interface DragHandleProps {
  orientation: 'horizontal' | 'vertical';
  onDragEnd?: () => void;
}

export default function DragHandle({ orientation, onDragEnd }: DragHandleProps) {
  // Snap detection is wired via the window's `onMoved` listener in useWindowDock,
  // which fires reliably during native drag on every platform. We just kick off
  // the OS drag here.
  const handleMouseDown = async (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    await Window.getCurrent().startDragging();
    onDragEnd?.();
  };

  const isHorizontal = orientation === 'horizontal';

  // The horizontal orientation is for tall widgets (sidebar, compact) - we want
  // a stack of horizontal lines (visual cue: drag-bar at the top edge).
  // The vertical orientation is for wide widgets (bar) - we want a column of
  // vertical lines down the left side.
  return (
    <div
      className={`flex ${isHorizontal ? 'flex-col' : 'flex-row'} gap-[3px] items-center cursor-grab active:cursor-grabbing px-2 py-1.5 rounded transition-colors hover:bg-[rgba(200,168,78,0.10)]`}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-label="Drag to move widget"
      title="Drag to move"
    >
      <div className={`${isHorizontal ? 'w-5 h-px' : 'w-px h-5'} bg-[#C8A84E] opacity-60 rounded-full`} />
      <div className={`${isHorizontal ? 'w-5 h-px' : 'w-px h-5'} bg-[#C8A84E] opacity-60 rounded-full`} />
      <div className={`${isHorizontal ? 'w-5 h-px' : 'w-px h-5'} bg-[#C8A84E] opacity-60 rounded-full`} />
    </div>
  );
}
