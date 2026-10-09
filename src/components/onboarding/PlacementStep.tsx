import type { DockEdge } from '../../types';
import Choice from '../ui/Choice';

interface PlacementStepProps {
  dockEdge: DockEdge;
  setDockEdge: (edge: DockEdge) => void;
}

const DESCRIPTION: Record<DockEdge, string> = {
  top: 'A bar along the top of the screen.',
  bottom: 'A bar along the bottom of the screen.',
  left: 'A tall panel down the left side.',
  right: 'A tall panel down the right side.',
  floating: 'A small window you can place anywhere.',
};

// Edges sit around a screen-shaped middle, so each choice is where the widget will be.
const CHOICES: { edge: DockEdge; label: string; position: string }[] = [
  { edge: 'top', label: 'Top', position: 'col-start-2 row-start-1' },
  { edge: 'left', label: 'Left', position: 'col-start-1 row-start-2' },
  { edge: 'floating', label: 'Floating', position: 'col-start-2 row-start-2' },
  { edge: 'right', label: 'Right', position: 'col-start-3 row-start-2' },
  { edge: 'bottom', label: 'Bottom', position: 'col-start-2 row-start-3' },
];

export default function PlacementStep({ dockEdge, setDockEdge }: PlacementStepProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Widget placement</legend>
      <div className="mx-auto grid w-72 grid-cols-[3.5rem_1fr_3.5rem] grid-rows-[2.75rem_5.5rem_2.75rem] gap-2">
        {CHOICES.map(({ edge, label, position }) => (
          <Choice
            key={edge}
            name="dock-edge"
            value={edge}
            checked={dockEdge === edge}
            onSelect={() => setDockEdge(edge)}
            className={position}
          >
            {label}
          </Choice>
        ))}
      </div>
      <p className="text-center text-xs text-muted" aria-live="polite">{DESCRIPTION[dockEdge]}</p>
    </fieldset>
  );
}
