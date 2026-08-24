import type { LibraryEntryRecord, TvProgress, TvSeasonProgressMeta } from '@/types/media';

export type TvViewingState = 'not_started' | 'in_progress' | 'watched';

export type EpisodePosition = {
  seasonNumber: number;
  episodeNumber: number;
};

export function createEpisodeKey(seasonNumber: number, episodeNumber: number): string {
  return `${seasonNumber}:${episodeNumber}`;
}

export function parseEpisodeKey(key: string): EpisodePosition | undefined {
  const match = key.match(/^(\d+):(\d+)$/);

  if (!match) {
    return undefined;
  }

  const seasonNumber = Number(match[1]);
  const episodeNumber = Number(match[2]);

  if (!Number.isInteger(seasonNumber) || !Number.isInteger(episodeNumber) || episodeNumber < 1) {
    return undefined;
  }

  return { seasonNumber, episodeNumber };
}

export function getRegularSeasons<TSeason extends TvSeasonProgressMeta>(
  seasons: TSeason[]
): TSeason[] {
  return seasons.filter((season) => season.seasonNumber > 0 && season.episodeCount > 0);
}

export function getTotalEpisodeCount(seasons: TvSeasonProgressMeta[]): number {
  return getRegularSeasons(seasons).reduce((total, season) => total + season.episodeCount, 0);
}

function compareEpisodeKeys(firstKey: string, secondKey: string): number {
  const first = parseEpisodeKey(firstKey);
  const second = parseEpisodeKey(secondKey);

  if (!first || !second) {
    return firstKey.localeCompare(secondKey);
  }

  return first.seasonNumber - second.seasonNumber || first.episodeNumber - second.episodeNumber;
}

function getKnownEpisodeKeys(seasons: TvSeasonProgressMeta[]): Set<string> {
  const keys = new Set<string>();

  seasons.forEach((season) => {
    for (let episodeNumber = 1; episodeNumber <= season.episodeCount; episodeNumber += 1) {
      keys.add(createEpisodeKey(season.seasonNumber, episodeNumber));
    }
  });

  return keys;
}

export function getRegularEpisodeKeys(seasons: TvSeasonProgressMeta[]): string[] {
  return Array.from(getKnownEpisodeKeys(getRegularSeasons(seasons))).sort(compareEpisodeKeys);
}

export function normalizeWatchedEpisodes(
  watchedEpisodes: string[],
  seasons?: TvSeasonProgressMeta[]
): string[] {
  const knownKeys = seasons ? getKnownEpisodeKeys(seasons) : undefined;
  const keys = new Set<string>();

  watchedEpisodes.forEach((key) => {
    const position = parseEpisodeKey(key);

    if (!position) {
      return;
    }

    const normalizedKey = createEpisodeKey(position.seasonNumber, position.episodeNumber);

    if (knownKeys && !knownKeys.has(normalizedKey)) {
      return;
    }

    keys.add(normalizedKey);
  });

  return Array.from(keys).sort(compareEpisodeKeys);
}

export function createFullRegularWatchedEpisodes(seasons: TvSeasonProgressMeta[]): string[] {
  return getRegularEpisodeKeys(seasons);
}

export function createTvProgress(
  watchedEpisodes: string[],
  seasons: TvSeasonProgressMeta[],
  updatedAt: string
): TvProgress {
  return {
    watchedEpisodes: normalizeWatchedEpisodes(watchedEpisodes, seasons),
    seasons: [...seasons].sort((first, second) => first.seasonNumber - second.seasonNumber),
    updatedAt
  };
}

export function getEffectiveWatchedEpisodes(
  entry: LibraryEntryRecord | undefined,
  seasons: TvSeasonProgressMeta[]
): string[] {
  if (!entry) {
    return [];
  }

  if (entry.tvProgress) {
    return normalizeWatchedEpisodes(entry.tvProgress.watchedEpisodes, seasons);
  }

  if (entry.mediaType === 'tv' && entry.status === 'watched') {
    return createFullRegularWatchedEpisodes(seasons);
  }

  return [];
}

export function getWatchedEpisodeCount(
  entry: LibraryEntryRecord | undefined,
  seasons: TvSeasonProgressMeta[]
): number {
  const regularKeys = new Set(getRegularEpisodeKeys(seasons));

  return getEffectiveWatchedEpisodes(entry, seasons).filter((key) => regularKeys.has(key)).length;
}

export function isSeriesComplete(
  entry: LibraryEntryRecord | undefined,
  seasons: TvSeasonProgressMeta[]
): boolean {
  if (entry?.mediaType === 'tv' && entry.status === 'watched' && !entry.tvProgress) {
    return true;
  }

  const total = getTotalEpisodeCount(seasons);

  return total > 0 && getWatchedEpisodeCount(entry, seasons) >= total;
}

export function getTvViewingState(
  entry: LibraryEntryRecord | undefined,
  seasons: TvSeasonProgressMeta[]
): TvViewingState {
  if (isSeriesComplete(entry, seasons)) {
    return 'watched';
  }

  return getWatchedEpisodeCount(entry, seasons) > 0 ? 'in_progress' : 'not_started';
}

export function getProgressRatio(
  entry: LibraryEntryRecord | undefined,
  seasons: TvSeasonProgressMeta[]
): number {
  const total = getTotalEpisodeCount(seasons);

  if (total === 0) {
    return isSeriesComplete(entry, seasons) ? 1 : 0;
  }

  return Math.min(getWatchedEpisodeCount(entry, seasons) / total, 1);
}

export function getNextEpisode(
  entry: LibraryEntryRecord | undefined,
  seasons: TvSeasonProgressMeta[]
): EpisodePosition | undefined {
  const watched = new Set(getEffectiveWatchedEpisodes(entry, seasons));

  for (const season of getRegularSeasons(seasons)) {
    for (let episodeNumber = 1; episodeNumber <= season.episodeCount; episodeNumber += 1) {
      if (!watched.has(createEpisodeKey(season.seasonNumber, episodeNumber))) {
        return { seasonNumber: season.seasonNumber, episodeNumber };
      }
    }
  }

  return undefined;
}

export function getDefaultSeasonNumber(
  entry: LibraryEntryRecord | undefined,
  seasons: TvSeasonProgressMeta[]
): number | undefined {
  const nextEpisode = getNextEpisode(entry, seasons);

  if (nextEpisode) {
    return nextEpisode.seasonNumber;
  }

  return getRegularSeasons(seasons)[0]?.seasonNumber ?? seasons[0]?.seasonNumber;
}

export function hasPartialRegularProgress(entry: LibraryEntryRecord): boolean {
  if (entry.mediaType !== 'tv' || !entry.tvProgress) {
    return false;
  }

  const total = getTotalEpisodeCount(entry.tvProgress.seasons);
  const watched = getWatchedEpisodeCount(entry, entry.tvProgress.seasons);

  return watched > 0 && watched < total;
}
