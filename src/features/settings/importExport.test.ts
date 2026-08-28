import { describe, expect, it } from 'vitest';

import { createLibraryRepository, type LibraryTable } from '@/db/libraryRepository';
import {
  createLibraryExport,
  importLibraryData,
  parseLibraryExport
} from '@/features/settings/importExport';
import type { LibraryEntryRecord } from '@/types/media';

function createMemoryTable(initialEntries: LibraryEntryRecord[] = []): LibraryTable & {
  records: Map<string, LibraryEntryRecord>;
} {
  const records = new Map(initialEntries.map((entry) => [entry.id, entry]));

  return {
    records,
    async get(key) {
      return records.get(key);
    },
    async put(record) {
      records.set(record.id, record);
      return record.id;
    },
    async delete(key) {
      records.delete(key);
    },
    async toArray() {
      return Array.from(records.values());
    }
  };
}

describe('library import/export', () => {
  it('exports entries without database ids while preserving display metadata', () => {
    const exported = createLibraryExport(
      [
        {
          id: 'tv:42',
          mediaType: 'tv',
          tmdbId: 42,
          status: 'watchlist',
          addedAt: '2026-08-24T10:00:00.000Z',
          updatedAt: '2026-08-24T10:00:00.000Z',
          snapshot: {
            title: 'Drama',
            posterPath: '/poster.jpg',
            releaseYear: 2024,
            primaryCountry: 'KR',
            voteAverage: 8.2
          },
          tvProgress: {
            watchedEpisodes: ['1:1'],
            seasons: [{ seasonNumber: 1, episodeCount: 12 }],
            updatedAt: '2026-08-24T10:00:00.000Z'
          }
        }
      ],
      '2026-08-25T10:00:00.000Z'
    );

    expect(exported).toEqual({
      version: 1,
      exportedAt: '2026-08-25T10:00:00.000Z',
      entries: [
        {
          mediaType: 'tv',
          tmdbId: 42,
          status: 'watchlist',
          addedAt: '2026-08-24T10:00:00.000Z',
          updatedAt: '2026-08-24T10:00:00.000Z',
          snapshot: {
            title: 'Drama',
            posterPath: '/poster.jpg',
            releaseYear: 2024,
            primaryCountry: 'KR',
            voteAverage: 8.2
          },
          tvProgress: {
            watchedEpisodes: ['1:1'],
            seasons: [{ seasonNumber: 1, episodeCount: 12 }],
            updatedAt: '2026-08-24T10:00:00.000Z'
          }
        }
      ]
    });
  });

  it('rejects invalid import files', () => {
    expect(() => parseLibraryExport('{"version":2,"entries":[]}')).toThrow(
      'Fichier Dramark invalide'
    );
  });

  it('imports valid entries without overwriting existing media', async () => {
    const table = createMemoryTable([
      {
        id: 'movie:10',
        mediaType: 'movie',
        tmdbId: 10,
        status: 'watched',
        addedAt: '2026-08-24T10:00:00.000Z',
        updatedAt: '2026-08-24T10:00:00.000Z'
      }
    ]);
    const repository = createLibraryRepository(table);
    const payload = JSON.stringify({
      version: 1,
      exportedAt: '2026-08-25T10:00:00.000Z',
      entries: [
        {
          mediaType: 'movie',
          tmdbId: 10,
          status: 'watchlist',
          addedAt: '2026-08-23T10:00:00.000Z',
          updatedAt: '2026-08-23T10:00:00.000Z'
        },
        {
          mediaType: 'tv',
          tmdbId: 11,
          status: 'watchlist',
          addedAt: '2026-08-23T11:00:00.000Z',
          updatedAt: '2026-08-23T11:00:00.000Z',
          snapshot: { title: 'New Drama' }
        }
      ]
    });

    const result = await importLibraryData(payload, repository);

    expect(result).toEqual({ importedCount: 1, skippedCount: 1 });
    expect(table.records.get('movie:10')?.status).toBe('watched');
    expect(table.records.get('tv:11')?.snapshot?.title).toBe('New Drama');
  });
});
