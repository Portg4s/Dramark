import { describe, expect, it } from 'vitest';

import {
  createEpisodeKey,
  createFullRegularWatchedEpisodes,
  createTvProgress,
  getEffectiveWatchedEpisodes,
  getNextEpisode,
  getTotalEpisodeCount,
  getTvViewingState,
  getWatchedEpisodeCount,
  normalizeWatchedEpisodes
} from '@/features/media/tvProgress';
import type { LibraryEntryRecord, TvSeasonProgressMeta } from '@/types/media';

const seasons: TvSeasonProgressMeta[] = [
  { seasonNumber: 0, episodeCount: 2 },
  { seasonNumber: 1, episodeCount: 3 },
  { seasonNumber: 2, episodeCount: 1 }
];

function tvEntry(watchedEpisodes: string[], status: LibraryEntryRecord['status'] = 'watchlist') {
  return {
    id: 'tv:7',
    mediaType: 'tv',
    tmdbId: 7,
    status,
    addedAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
    tvProgress: createTvProgress(watchedEpisodes, seasons, '2026-08-24T10:00:00.000Z')
  } satisfies LibraryEntryRecord;
}

describe('tvProgress helpers', () => {
  it('creates stable episode keys', () => {
    expect(createEpisodeKey(1, 2)).toBe('1:2');
  });

  it('derives watchlist, in-progress and watched states', () => {
    expect(getTvViewingState(tvEntry([]), seasons)).toBe('not_started');
    expect(getTvViewingState(tvEntry(['1:1']), seasons)).toBe('in_progress');
    expect(getTvViewingState(tvEntry(['1:1', '1:2', '1:3', '2:1']), seasons)).toBe('watched');
  });

  it('excludes season 0 from completion and counters', () => {
    const entry = tvEntry(['0:1', '0:2']);

    expect(getTotalEpisodeCount(seasons)).toBe(4);
    expect(getWatchedEpisodeCount(entry, seasons)).toBe(0);
    expect(getTvViewingState(entry, seasons)).toBe('not_started');
  });

  it('treats legacy watched TV without tvProgress as complete in memory', () => {
    const entry: LibraryEntryRecord = {
      id: 'tv:7',
      mediaType: 'tv',
      tmdbId: 7,
      status: 'watched',
      addedAt: '2026-08-24T10:00:00.000Z',
      updatedAt: '2026-08-24T10:00:00.000Z',
      watchedAt: '2026-08-24T10:00:00.000Z'
    };

    expect(getTvViewingState(entry, seasons)).toBe('watched');
    expect(getEffectiveWatchedEpisodes(entry, seasons)).toEqual(['1:1', '1:2', '1:3', '2:1']);
  });

  it('deduplicates and normalizes watched episodes', () => {
    expect(normalizeWatchedEpisodes(['1:2', '1:2', 'bad', '0:1', '9:1'], seasons)).toEqual([
      '0:1',
      '1:2'
    ]);
  });

  it('finds the first real gap as the next episode', () => {
    expect(getNextEpisode(tvEntry(['1:1', '1:3']), seasons)).toEqual({
      seasonNumber: 1,
      episodeNumber: 2
    });
  });

  it('supports bulk season watched keys', () => {
    expect(createFullRegularWatchedEpisodes([{ seasonNumber: 1, episodeCount: 2 }])).toEqual([
      '1:1',
      '1:2'
    ]);
  });

  it('moves a complete series back to in-progress when one regular episode is removed', () => {
    const entry = tvEntry(['1:1', '1:3', '2:1']);

    expect(getTvViewingState(entry, seasons)).toBe('in_progress');
    expect(getNextEpisode(entry, seasons)).toEqual({ seasonNumber: 1, episodeNumber: 2 });
  });
});
