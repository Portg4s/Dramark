export function PosterSkeleton() {
  return (
    <div className="poster-card overflow-hidden rounded-md border border-white/10 bg-white/10 shadow-poster">
      <div className="aspect-[2/3] animate-pulse bg-gradient-to-br from-white/15 via-white/10 to-transparent" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-4/5 rounded-full bg-white/15" />
        <div className="h-3 w-2/5 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
