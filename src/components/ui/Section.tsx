import { useId } from 'react';
import type { ReactNode } from 'react';
import Star from './Star';

// A heading with a star, and its content hung from a thin rule in the margin, like a
// manuscript gloss.
export default function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();

  return (
    <section aria-labelledby={id} className="space-y-2">
      <h2 id={id} className="flex items-center gap-2 font-display text-lg font-bold text-gold">
        <Star className="size-3" />
        {title}
      </h2>
      <div className="space-y-3 border-s border-rule ps-4">{children}</div>
    </section>
  );
}
