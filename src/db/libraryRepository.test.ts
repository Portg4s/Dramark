import { describe, expect, it } from 'vitest';

import { createLibraryRepository, type LibraryTable } from '@/db/libraryRepository';
import { createEpisodeKey, createFullRegularWatchedEpisodes } from '@/features/media/tvProgress';
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

describe('libraryRepository', () => {
  it('adds a watchlist entry without watchedAt', async () => {
    const table = createMemoryTable();
    const repository = createLibraryRepository(table);

    const entry = await repository.setStatus({
      mediaType: 'tv',
      tmdbId: 10,
      status: 'watchlist',
      now: '2026-08-23T10:00:00.000Z',
      snapshot: { title: 'Drama', releaseYear: 2024 }
    });

    expect(entry).toMatchObject({
      id: 'tv:10',
      status: 'watchlist',
      addedAt: '2026-08-23T10:00:00.000Z',
      updatedAt: '2026-08-23T10:00:00.000Z',
      snapshot: { title: 'Drama', releaseYear: 2024 }
    });
    expect(entry.watchedAt).toBeUndefined();
  });

  it('adds a watched entry with watchedAt', async () => {
    const repository = createLibraryRepository(createMemoryTable());

    const entry = await repository.setStatus({
      mediaType: 'movie',
      tmdbId: 11,
      status: 'watched',
      now: '2026-08-23T11:00:00.000Z'
    });

    expect(entry.status).toBe('watched');
    expect(entry.addedAt).toBe('2026-08-23T11:00:00.000Z');
    expect(entry.watchedAt).toBe('2026-08-23T11:00:00.000Z');
  });

  it('moves watchlist to watched while preserving addedAt', async () => {
    const table = createMemoryTable();
    const repository = createLibraryRepository(table);

    await repository.setStatus({
      mediaType: 'tv',
      tmdbId: 12,
      status: 'watchlist',
      now: '2026-08-23T09:00:00.000Z'
    });
    const entry = await repository.setStatus({
      mediaType: 'tv',
      tmdbId: 12,
      status: 'watched',
      now: '2026-08-23T12:00:00.000Z'
    });

    expect(entry.addedAt).toBe('2026-08-23T09:00:00.000Z');
    expect(entry.updatedAt).toBe('2026-08-23T12:00:00.000Z');
    expect(entry.watchedAt).toBe('2026-08-23T12:00:00.000Z');
  });

  it('moves watched to watchlist while removing watchedAt and preserving addedAt', async () => {
    const repository = createLibraryRepository(createMemoryTable());

    await repository.setStatus({
      mediaType: 'movie',
      tmdbId: 13,
      status: 'watched',
      now: '2026-08-23T09:00:00.000Z'
    });
    const entry = await repository.setStatus({
      mediaType: 'movie',
      tmdbId: 13,
      status: 'watchlist',
      now: '2026-08-23T12:00:00.000Z'
    });

    expect(entry.addedAt).toBe('2026-08-23T09:00:00.000Z');
    expect(entry.status).toBe('watchlist');
    expect(entry.watchedAt).toBeUndefined();
  });

  it('does not create duplicates for the same media identity', async () => {
    const table = createMemoryTable();
    const repository = createLibraryRepository(table);

    await repository.setStatus({ mediaType: 'tv', tmdbId: 14, status: 'watchlist' });
    await repository.setStatus({ mediaType: 'tv', tmdbId: 14, status: 'watchlist' });

    expect(table.records.size).toBe(1);
  });

  it('lists by status and removes entries', async () => {
    const repository = createLibraryRepository(createMemoryTable());

    await repository.setStatus({ mediaType: 'tv', tmdbId: 15, status: 'watchlist' });
    await repository.setStatus({ mediaType: 'movie', tmdbId: 16, status: 'watched' });

    await expect(repository.listByStatus('watchlist')).resolves.toHaveLength(1);
    await repository.remove({ mediaType: 'tv', tmdbId: 15 });
    await expect(repository.get({ mediaType: 'tv', tmdbId: 15 })).resolves.toBeUndefined();
  });

  it('clears tv progress when a series is explicitly reset to watchlist', async () => {
    const repository = createLibraryRepository(createMemoryTable());

    await repository.setTvProgress({
      mediaType: 'tv',
      tmdbId: 21,
      seasons: [{ seasonNumber: 1, episodeCount: 1 }],
      watchedEpisodes: ['1:1'],
      now: '2026-08-23T09:00:00.000Z'
    });
    const entry = await repository.setStatus({
      mediaType: 'tv',
      tmdbId: 21,
      status: 'watchlist',
      now: '2026-08-23T10:00:00.000Z'
    });

    expect(entry.status).toBe('watchlist');
    expect(entry.tvProgress).toBeUndefined();
    expect(entry.watchedAt).toBeUndefined();
  });

  it('marks a series watched when all regular episodes are watched', async () => {
    const repository = createLibraryRepository(createMemoryTable());

    const entry = await repository.setTvProgress({
      mediaType: 'tv',
      tmdbId: 22,
      seasons: [
        { seasonNumber: 0, episodeCount: 2 },
        { seasonNumber: 1, episodeCount: 2 }
      ],
      watchedEpisodes: ['0:1', '1:1', '1:2'],
      now: '2026-08-23T11:00:00.000Z'
    });

    expect(entry.status).toBe('watched');
    expect(entry.watchedAt).toBe('2026-08-23T11:00:00.000Z');
    expect(entry.tvProgress?.watchedEpisodes).toEqual(['0:1', '1:1', '1:2']);
  });

  it('keeps a series in watchlist when only specials are watched', async () => {
    const repository = createLibraryRepository(createMemoryTable());

    const entry = await repository.setTvProgress({
      mediaType: 'tv',
      tmdbId: 23,
      seasons: [
        { seasonNumber: 0, episodeCount: 2 },
        { seasonNumber: 1, episodeCount: 2 }
      ],
      watchedEpisodes: ['0:1'],
      now: '2026-08-23T11:00:00.000Z'
    });

    expect(entry.status).toBe('watchlist');
    expect(entry.watchedAt).toBeUndefined();
  });

  it('deduplicates watched episodes in tv progress', async () => {
    const repository = createLibraryRepository(createMemoryTable());

    const entry = await repository.setTvProgress({
      mediaType: 'tv',
      tmdbId: 24,
      seasons: [{ seasonNumber: 1, episodeCount: 2 }],
      watchedEpisodes: ['1:2', '1:2', '1:1'],
      now: '2026-08-23T11:00:00.000Z'
    });

    expect(entry.tvProgress?.watchedEpisodes).toEqual(['1:1', '1:2']);
  });

  it('stores a single logical update for a bulk season change', async () => {
    const table = createMemoryTable();
    const repository = createLibraryRepository(table);
    const watchedEpisodes = createFullRegularWatchedEpisodes([
      { seasonNumber: 1, episodeCount: 3 }
    ]);

    const entry = await repository.setTvProgress({
      mediaType: 'tv',
      tmdbId: 25,
      seasons: [{ seasonNumber: 1, episodeCount: 3 }],
      watchedEpisodes,
      now: '2026-08-23T11:00:00.000Z'
    });

    expect(table.records.size).toBe(1);
    expect(entry.tvProgress?.watchedEpisodes).toEqual([
      createEpisodeKey(1, 1),
      createEpisodeKey(1, 2),
      createEpisodeKey(1, 3)
    ]);
    expect(entry.status).toBe('watched');
  });
});
