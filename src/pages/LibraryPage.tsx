import { ChevronDown, Film, Search, Tv } from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useMemo, useState } from 'react';

import { ActionMenu } from '@/components/ui/ActionMenu';
import {
  mapLibraryEntryToCatalogMedia,
  useLibraryCounts,
  useLibraryEntries,
  useLibraryMediaActions
} from '@/features/library/hooks';
import { LibraryMediaItem } from '@/features/library/LibraryMediaItem';
import { filterLibraryEntries, type LibraryMediaTypeFilter } from '@/features/library/filtering';
import { sortLibraryEntries, type LibrarySort } from '@/features/library/sorting';
import type { LibraryStatus } from '@/types/media';
import { listSpring, motionEase, quickFade, softSpring } from '@/utils/motion';

const tabs = [
  { status: 'watchlist', label: 'À regarder' },
  { status: 'watched', label: 'Vu' }
] as const;

const sortOptions = [
  { value: 'recent', label: 'Ajout récent' },
  { value: 'title', label: 'Titre A-Z' },
  { value: 'year', label: 'Année' },
  { value: 'rating', label: 'Note TMDB' }
] as const;

const mediaTypeFilters: Array<{
  value: LibraryMediaTypeFilter;
  label: string;
  icon?: typeof Film;
}> = [
  { value: 'all', label: 'Tout' },
  { value: 'movie', label: 'Films', icon: Film },
  { value: 'tv', label: 'Series', icon: Tv }
];

function getEmptyMessage(status: LibraryStatus): string {
  return status === 'watchlist'
    ? 'Ajoutez votre prochain drama depuis la recherche.'
    : 'Les films et séries que vous terminez apparaîtront ici.';
}

