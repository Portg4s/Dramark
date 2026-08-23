import { describe, expect, it } from 'vitest';

import { createLibraryRepository, type LibraryTable } from '@/db/libraryRepository';
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
});
