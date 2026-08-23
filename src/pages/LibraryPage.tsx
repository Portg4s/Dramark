import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  mapLibraryEntryToCatalogMedia,
  useLibraryCounts,
  useLibraryEntries,
  useLibraryMediaActions
} from '@/features/library/hooks';
import { LibraryMediaItem } from '@/features/library/LibraryMediaItem';
import { sortLibraryEntries, type LibrarySort } from '@/features/library/sorting';
import type { LibraryStatus } from '@/types/media';

const tabs = [
  { status: 'watchlist', label: 'A regarder' },
  { status: 'watched', label: 'Vu' }
] as const;

const sortOptions = [
  { value: 'recent', label: 'Ajout recent' },
  { value: 'title', label: 'Titre A-Z' },
  { value: 'year', label: 'Annee' },
  { value: 'rating', label: 'Note TMDB' }
] as const;

function getEmptyMessage(status: LibraryStatus): string {
  return status === 'watchlist'
    ? 'Ajoutez votre prochain drama depuis la recherche.'
    : 'Les films et series que vous terminez apparaitront ici.';
}

export function LibraryPage() {
  const [activeStatus, setActiveStatus] = useState<LibraryStatus>('watchlist');
  const [sort, setSort] = useState<LibrarySort>('recent');
  const entries = useLibraryEntries(activeStatus);
  const counts = useLibraryCounts();
  const libraryActions = useLibraryMediaActions();

  const sortedEntries = useMemo(
    () => sortLibraryEntries(entries.data ?? [], sort),
    [entries.data, sort]
  );
  const activeIndex = activeStatus === 'watchlist' ? 0 : 1;

  return (
    <div className="space-y-6">
      <header className="space-y-4 pt-2">
        <div>
          <p className="text-sm font-semibold text-viki-soft">Collection</p>
          <h1 className="mt-1 text-3xl font-black text-white">Ma liste</h1>
        </div>
        <p className="text-sm font-medium text-muted">
          {counts.watchlist} a regarder <span className="px-2 text-subtle">·</span> {counts.watched}{' '}
          vus
        </p>
      </header>

      <div className="relative grid grid-cols-2 rounded-full bg-white/[0.07] p-1">
        <span
          aria-hidden="true"
          className="absolute bottom-1 top-1 w-[calc(50%-0.25rem)] rounded-full bg-viki shadow-[0_10px_24px_rgba(255,79,135,0.25)] transition-transform duration-300 ease-[var(--ease-dramark)]"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {tabs.map(({ status, label }) => {
          const count = status === 'watchlist' ? counts.watchlist : counts.watched;
          const isActive = activeStatus === status;

          return (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={[
                'focus-ring relative z-10 flex min-h-12 items-center justify-center gap-2 rounded-full px-3 text-sm font-bold transition duration-200',
                isActive ? 'text-white' : 'text-muted hover:text-white'
              ].join(' ')}
              aria-pressed={isActive}
            >
              {label}
              <span className={isActive ? 'text-white/82' : 'text-subtle'}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <label className="relative inline-flex items-center">
          <span className="sr-only">Trier la liste</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as LibrarySort)}
            className="focus-ring min-h-11 appearance-none rounded-full bg-white/[0.075] py-0 pl-4 pr-10 text-sm font-semibold text-white outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 size-4 text-subtle"
          />
        </label>
      </div>

      {entries.isLoading ? (
        <div
          role="status"
          className="rounded-[1.35rem] bg-white/[0.055] px-5 py-6 text-sm text-muted"
        >
          Chargement de votre liste...
        </div>
      ) : null}

      {entries.error ? (
        <div className="rounded-[1.35rem] bg-danger/12 px-5 py-4 text-sm text-red-100">
          Impossible de lire la bibliotheque locale pour le moment.
        </div>
      ) : null}

      {!entries.isLoading && !entries.error && sortedEntries.length === 0 ? (
        <div className="rounded-[1.35rem] bg-white/[0.055] px-5 py-8 text-center">
          <p className="text-sm font-medium text-muted">{getEmptyMessage(activeStatus)}</p>
        </div>
      ) : null}

      {sortedEntries.length > 0 ? (
        <div className="space-y-3">
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
        </div>
      ) : null}
    </div>
  );
}