function AnimatedCount({ value, className = '' }: { value: number; className?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        className={`inline-block tabular-nums ${className}`}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
        transition={quickFade}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export function LibraryPage() {
  const [activeStatus, setActiveStatus] = useState<LibraryStatus>('watchlist');
  const [sort, setSort] = useState<LibrarySort>('recent');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<LibraryMediaTypeFilter>('all');
  const [libraryQuery, setLibraryQuery] = useState('');
  const reducedMotion = useReducedMotion();
  const entries = useLibraryEntries(activeStatus);
  const counts = useLibraryCounts();
  const libraryActions = useLibraryMediaActions();

  const sortedEntries = useMemo(() => {
    const filteredEntries = filterLibraryEntries(entries.data ?? [], {
      mediaType: mediaTypeFilter,
      query: libraryQuery
    });

    return sortLibraryEntries(filteredEntries, sort);
  }, [entries.data, libraryQuery, mediaTypeFilter, sort]);
  const direction = activeStatus === 'watched' ? 1 : -1;
  const selectedSort = sortOptions.find((option) => option.value === sort) ?? sortOptions[0];
  const hasActiveFilters = mediaTypeFilter !== 'all' || libraryQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      <header className="space-y-4 pt-2">
        <div>
          <p className="text-sm font-semibold text-brand-soft">Collection</p>
          <h1 className="mt-1 text-3xl font-black text-white">Ma liste</h1>
        </div>
        <p className="text-sm font-medium text-muted">
          <AnimatedCount value={counts.watchlist} /> à regarder{' '}
          <span className="px-2 text-subtle">·</span> <AnimatedCount value={counts.watched} /> vus
        </p>
      </header>

      <LayoutGroup id="library-tabs">
        <div className="relative grid grid-cols-2 rounded-full bg-surface/72 p-1">
          {tabs.map(({ status, label }) => {
            const count = status === 'watchlist' ? counts.watchlist : counts.watched;
            const isActive = activeStatus === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setActiveStatus(status)}
                className={[
                  'focus-ring relative z-10 flex min-h-12 items-center justify-center gap-2 rounded-full px-3 text-sm font-bold transition-colors duration-200',
                  isActive ? 'text-white' : 'text-muted hover:text-white'
                ].join(' ')}
                aria-pressed={isActive}
              >
                {isActive ? (
                  <motion.span
                    layoutId="library-active-tab"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-brand shadow-[0_10px_24px_rgba(89,183,255,0.24)]"
                    transition={reducedMotion ? { duration: 0.01 } : softSpring}
                  />
                ) : null}
                <span className="relative z-10">{label}</span>
                <AnimatedCount
                  value={count}
                  className={isActive ? 'relative z-10 text-white/82' : 'relative z-10 text-subtle'}
                />
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <div className="space-y-3">
        <label className="group flex min-h-12 items-center gap-3 rounded-full bg-surface/72 px-4 text-sm text-white transition focus-within:bg-surface-2/64 focus-within:shadow-[0_0_0_2px_rgba(89,183,255,0.42)]">
          <Search aria-hidden="true" className="size-4 shrink-0 text-brand-soft" />
          <input
            value={libraryQuery}
            onChange={(event) => setLibraryQuery(event.target.value)}
            placeholder="Rechercher dans ma liste"
            className="min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-subtle outline-none"
            aria-label="Rechercher dans ma liste"
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-full bg-surface/72 p-1">
            {mediaTypeFilters.map(({ value, label, icon: Icon }) => {
              const isActive = mediaTypeFilter === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMediaTypeFilter(value)}
                  className={[
                    'focus-ring flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition-colors',
                    isActive ? 'bg-brand text-white' : 'text-muted hover:text-white'
                  ].join(' ')}
                  aria-pressed={isActive}
                >
                  {Icon ? <Icon aria-hidden="true" className="size-4" /> : null}
                  {label}
                </button>
              );
            })}
          </div>
          <ActionMenu
            label="Trier la liste"
            align="left"
            side="bottom"
            items={sortOptions.map((option) => ({
              label: option.label,
              selected: option.value === sort,
              onSelect: () => setSort(option.value)
            }))}
            trigger={({ ref, isOpen, toggle }) => (
              <motion.button
                ref={ref}
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                whileTap={reducedMotion ? undefined : { scale: 0.975 }}
                className="pressable focus-ring inline-flex min-h-11 items-center gap-2 rounded-full bg-surface/72 px-4 text-sm font-semibold text-white hover:bg-surface-2/70"
              >
                {selectedSort.label}
                <ChevronDown
                  aria-hidden="true"
                  className={['size-4 text-subtle transition', isOpen ? 'rotate-180' : ''].join(
                    ' '
                  )}
                />
              </motion.button>
            )}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={activeStatus}
          custom={direction}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? 24 : -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? -24 : 24 }}
          transition={{ duration: reducedMotion ? 0.12 : 0.28, ease: motionEase }}
        >
          {entries.isLoading ? (
            <div
              role="status"
              className="rounded-[1.35rem] bg-surface/64 px-5 py-6 text-sm text-muted"
            >
              Chargement de votre liste...
            </div>
          ) : null}

          {entries.error ? (
            <div className="rounded-[1.35rem] bg-danger/12 px-5 py-4 text-sm text-red-100">
              Impossible de lire la bibliothèque locale pour le moment.
            </div>
          ) : null}

          {!entries.isLoading && !entries.error && sortedEntries.length === 0 ? (
            <div className="rounded-[1.35rem] bg-surface/64 px-5 py-8 text-center">
              <p className="text-sm font-medium text-muted">
                {hasActiveFilters
                  ? 'Aucun titre ne correspond a ces filtres.'
                  : getEmptyMessage(activeStatus)}
              </p>
            </div>
          ) : null}

          {sortedEntries.length > 0 ? (
            <LayoutGroup id={`library-list-${activeStatus}`}>
              <motion.div layout className="space-y-3" transition={listSpring}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {sortedEntries.map((entry) => {
                    const media = mapLibraryEntryToCatalogMedia(entry);

                    return (
                      <LibraryMediaItem
                        key={entry.id}
                        media={media}
                        entry={entry}
                        mode="library"
                        isBusy={libraryActions.isMutating}
                        onSetStatus={libraryActions.setStatusForMedia}
                        onRemove={libraryActions.removeMedia}
                      />
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
