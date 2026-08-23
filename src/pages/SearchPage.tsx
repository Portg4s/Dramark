import { Search, X } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/ui/PageHeader';
import {
  useLibraryIndex,
  useRemoveLibraryEntry,
  useSetLibraryStatus,
  createSnapshotFromCatalogMedia
} from '@/features/library/hooks';
import { LibraryMediaItem } from '@/features/library/LibraryMediaItem';
import { useTmdbMediaSearch } from '@/features/search/hooks';
import { tmdbRuntimeConfig } from '@/services/tmdb/config';
import type { LibraryStatus } from '@/types/media';
import { createMediaKey } from '@/utils/mediaKey';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { CatalogMedia } from '@/features/catalog/types';

function getSearchMessage(query: string, debouncedQuery: string): string | undefined {
  if (!tmdbRuntimeConfig.isConfigured) {
    return 'Ajoutez un token TMDB local pour activer la recherche.';
  }

  if (query.trim().length === 0) {
    return 'Saisissez un titre de film ou de serie.';
  }

  if (debouncedQuery.trim().length < 2) {
    return 'Tapez au moins 2 caracteres.';
  }

  return undefined;
}

export function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 350);
  const search = useTmdbMediaSearch(debouncedQuery);
  const libraryIndex = useLibraryIndex();
  const setStatus = useSetLibraryStatus();
  const removeEntry = useRemoveLibraryEntry();
  const message = getSearchMessage(query, debouncedQuery);
  const isMutating = setStatus.isPending || removeEntry.isPending;

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
        eyebrow="Recherche"
        title="Trouver un titre"
        description="Recherchez films et series dans TMDB, puis classez-les dans votre bibliotheque locale."
      />

      <form
        className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-surface px-4 shadow-panel focus-within:ring-2 focus-within:ring-viki"
        onSubmit={(event) => event.preventDefault()}
      >
        <Search aria-hidden="true" className="size-5 shrink-0 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Recherche"
          placeholder="Nom d'un drama, film ou serie"
          className="min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-muted outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-viki"
            aria-label="Effacer la recherche"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        ) : null}
      </form>

      {message ? (
        <div className="rounded-lg border border-white/10 bg-white/6 px-5 py-6 text-center text-sm font-medium text-muted">
          {message}
        </div>
      ) : null}

      {search.isLoading ? (
        <div
          role="status"
          className="rounded-lg border border-white/10 bg-surface px-5 py-6 text-sm text-muted"
        >
          Recherche en cours...
        </div>
      ) : null}

      {search.error ? (
        <div className="rounded-lg border border-red-300/20 bg-red-300/10 px-5 py-4 text-sm text-red-100">
          Impossible de charger les resultats TMDB pour le moment.
        </div>
      ) : null}

      {search.data && search.data.results.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/14 bg-white/5 px-5 py-8 text-center">
          <p className="text-sm font-medium text-muted">Aucun film ou serie trouve.</p>
        </div>
      ) : null}

      {search.data && search.data.results.length > 0 ? (
        <div className="space-y-3">
          {search.data.results.map((media) => (
            <LibraryMediaItem
              key={`${media.mediaType}:${media.tmdbId}`}
              media={media}
              mode="search"
              entry={libraryIndex.data.get(createMediaKey(media))}
              isBusy={isMutating}
              onSetStatus={handleSetStatus}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
