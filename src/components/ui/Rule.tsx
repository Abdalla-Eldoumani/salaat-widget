import Star from './Star';

// A hairline with a star at its centre, under page titles.
export default function Rule() {
  return (
    <div aria-hidden="true" className="flex items-center gap-2 text-gold">
      <span className="h-px flex-1 bg-rule" />
      <Star className="size-2.5" />
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}
