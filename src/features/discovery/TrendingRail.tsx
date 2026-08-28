import { AnimatePresence, LayoutGroup, motion } from 'motion/react';

import { MediaCard } from '@/features/catalog/MediaCard';
import type { CatalogMedia } from '@/features/catalog/types';
import { DiscoveryFilterStrip } from '@/features/discovery/DiscoveryFilterStrip';
import { DiscoverySortControl } from '@/features/discovery/DiscoverySortControl';
import type { DiscoveryFilterKey, DiscoverySortKey } from '@/services/tmdb/discovery';
import type { LibraryEntryRecord } from '@/types/media';
import { createMediaKey } from '@/utils/mediaKey';
import { listSpring } from '@/utils/motion';

type TrendingRailProps = {
  title: string;
  entries: CatalogMedia[];
  libraryEntries: Map<string, LibraryEntryRecord>;
  selectedFilter: DiscoveryFilterKey;
  onFilterChange: (filter: DiscoveryFilterKey) => void;
  selectedSort: DiscoverySortKey;
  onSortChange: (sort: DiscoverySortKey) => void;
  isLoading?: boolean;
};

export function TrendingRail({
  title,
  entries,
  libraryEntries,
  selectedFilter,
  onFilterChange,
  selectedSort,
  onSortChange,
  isLoading = false
}: TrendingRailProps) {
  if (!isLoading && entries.length === 0 && selectedFilter === 'all') {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <DiscoveryFilterStrip selectedFilter={selectedFilter} onFilterChange={onFilterChange} />
      <DiscoverySortControl selectedSort={selectedSort} onSortChange={onSortChange} />

      <LayoutGroup id={`trending-${title}`}>
        {isLoading ? (
          <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
            {[0, 1, 2].map((item) => (
              <div key={item} className="w-32 shrink-0 space-y-2">
                <div className="aspect-[2/3] animate-pulse rounded-[1.05rem] bg-surface/64" />
                <div className="h-4 w-24 animate-pulse rounded-full bg-surface/64" />
                <div className="h-3 w-16 animate-pulse rounded-full bg-surface/64" />
              </div>
            ))}
          </div>
        ) : entries.length > 0 ? (
          <motion.div
            layout
            className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6"
            transition={listSpring}
          >
            <AnimatePresence initial={false}>
              {entries.slice(0, 10).map((media) => (
                <MediaCard
                  key={`${media.mediaType}:${media.tmdbId}`}
                  media={media}
                  entry={libraryEntries.get(createMediaKey(media))}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <p className="rounded-[1.2rem] bg-surface/64 px-4 py-5 text-sm leading-6 text-muted">
            Aucun titre trouvé pour ce filtre pour l'instant.
          </p>
        )}
      </LayoutGroup>
    </section>
  );
}
