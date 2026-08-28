import { Search, X } from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
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
import { quickFade } from '@/utils/motion';

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
  const reducedMotion = useReducedMotion();
  const query = searchParams.get('q') ?? '';
  const debouncedQuery = useDebouncedValue(normalizeSearchQuery(query), 350);
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
          className="group flex min-h-14 items-center gap-3 rounded-[1.35rem] bg-surface/72 px-4 shadow-[0_18px_45px_rgba(0,0,0,0.26)] transition focus-within:bg-surface-2/64 focus-within:shadow-[0_0_0_2px_rgba(89,183,255,0.42)]"
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
          <AnimatePresence initial={false}>
            {query ? (
              <motion.button
                type="button"
                onClick={() => updateQuery('')}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                whileTap={reducedMotion ? undefined : { scale: 0.94 }}
                transition={quickFade}
                className="pressable focus-ring flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-2/60 hover:text-white"
                aria-label="Effacer la recherche"
              >
                <X aria-hidden="true" className="size-5" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </form>
      </header>

      <AnimatePresence mode="popLayout" initial={false}>
        {message ? (
          <motion.div
            key="message"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={quickFade}
            className="rounded-[1.35rem] bg-surface/64 px-5 py-6 text-center text-sm font-medium leading-6 text-muted"
          >
            {message}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="popLayout" initial={false}>
        {search.isLoading ? (
          <motion.div
            key="loading"
            role="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={quickFade}
            className="space-y-3"
          >
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="grid grid-cols-[5.6rem_1fr] gap-3 rounded-[1.35rem] bg-surface/64 p-2.5"
              >
                <div className="aspect-[2/3] animate-pulse rounded-[1.05rem] bg-surface-2/70" />
                <div className="space-y-3 py-3">
                  <div className="h-3 w-24 animate-pulse rounded-full bg-surface-2/70" />
                  <div className="h-5 w-3/4 animate-pulse rounded-full bg-surface-2/70" />
                  <div className="h-10 w-full animate-pulse rounded-full bg-surface-2/70" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {search.error ? (
        <div className="rounded-[1.35rem] bg-danger/12 px-5 py-4 text-sm leading-6 text-red-100">
          Impossible de charger les résultats TMDB pour le moment.
        </div>
      ) : null}

      <AnimatePresence mode="popLayout" initial={false}>
        {search.data && search.data.results.length === 0 ? (
          <motion.div
            key="empty"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={quickFade}
            className="rounded-[1.35rem] bg-surface/64 px-5 py-8 text-center"
          >
            <p className="text-sm font-medium text-muted">Aucun film ou série trouvé.</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {search.data && search.data.results.length > 0 ? (
        <LayoutGroup id="search-results">
          <motion.div layout className="space-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {search.data.results.map((media, index) => (
                <LibraryMediaItem
                  key={`${media.mediaType}:${media.tmdbId}`}
                  media={media}
                  mode="search"
                  motionIndex={index}
                  entry={libraryIndex.data.get(createMediaKey(media))}
                  isBusy={libraryActions.isMutating}
                  onSetStatus={handleSetStatus}
                  onRemove={libraryActions.removeMedia}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      ) : null}
    </div>
  );
}
