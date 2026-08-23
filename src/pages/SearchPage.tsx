import { Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import type { CatalogMedia } from '@/features/catalog/types';
import { useLibraryIndex, useLibraryMediaActions } from '@/features/library/hooks';
import { LibraryMediaItem } from '@/features/library/LibraryMediaItem';
import { useTmdbMediaSearch } from '@/features/search/hooks';
import { createSearchParamsForQuery, normalizeSearchQuery } from '@/features/search/searchParams';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { tmdbRuntimeConfig } from '@/services/tmdb/config';
import type { LibraryStatus } from '@/types/media';
import { createMediaKey } from '@/utils/mediaKey';

function getSearchMessage(query: string, debouncedQuery: string): string | undefined {
  if (!tmdbRuntimeConfig.isConfigured) {
    return 'Ajoutez un token TMDB local pour activer la recherche.';
  }

  if (query.trim().length === 0) {
    return 'Recherchez le titre que vous venez de repérer.';
  }

  if (debouncedQuery.trim().length < 2) {
    return 'Tapez au moins 2 caractères.';
  }

  return undefined;
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = normalizeSearchQuery(searchParams.get('q'));
  const debouncedQuery = useDebouncedValue(query, 350);
  const search = useTmdbMediaSearch(debouncedQuery);
  const libraryIndex = useLibraryIndex();
  const libraryActions = useLibraryMediaActions();
  const message = getSearchMessage(query, debouncedQuery);

  function updateQuery(nextQuery: string) {
    setSearchParams(createSearchParamsForQuery(nextQuery), { replace: true });
  }

  function handleSetStatus(media: CatalogMedia, status: LibraryStatus) {
    libraryActions.setStatusForMedia(media, status);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4 pt-2">
        <div>
          <p className="text-sm font-semibold text-brand-soft">Recherche</p>
          <h1 className="mt-1 text-3xl font-black text-white">Trouver un titre</h1>
        </div>
        <form
          className="group flex min-h-14 items-center gap-3 rounded-[1.35rem] bg-white/[0.075] px-4 shadow-[0_18px_45px_rgba(0,0,0,0.26)] transition focus-within:bg-white/[0.10] focus-within:shadow-[0_0_0_2px_rgba(89,183,255,0.42)]"
          onSubmit={(event) => event.preventDefault()}
        >
          <Search aria-hidden="true" className="size-5 shrink-0 text-brand-soft" />
          <input
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            aria-label="Recherche"
            placeholder="Nom d'un drama, film ou série"
            className="min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-subtle outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => updateQuery('')}
              className="pressable focus-ring flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-white"
              aria-label="Effacer la recherche"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          ) : null}
        </form>
      </header>

      {message ? (
        <div className="rounded-[1.35rem] bg-white/[0.055] px-5 py-6 text-center text-sm font-medium leading-6 text-muted">
          {message}
        </div>
      ) : null}

      {search.isLoading ? (
        <div role="status" className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="grid grid-cols-[5.6rem_1fr] gap-3 rounded-[1.35rem] bg-white/[0.055] p-2.5"
            >
              <div className="aspect-[2/3] animate-pulse rounded-[1.05rem] bg-white/10" />
              <div className="space-y-3 py-3">
                <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/10" />
                <div className="h-10 w-full animate-pulse rounded-full bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {search.error ? (
        <div className="rounded-[1.35rem] bg-danger/12 px-5 py-4 text-sm leading-6 text-red-100">
          Impossible de charger les résultats TMDB pour le moment.
        </div>
      ) : null}

      {search.data && search.data.results.length === 0 ? (
        <div className="rounded-[1.35rem] bg-white/[0.055] px-5 py-8 text-center">
          <p className="text-sm font-medium text-muted">Aucun film ou série trouvé.</p>
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
              isBusy={libraryActions.isMutating}
              onSetStatus={handleSetStatus}
              onRemove={libraryActions.removeMedia}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
