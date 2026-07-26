import { Card } from './Card';

/** Base shimmer block. Compose these to mimic a component's layout while it loads. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-container rounded-md ${className}`} />;
}

/** Loading placeholder matching ArticleCard's shape (cover + title + excerpt + meta). */
export function ArticleCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col">
      <Skeleton className="h-40 rounded-none" />
      <div className="p-md flex flex-col gap-sm flex-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-auto flex items-center justify-between pt-sm">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

/** Loading placeholder for the Edukasi featured (Utama) card. */
export function FeaturedArticleSkeleton() {
  return (
    <Card className="overflow-hidden grid grid-cols-1 md:grid-cols-2">
      <Skeleton className="h-56 md:h-full rounded-none" />
      <div className="p-lg flex flex-col justify-center gap-sm">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-7 w-11/12" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-full mt-xs" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center justify-between mt-sm">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    </Card>
  );
}
