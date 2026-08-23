import type { ReactNode } from 'react';

import { MediaCard } from '@/features/catalog/MediaCard';
import type { CatalogMedia } from '@/features/catalog/types';
import { PosterSkeleton } from '@/components/ui/PosterSkeleton';
import { SectionTitle } from '@/components/ui/SectionTitle';

type CatalogRailProps = {
  title: string;
  action?: string;
  media: CatalogMedia[];
  isLoading?: boolean;
  errorMessage?: string;
  emptyMessage: string;
  children?: ReactNode;
};

export function CatalogRail({
  title,
  action,
  media,
  isLoading = false,
  errorMessage,
  emptyMessage,
  children
}: CatalogRailProps) {
  return (
    <section aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-title`}>
      <SectionTitle title={title} action={action} />
      {children}

      {errorMessage ? (
        <div className="rounded-lg border border-red-300/20 bg-red-300/10 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </div>
      ) : null}

      {!errorMessage && isLoading ? (
        <div
          aria-hidden="true"
          className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-36 shrink-0 sm:w-40 lg:w-auto">
              <PosterSkeleton />
            </div>
          ))}
        </div>
      ) : null}

      {!errorMessage && !isLoading && media.length > 0 ? (
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0 xl:grid-cols-8">
          {media.map((item) => (
            <MediaCard key={`${item.mediaType}:${item.tmdbId}`} media={item} />
          ))}
        </div>
      ) : null}

      {!errorMessage && !isLoading && media.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/6 px-4 py-5 text-sm text-muted">
          {emptyMessage}
        </div>
      ) : null}
    </section>
  );
}
