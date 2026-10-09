import type { MouseEventHandler, ReactNode } from 'react';

interface PageProps {
  children: ReactNode;
  // Draws attention to the frame for a few seconds when a prayer time arrives.
  arriving?: boolean;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
}

// The framed ground every screen sits on: the surface colour and a double gold rule.
export default function Page({ children, arriving = false, onMouseDown }: PageProps) {
  return (
    <div className={`page h-full w-full${arriving ? ' is-arriving' : ''}`} onMouseDown={onMouseDown}>
      {children}
    </div>
  );
}
