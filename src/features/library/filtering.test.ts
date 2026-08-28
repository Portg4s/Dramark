import { describe, expect, it } from 'vitest';

import { filterLibraryEntries } from '@/features/library/filtering';
import type { LibraryEntryRecord } from '@/types/media';

const entries: LibraryEntryRecord[] = [
  {
    id: 'tv:1',
    mediaType: 'tv',
    tmdbId: 1,
    status: 'watchlist',
    addedAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
    snapshot: { title: 'Moving' }
  },
  {
    id: 'movie:2',
    mediaType: 'movie',
    tmdbId: 2,
    status: 'watchlist',
    addedAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
    snapshot: { title: 'Past Lives' }
  }
];

describe('filterLibraryEntries', () => {
  it('filters entries by media type and title query', () => {
    expect(filterLibraryEntries(entries, { mediaType: 'tv', query: 'mov' })).toEqual([entries[0]]);
    expect(filterLibraryEntries(entries, { mediaType: 'movie', query: 'moving' })).toEqual([]);
  });
});
