import type { TvEpisode } from '@/features/catalog/types';
import { createEpisodeKey } from '@/features/media/tvProgress';

export function getEpisodeProgressSlot(episodes: TvEpisode[], episode: TvEpisode): number {
  const episodeIndex = episodes.findIndex(
    (candidate) =>
      candidate.seasonNumber === episode.seasonNumber &&
      candidate.episodeNumber === episode.episodeNumber
  );

  return episodeIndex >= 0 ? episodeIndex + 1 : episode.episodeNumber;
}

export function createEpisodeProgressKey(episodes: TvEpisode[], episode: TvEpisode): string {
  return createEpisodeKey(episode.seasonNumber, getEpisodeProgressSlot(episodes, episode));
}

export function getEpisodeByProgressSlot(
  episodes: TvEpisode[],
  seasonNumber: number,
  progressSlot: number
): TvEpisode | undefined {
  return episodes.filter((episode) => episode.seasonNumber === seasonNumber)[progressSlot - 1];
}
