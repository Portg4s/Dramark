import { describe, expect, it } from 'vitest';

import { sortLibraryEntries } from '@/features/library/sorting';
import type { LibraryEntryRecord } from '@/types/media';

const entries: LibraryEntryRecord[] = [
  {
    id: 'tv:1',
    mediaType: 'tv',
    tmdbId: 1,
    status: 'watchlist',
    addedAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z',
    snapshot: { title: 'Beta', releaseYear: 2021, voteAverage: 8.1 }
  },
  {
    id: 'movie:2',
    mediaType: 'movie',
    tmdbId: 2,
    status: 'watchlist',
    addedAt: '2026-08-22T10:00:00.000Z',
    updatedAt: '2026-08-22T10:00:00.000Z',
    snapshot: { title: 'Alpha', releaseYear: 2024, voteAverage: 7.4 }
  },
  {
    id: 'tv:3',
    mediaType: 'tv',
    tmdbId: 3,
    status: 'watchlist',
    addedAt: '2026-08-21T10:00:00.000Z',
    updatedAt: '2026-08-21T10:00:00.000Z',
    snapshot: { title: 'Gamma', releaseYear: 2019, voteAverage: 9.2 }
  }
];

describe('sortLibraryEntries', () => {
  it('sorts by most recent added date by default', () => {
    expect(sortLibraryEntries(entries, 'recent').map((entry) => entry.id)).toEqual([
      'movie:2',
      'tv:3',
      'tv:1'
    ]);
  });

  it('sorts by title, year and rating', () => {
    expect(sortLibraryEntries(entries, 'title').map((entry) => entry.id)).toEqual([
      'movie:2',
      'tv:1',
      'tv:3'
    ]);
    expect(sortLibraryEntries(entries, 'year').map((entry) => entry.id)).toEqual([
      'movie:2',
      'tv:1',
      'tv:3'
    ]);
    expect(sortLibraryEntries(entries, 'rating').map((entry) => entry.id)).toEqual([
      'tv:3',
      'tv:1',
      'movie:2'
    ]);
  });
});
