import type { LibraryEntryRecord, MediaType } from '@/types/media';

export type LibraryMediaTypeFilter = MediaType | 'all';

export type LibraryFilter = {
  mediaType: LibraryMediaTypeFilter;
  query: string;
};

export function filterLibraryEntries(entries: LibraryEntryRecord[], filter: LibraryFilter) {
  const normalizedQuery = filter.query.trim().toLocaleLowerCase('fr-FR');

  return entries.filter((entry) => {
    if (filter.mediaType !== 'all' && entry.mediaType !== filter.mediaType) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (entry.snapshot?.title ?? 'Titre inconnu')
      .toLocaleLowerCase('fr-FR')
      .includes(normalizedQuery);
  });
}
