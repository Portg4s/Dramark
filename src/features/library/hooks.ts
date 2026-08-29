import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  listLibraryActivity,
  listLibraryEntries,
  listLibraryEntriesByStatus,
  removeLibraryEntry,
  setLibraryEntryStatus,
  setLibraryEntryTvProgress,
  upsertLibraryEntry,
  type SetLibraryStatusInput,
  type SetTvProgressInput
} from '@/db/libraryRepository';
import { showToast } from '@/components/system/toastStore';
import type { CatalogMedia } from '@/features/catalog/types';
import {
  getNextEpisode,
  getProgressRatio,
  getTotalEpisodeCount,
  getTvViewingState,
  getWatchedEpisodeCount,
  hasPartialRegularProgress
} from '@/features/media/tvProgress';
import type {
  LibraryEntryRecord,
  LibraryStatus,
  LocalMediaSnapshot,
  MediaIdentity,
  TvSeasonProgressMeta
} from '@/types/media';

export const libraryQueryKeys = {
  all: ['library'] as const,
  activity: (limit: number) => [...libraryQueryKeys.all, 'activity', limit] as const,
  entries: () => [...libraryQueryKeys.all, 'entries'] as const,
  byStatus: (status: LibraryStatus) => [...libraryQueryKeys.entries(), status] as const
};

export function createSnapshotFromCatalogMedia(media: CatalogMedia): LocalMediaSnapshot {
  return {
    title: media.title,
    posterPath: media.posterPath,
    releaseYear: media.releaseYear,
    primaryCountry: media.originCountries[0],
    voteAverage: media.voteAverage
  };
}

export function mapLibraryEntryToCatalogMedia(entry: LibraryEntryRecord): CatalogMedia {
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

export function getLibraryEntryProgress(entry: LibraryEntryRecord | undefined) {
  const seasons = entry?.tvProgress?.seasons ?? [];
  const watched = getWatchedEpisodeCount(entry, seasons);
  const total = getTotalEpisodeCount(seasons);
  const state = getTvViewingState(entry, seasons);

  return {
    state,
    watched,
    total,
    ratio: getProgressRatio(entry, seasons),
    nextEpisode: getNextEpisode(entry, seasons),
    isPartial: entry ? hasPartialRegularProgress(entry) : false
  };
}

export function useLibraryEntries(status?: LibraryStatus) {
  return useQuery({
    queryKey: status ? libraryQueryKeys.byStatus(status) : libraryQueryKeys.entries(),
    queryFn: () => (status ? listLibraryEntriesByStatus(status) : listLibraryEntries()),
    staleTime: 1000 * 20
  });
}

export function useLibraryActivity(limit = 5) {
  return useQuery({
    queryKey: libraryQueryKeys.activity(limit),
    queryFn: () => listLibraryActivity(limit),
    staleTime: 1000 * 20
  });
}

export function useLibraryIndex() {
  const entries = useLibraryEntries();

  return {
    ...entries,
    data: new Map(entries.data?.map((entry) => [entry.id, entry]) ?? [])
  };
}

export function useLibraryCounts() {
  const entries = useLibraryEntries();
  const list = entries.data ?? [];

  return {
    ...entries,
    watchlist: list.filter((entry) => entry.status === 'watchlist').length,
    watched: list.filter((entry) => entry.status === 'watched').length
  };
}

export function useSetLibraryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SetLibraryStatusInput) => setLibraryEntryStatus(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: libraryQueryKeys.all });
    }
  });
}

export function useSetTvProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SetTvProgressInput) => setLibraryEntryTvProgress(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: libraryQueryKeys.all });
    }
  });
}

export function useRemoveLibraryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (identity: MediaIdentity) => removeLibraryEntry(identity),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: libraryQueryKeys.all });
    }
  });
}

export function useLibraryMediaActions() {
  const queryClient = useQueryClient();
  const setStatus = useSetLibraryStatus();
  const setTvProgress = useSetTvProgress();
  const removeEntry = useRemoveLibraryEntry();

  async function restorePreviousEntry(
    previousEntry: LibraryEntryRecord | undefined,
    media: CatalogMedia
  ) {
    if (previousEntry) {
      await upsertLibraryEntry(previousEntry);
    } else {
      await removeLibraryEntry(media);
    }

    await queryClient.invalidateQueries({ queryKey: libraryQueryKeys.all });
  }

  return {
    isMutating: setStatus.isPending || setTvProgress.isPending || removeEntry.isPending,
    setStatusForMedia(
      media: CatalogMedia,
      status: LibraryStatus,
      previousEntry?: LibraryEntryRecord
    ) {
      setStatus.mutate(
        {
          mediaType: media.mediaType,
          tmdbId: media.tmdbId,
          status,
          snapshot: createSnapshotFromCatalogMedia(media)
        },
        {
          onSuccess: () => {
            showToast({
              title: status === 'watched' ? 'Marque comme vu' : 'Ajoute a regarder',
              detail: media.title,
              actionLabel: 'Annuler',
              onAction: () => restorePreviousEntry(previousEntry, media)
            });
          }
        }
      );
    },
    setTvProgressForMedia(
      media: CatalogMedia,
      seasons: TvSeasonProgressMeta[],
      watchedEpisodes: string[]
    ) {
      setTvProgress.mutate({
        mediaType: media.mediaType,
        tmdbId: media.tmdbId,
        seasons,
        watchedEpisodes,
        snapshot: createSnapshotFromCatalogMedia(media)
      });
    },
    removeMedia(media: CatalogMedia, previousEntry?: LibraryEntryRecord) {
      removeEntry.mutate(
        { mediaType: media.mediaType, tmdbId: media.tmdbId },
        {
          onSuccess: () => {
            showToast({
              title: 'Retire de ma liste',
              detail: media.title,
              actionLabel: previousEntry ? 'Annuler' : undefined,
              onAction: previousEntry
                ? async () => {
                    await upsertLibraryEntry(previousEntry);
                    await queryClient.invalidateQueries({ queryKey: libraryQueryKeys.all });
                  }
                : undefined
            });
          }
        }
      );
    }
  };
}

export function getLibraryEntryStatusLabel(entry: LibraryEntryRecord | undefined): string {
  if (!entry) {
    return 'Non classé';
  }

  if (getLibraryEntryProgress(entry).state === 'in_progress') {
    return 'En cours';
  }

  return entry.status === 'watchlist' ? 'À regarder' : 'Vu';
}
