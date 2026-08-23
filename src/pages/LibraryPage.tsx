import { CheckCircle2, Clock3 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/ui/PageHeader';
import type { CatalogMedia } from '@/features/catalog/types';
import {
  createSnapshotFromCatalogMedia,
  useLibraryCounts,
  useLibraryEntries,
  useRemoveLibraryEntry,
  useSetLibraryStatus
} from '@/features/library/hooks';
import { LibraryMediaItem } from '@/features/library/LibraryMediaItem';
import { sortLibraryEntries, type LibrarySort } from '@/features/library/sorting';
import type { LibraryEntryRecord, LibraryStatus } from '@/types/media';

const tabs = [
  { status: 'watchlist', label: 'A regarder', icon: Clock3 },
  { status: 'watched', label: 'Vu', icon: CheckCircle2 }
] as const;

const sortOptions = [
  { value: 'recent', label: 'Ajout recent' },
  { value: 'title', label: 'Titre A-Z' },
  { value: 'year', label: 'Annee' },
  { value: 'rating', label: 'Note TMDB' }
] as const;

function mapEntryToCatalogMedia(entry: LibraryEntryRecord): CatalogMedia {
  return {
    mediaType: entry.mediaType,
    tmdbId: entry.tmdbId,
    title: entry.snapshot?.title ?? 'Titre inconnu',
    posterPath: entry.snapshot?.posterPath,
    releaseYear: entry.snapshot?.releaseYear,
    originCountries: entry.snapshot?.primaryCountry ? [entry.snapshot.primaryCountry] : [],
    voteAverage: entry.snapshot?.voteAverage
  };
}

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
  const setStatus = useSetLibraryStatus();
  const removeEntry = useRemoveLibraryEntry();
  const isMutating = setStatus.isPending || removeEntry.isPending;

  const sortedEntries = useMemo(
    () => sortLibraryEntries(entries.data ?? [], sort),
    [entries.data, sort]
  );

  function handleSetStatus(media: CatalogMedia, status: LibraryStatus) {
    setStatus.mutate({
      mediaType: media.mediaType,
      tmdbId: media.tmdbId,
      status,
      snapshot: createSnapshotFromCatalogMedia(media)
    });
  }

  function handleRemove(media: CatalogMedia) {
    removeEntry.mutate({ mediaType: media.mediaType, tmdbId: media.tmdbId });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ma liste"
        title="Votre bibliotheque"
        description="Deux listes locales sur cet appareil : ce que vous voulez regarder, et ce que vous avez deja vu."
      />

      <div className="grid grid-cols-2 gap-2 rounded-lg bg-white/10 p-1">
        {tabs.map(({ status, label, icon: Icon }) => {
          const isActive = activeStatus === status;
          const count = status === 'watchlist' ? counts.watchlist : counts.watched;

          return (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={[
                'flex min-h-12 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-viki',
                isActive ? 'bg-viki text-white' : 'text-muted hover:bg-white/10 hover:text-white'
              ].join(' ')}
            >
              <Icon aria-hidden="true" size={18} />
              {label}
              <span className="rounded-full bg-black/25 px-2 py-0.5 text-xs">{count}</span>
            </button>
          );
        })}
      </div>

      <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-muted shadow-panel">
        <span className="font-semibold text-white">Tri</span>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as LibrarySort)}
          className="min-h-10 rounded-md border border-white/10 bg-app px-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-viki"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {entries.isLoading ? (
        <div
          role="status"
          className="rounded-lg border border-white/10 bg-surface px-5 py-6 text-sm text-muted"
        >
          Chargement de votre liste...
        </div>
      ) : null}

      {entries.error ? (
        <div className="rounded-lg border border-red-300/20 bg-red-300/10 px-5 py-4 text-sm text-red-100">
          Impossible de lire la bibliotheque locale pour le moment.
        </div>
      ) : null}

      {!entries.isLoading && !entries.error && sortedEntries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/14 bg-white/5 px-5 py-8 text-center">
          <p className="text-sm font-medium text-muted">{getEmptyMessage(activeStatus)}</p>
        </div>
      ) : null}

      {sortedEntries.length > 0 ? (
        <div className="space-y-3">
          {sortedEntries.map((entry) => {
            const media = mapEntryToCatalogMedia(entry);

            return (
              <LibraryMediaItem
                key={entry.id}
                media={media}
                entry={entry}
                mode="library"
                isBusy={isMutating}
                onSetStatus={handleSetStatus}
                onRemove={handleRemove}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
