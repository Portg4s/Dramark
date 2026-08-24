import { describe, expect, it } from 'vitest';

import type { TvEpisode } from '@/features/catalog/types';
import {
  createEpisodeProgressKey,
  getEpisodeByProgressSlot,
  getEpisodeProgressSlot
} from '@/features/media/episodeSlots';
import { createTvProgress } from '@/features/media/tvProgress';

function makeSeasonEpisodes(
  seasonNumber: number,
  firstEpisodeNumber: number,
  count: number
): TvEpisode[] {
  return Array.from({ length: count }, (_, index) => {
    const episodeNumber = firstEpisodeNumber + index;

    return {
      tmdbId: seasonNumber * 1000 + episodeNumber,
      seasonNumber,
      episodeNumber,
      name: `Episode ${episodeNumber}`
    };
  });
}

describe('episode progress slots', () => {
  it('maps classic episode numbers to matching progress keys', () => {
    const episodes = makeSeasonEpisodes(2, 1, 3);

    expect(episodes.map((episode) => createEpisodeProgressKey(episodes, episode))).toEqual([
      '2:1',
      '2:2',
      '2:3'
    ]);
  });

  it('maps continuous TMDB episode numbers to local progress slots', () => {
    const episodes = makeSeasonEpisodes(2, 53, 3);

    expect(episodes.map((episode) => getEpisodeProgressSlot(episodes, episode))).toEqual([1, 2, 3]);
    expect(episodes.map((episode) => createEpisodeProgressKey(episodes, episode))).toEqual([
      '2:1',
      '2:2',
      '2:3'
    ]);
  });

  it('creates valid bulk keys for a continuous 52 episode season', () => {
    const episodes = makeSeasonEpisodes(2, 53, 52);
    const watchedEpisodes = episodes.map((episode) => createEpisodeProgressKey(episodes, episode));

    expect(watchedEpisodes).toHaveLength(52);
    expect(watchedEpisodes).toContain('2:52');
    expect(
      createTvProgress(
        watchedEpisodes,
        [{ seasonNumber: 2, episodeCount: 52 }],
        '2026-08-24T10:00:00.000Z'
      ).watchedEpisodes
    ).toHaveLength(52);
  });

  it('resolves a local progress slot back to the TMDB episode number', () => {
    const episodes = makeSeasonEpisodes(2, 53, 3);

    expect(getEpisodeByProgressSlot(episodes, 2, 1)?.episodeNumber).toBe(53);
    expect(getEpisodeByProgressSlot(episodes, 2, 3)?.episodeNumber).toBe(55);
  });
});
