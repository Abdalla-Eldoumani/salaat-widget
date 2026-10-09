import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import Button from '../ui/Button';
import Rule from '../ui/Rule';
import Star from '../ui/Star';

interface StepFrameProps {
  step: number;
  total: number;
  title: string;
  intro: string;
  children: ReactNode;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
}

export default function StepFrame({
  step,
  total,
  title,
  intro,
  children,
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
}: StepFrameProps) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Each step is a new screen to a screen reader, so it starts at the title.
  useEffect(() => titleRef.current?.focus(), []);

  return (
    <main aria-labelledby={titleId} className="flex h-full flex-col px-8 pb-5 pt-7">
      <header className="space-y-2">
        <p className="text-xs text-faint">Step {step} of {total}</p>
        <h1 id={titleId} ref={titleRef} tabIndex={-1} className="font-display text-2xl font-bold text-ink outline-none">
          {title}
        </h1>
        <Rule />
        <p className="text-sm text-muted">{intro}</p>
      </header>

      <div className="scroll-quiet min-h-0 flex-1 space-y-4 overflow-y-auto py-4">{children}</div>

      <footer className="flex items-center justify-between gap-2">
        <div className="w-24">
          {onBack && <Button variant="quiet" onClick={onBack}>Back</Button>}
        </div>
        <div aria-hidden="true" className="flex gap-2 text-gold">
          {Array.from({ length: total }, (_, i) => (
            <Star key={i} outline={i + 1 !== step} className="size-3" />
          ))}
        </div>
        <div className="flex w-24 justify-end">
          <Button onClick={onContinue} disabled={continueDisabled}>{continueLabel}</Button>
        </div>
      </footer>
    </main>
  );
}
