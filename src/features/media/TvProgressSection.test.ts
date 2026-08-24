import { describe, expect, it } from 'vitest';

import type { TvEpisode } from '@/features/catalog/types';
import { getEpisodePreview } from '@/features/media/episodePreview';

function makeEpisodes(count: number): TvEpisode[] {
  return Array.from({ length: count }, (_, index) => {
    const episodeNumber = index + 1;

    return {
      tmdbId: episodeNumber,
      seasonNumber: 1,
      episodeNumber,
      name: `Episode ${episodeNumber}`
    };
  });
}

function episodeNumbers(episodes: TvEpisode[]): number[] {
  return episodes.map((episode) => episode.episodeNumber);
}

describe('getEpisodePreview', () => {
  it('keeps a short season complete', () => {
    expect(episodeNumbers(getEpisodePreview(makeEpisodes(6), undefined))).toEqual([
      1, 2, 3, 4, 5, 6
    ]);
  });

  it('shows the first six episodes without a next episode in the active season', () => {
    expect(episodeNumbers(getEpisodePreview(makeEpisodes(8), undefined))).toEqual([
      1, 2, 3, 4, 5, 6
    ]);
  });

  it('keeps the next episode visible for a long season', () => {
    expect(
      episodeNumbers(getEpisodePreview(makeEpisodes(22), { seasonNumber: 1, episodeNumber: 16 }))
    ).toEqual([13, 14, 15, 16, 17, 18]);
  });

  it('falls back to the first six episodes when the next episode is in another season', () => {
    expect(
      episodeNumbers(getEpisodePreview(makeEpisodes(22), { seasonNumber: 2, episodeNumber: 1 }))
    ).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
