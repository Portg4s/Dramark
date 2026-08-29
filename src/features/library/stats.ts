import {
  getTotalEpisodeCount,
  getWatchedEpisodeCount,
  hasPartialRegularProgress
} from '@/features/media/tvProgress';
import type { LibraryEntryRecord } from '@/types/media';

export type LibraryAchievement = {
  key: string;
  label: string;
  detail: string;
  unlocked: boolean;
  progress: number;
  target: number;
};

export type LibraryStats = {
  totalTitles: number;
  watchlistTitles: number;
  watchedTitles: number;
  watchedMovies: number;
  watchedSeries: number;
  inProgressSeries: number;
  watchedEpisodes: number;
  knownEpisodes: number;
  achievements: LibraryAchievement[];
};

function buildAchievement(
  key: string,
  label: string,
  detail: string,
  progress: number,
  target: number
): LibraryAchievement {
  return {
    key,
    label,
    detail,
    progress,
    target,
    unlocked: progress >= target
  };
}

export function getLibraryStats(entries: LibraryEntryRecord[]): LibraryStats {
  const watchedMovies = entries.filter(
    (entry) => entry.mediaType === 'movie' && entry.status === 'watched'
  ).length;
  const watchedSeries = entries.filter(
    (entry) => entry.mediaType === 'tv' && entry.status === 'watched'
  ).length;
  const inProgressSeries = entries.filter(
    (entry) => entry.mediaType === 'tv' && hasPartialRegularProgress(entry)
  ).length;
  const watchedEpisodes = entries
    .filter((entry) => entry.mediaType === 'tv')
    .reduce(
      (total, entry) => total + getWatchedEpisodeCount(entry, entry.tvProgress?.seasons ?? []),
      0
    );
  const knownEpisodes = entries
    .filter((entry) => entry.mediaType === 'tv')
    .reduce((total, entry) => total + getTotalEpisodeCount(entry.tvProgress?.seasons ?? []), 0);
  const watchedTitles = watchedMovies + watchedSeries;
  const achievements = [
    buildAchievement(
      'collection-started',
      'Collection lancée',
      'Premier titre ajouté',
      entries.length,
      1
    ),
    buildAchievement('first-watched', 'Premier titre vu', 'Un titre terminé', watchedTitles, 1),
    buildAchievement(
      'series-complete',
      'Série terminée',
      'Une série marquée vue',
      watchedSeries,
      1
    ),
    buildAchievement('ten-episodes', '10 épisodes', 'Épisodes regardés', watchedEpisodes, 10),
    buildAchievement('hundred-episodes', '100 épisodes', 'Épisodes regardés', watchedEpisodes, 100),
    buildAchievement(
      'two-hundred-fifty-episodes',
      '250 épisodes',
      'Épisodes regardés',
      watchedEpisodes,
      250
    ),
    buildAchievement('five-movies', '5 films vus', 'Films terminés', watchedMovies, 5),
    buildAchievement('ten-movies', '10 films vus', 'Films terminés', watchedMovies, 10),
    buildAchievement('ten-series', '10 séries terminées', 'Séries marquées vues', watchedSeries, 10)
  ];

  return {
    totalTitles: entries.length,
    watchlistTitles: entries.filter((entry) => entry.status === 'watchlist').length,
    watchedTitles,
    watchedMovies,
    watchedSeries,
    inProgressSeries,
    watchedEpisodes,
    knownEpisodes,
    achievements: achievements.filter((achievement) => achievement.unlocked)
  };
}
