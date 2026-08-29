import { useQueries } from '@tanstack/react-query';

import type { CatalogMedia, MediaDetails } from '@/features/catalog/types';
import { useLibraryEntries } from '@/features/library/hooks';
import { getEffectiveWatchedEpisodes } from '@/features/media/tvProgress';
import { mediaDetailQueryKeys } from '@/features/media/hooks';
import { tmdbClient } from '@/services/tmdb/client';
import { tmdbRuntimeConfig } from '@/services/tmdb/config';
import { getMediaDetails } from '@/services/tmdb/details';
import type { LibraryEntryRecord, TvSeasonProgressMeta } from '@/types/media';

export type CalendarTimelineItem = {
  id: string;
  mediaType: 'tv';
  tmdbId: number;
  title: string;
  posterPath?: string;
  airDate: string;
  episodeCode: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeName?: string;
  providerLabel?: string;
  seasons: TvSeasonProgressMeta[];
  watchedEpisodes: string[];
  media: CatalogMedia;
};

function formatEpisodeCode(details: MediaDetails): string | undefined {
  const episode = details.nextEpisodeToAir;

  if (!episode) {
    return undefined;
  }

  return `S${episode.seasonNumber}E${episode.episodeNumber}`;
}

function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildProgressSeasons(
  details: MediaDetails,
  entry: LibraryEntryRecord
): TvSeasonProgressMeta[] {
  const seasonsByNumber = new Map<number, TvSeasonProgressMeta>();

  entry.tvProgress?.seasons.forEach((season) => {
    seasonsByNumber.set(season.seasonNumber, season);
  });

  details.seasons.forEach((season) => {
    const current = seasonsByNumber.get(season.seasonNumber);
    seasonsByNumber.set(season.seasonNumber, {
      seasonNumber: season.seasonNumber,
      episodeCount: Math.max(current?.episodeCount ?? 0, season.episodeCount)
    });
  });

  const nextEpisode = details.nextEpisodeToAir;

  if (nextEpisode) {
    const current = seasonsByNumber.get(nextEpisode.seasonNumber);
    seasonsByNumber.set(nextEpisode.seasonNumber, {
      seasonNumber: nextEpisode.seasonNumber,
      episodeCount: Math.max(current?.episodeCount ?? 0, nextEpisode.episodeNumber)
    });
  }

  return Array.from(seasonsByNumber.values()).sort(
    (first, second) => first.seasonNumber - second.seasonNumber
  );
}

function mapDetailsToTimelineItem(
  details: MediaDetails,
  entry: LibraryEntryRecord
): CalendarTimelineItem | undefined {
  const episode = details.nextEpisodeToAir;
  const episodeCode = formatEpisodeCode(details);

  if (!episode?.airDate || !episodeCode || episode.airDate < getTodayIsoDate()) {
    return undefined;
  }

  const seasons = buildProgressSeasons(details, entry);

  return {
    id: `${details.mediaType}:${details.tmdbId}:${episode.seasonNumber}:${episode.episodeNumber}`,
    mediaType: 'tv',
    tmdbId: details.tmdbId,
    title: details.title,
    posterPath: details.posterPath,
    airDate: episode.airDate,
    episodeCode,
    seasonNumber: episode.seasonNumber,
    episodeNumber: episode.episodeNumber,
    episodeName: episode.name,
    providerLabel: details.networks[0],
    seasons,
    watchedEpisodes: getEffectiveWatchedEpisodes(entry, seasons),
    media: {
      mediaType: 'tv',
      tmdbId: details.tmdbId,
      title: details.title,
      posterPath: details.posterPath,
      releaseYear: details.releaseYear,
      originCountries: details.originCountries,
      voteAverage: details.voteAverage
    }
  };
}

export function useCalendarTimeline() {
  const watchlist = useLibraryEntries('watchlist');
  const tvEntries = (watchlist.data ?? []).filter((entry) => entry.mediaType === 'tv');
  const detailsQueries = useQueries({
    queries: tvEntries.map((entry) => ({
      queryKey: mediaDetailQueryKeys.detail('tv', entry.tmdbId),
      queryFn: () => getMediaDetails(tmdbClient, 'tv', entry.tmdbId),
      enabled: tmdbRuntimeConfig.isConfigured,
      staleTime: 1000 * 60 * 60,
      gcTime: 1000 * 60 * 90,
      retry: 1
    }))
  });

  const items = detailsQueries
    .map((query, index) => {
      const entry = tvEntries[index];

      if (!query.data || !entry) {
        return undefined;
      }

      return mapDetailsToTimelineItem(query.data, entry);
    })
    .filter((item): item is CalendarTimelineItem => Boolean(item))
    .sort((first, second) => first.airDate.localeCompare(second.airDate));

  return {
    items,
    isLoading: watchlist.isLoading || detailsQueries.some((query) => query.isLoading)
  };
}
