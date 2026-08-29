import { describe, expect, it } from 'vitest';

import { getLibraryStats } from '@/features/library/stats';
import type { LibraryEntryRecord } from '@/types/media';

function entry(overrides: Partial<LibraryEntryRecord>): LibraryEntryRecord {
  return {
    id: `${overrides.mediaType ?? 'tv'}:${overrides.tmdbId ?? 1}`,
    mediaType: 'tv',
    tmdbId: 1,
    status: 'watchlist',
    addedAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
    snapshot: { title: 'Test' },
    ...overrides
  };
}

describe('getLibraryStats', () => {
  it('summarizes local library progress and unlocked achievements', () => {
    const stats = getLibraryStats([
      entry({
        id: 'tv:1',
        mediaType: 'tv',
        tmdbId: 1,
        status: 'watchlist',
        tvProgress: {
          watchedEpisodes: ['1:1', '1:2'],
          seasons: [{ seasonNumber: 1, episodeCount: 10 }],
          updatedAt: '2026-08-24T12:00:00.000Z'
        }
      }),
      entry({
        id: 'tv:2',
        mediaType: 'tv',
        tmdbId: 2,
        status: 'watched',
        tvProgress: {
          watchedEpisodes: ['1:1', '1:2', '1:3'],
          seasons: [{ seasonNumber: 1, episodeCount: 3 }],
          updatedAt: '2026-08-25T12:00:00.000Z'
        }
      }),
      entry({ id: 'movie:3', mediaType: 'movie', tmdbId: 3, status: 'watched' })
    ]);

    expect(stats).toMatchObject({
      totalTitles: 3,
      watchedTitles: 2,
      watchedMovies: 1,
      watchedSeries: 1,
      inProgressSeries: 1,
      watchedEpisodes: 5
    });
    expect(stats.achievements.map((achievement) => achievement.label)).toEqual([
      'Collection lancée',
      'Premier titre vu',
      'Série terminée'
    ]);
  });
});
