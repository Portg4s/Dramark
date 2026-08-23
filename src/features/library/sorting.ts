import type { LibraryEntryRecord } from '@/types/media';

export type LibrarySort = 'recent' | 'title' | 'year' | 'rating';

export function sortLibraryEntries(
  entries: LibraryEntryRecord[],
  sort: LibrarySort
): LibraryEntryRecord[] {
  return [...entries].sort((left, right) => {
    if (sort === 'title') {
      return (left.snapshot?.title ?? '').localeCompare(right.snapshot?.title ?? '', 'fr', {
        sensitivity: 'base'
      });
    }

    if (sort === 'year') {
      return (right.snapshot?.releaseYear ?? 0) - (left.snapshot?.releaseYear ?? 0);
    }

    if (sort === 'rating') {
      return (right.snapshot?.voteAverage ?? 0) - (left.snapshot?.voteAverage ?? 0);
    }

    return new Date(right.addedAt).getTime() - new Date(left.addedAt).getTime();
  });
}
