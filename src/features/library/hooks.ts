import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  listLibraryEntries,
  listLibraryEntriesByStatus,
  removeLibraryEntry,
  setLibraryEntryStatus,
  type SetLibraryStatusInput
} from '@/db/libraryRepository';
import type { CatalogMedia } from '@/features/catalog/types';
import type {
  LibraryEntryRecord,
  LibraryStatus,
  LocalMediaSnapshot,
  MediaIdentity
} from '@/types/media';

export const libraryQueryKeys = {
  all: ['library'] as const,
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

export function useLibraryEntries(status?: LibraryStatus) {
  return useQuery({
    queryKey: status ? libraryQueryKeys.byStatus(status) : libraryQueryKeys.entries(),
    queryFn: () => (status ? listLibraryEntriesByStatus(status) : listLibraryEntries()),
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
  const setStatus = useSetLibraryStatus();
  const removeEntry = useRemoveLibraryEntry();

  return {
    isMutating: setStatus.isPending || removeEntry.isPending,
    setStatusForMedia(media: CatalogMedia, status: LibraryStatus) {
      setStatus.mutate({
        mediaType: media.mediaType,
        tmdbId: media.tmdbId,
        status,
        snapshot: createSnapshotFromCatalogMedia(media)
      });
    },
    removeMedia(media: CatalogMedia) {
      removeEntry.mutate({ mediaType: media.mediaType, tmdbId: media.tmdbId });
    }
  };
}

export function getLibraryEntryStatusLabel(entry: LibraryEntryRecord | undefined): string {
  if (!entry) {
    return 'Non classe';
  }

  return entry.status === 'watchlist' ? 'A regarder' : 'Vu';
}
