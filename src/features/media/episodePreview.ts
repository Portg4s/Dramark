import type { TvEpisode } from '@/features/catalog/types';
import type { EpisodePosition } from '@/features/media/tvProgress';

export function getEpisodePreview(
  episodes: TvEpisode[],
  nextEpisode: EpisodePosition | undefined,
  maxVisible = 6
): TvEpisode[] {
  if (episodes.length <= maxVisible) {
    return episodes;
  }

  const nextEpisodeIndex = nextEpisode
    ? episodes.findIndex(
        (episode) =>
          episode.seasonNumber === nextEpisode.seasonNumber &&
          episode.episodeNumber === nextEpisode.episodeNumber
      )
    : -1;

  if (nextEpisodeIndex < 0) {
    return episodes.slice(0, maxVisible);
  }

  const maxStart = episodes.length - maxVisible;
  const start = Math.min(Math.max(nextEpisodeIndex - Math.floor(maxVisible / 2), 0), maxStart);

  return episodes.slice(start, start + maxVisible);
}
