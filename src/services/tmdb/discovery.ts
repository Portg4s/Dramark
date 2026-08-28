import type { CatalogMedia } from '@/features/catalog/types';
import type { TmdbClient } from '@/services/tmdb/client';
import {
  mapTmdbMovieToCatalogMedia,
  mapTmdbSearchResultToCatalogMedia,
  mapTmdbTvToCatalogMedia
} from '@/services/tmdb/mediaMapper';
import type {
  TmdbDiscoverResponse,
  TmdbMovieDiscoverResult,
  TmdbMultiSearchResponse,
  TmdbTvDiscoverResult
} from '@/services/tmdb/types';

export type TmdbMediaDiscoveryPage = {
  page: number;
  results: CatalogMedia[];
  totalPages: number;
  totalResults: number;
};

export type DiscoveryFilterKey =
  'all' | 'movie' | 'tv' | 'k-drama' | 'j-drama' | 'c-drama' | 'thai-drama' | 'anime';

export type DiscoverySortKey = 'trending' | 'top-rated' | 'recent';

type TmdbDiscoverMediaType = Extract<DiscoveryFilterKey, 'movie' | 'tv'>;

type DiscoveryFilterConfig = {
  key: DiscoveryFilterKey;
  label: string;
  mediaType?: TmdbDiscoverMediaType;
  quick?: boolean;
  params?: Record<string, string | number | boolean>;
};

const ANIMATION_GENRE_ID = 16;
const TRENDING_MIN_VOTE_COUNT = 20;
const TOP_RATED_MIN_VOTE_COUNT = 200;
const DEFAULT_DISCOVERY_FILTER: DiscoveryFilterConfig = { key: 'all', label: 'Tout', quick: true };

export const discoverySorts: Array<{ key: DiscoverySortKey; label: string }> = [
  { key: 'trending', label: 'Tendances' },
  { key: 'top-rated', label: 'Mieux notés' },
  { key: 'recent', label: 'Plus récents' }
];

export const discoveryFilters: DiscoveryFilterConfig[] = [
  DEFAULT_DISCOVERY_FILTER,
  {
    key: 'k-drama',
    label: 'K-drama',
    mediaType: 'tv',
    params: {
      with_origin_country: 'KR',
      with_original_language: 'ko'
    }
  },
  {
    key: 'j-drama',
    label: 'J-drama',
    mediaType: 'tv',
    params: {
      with_origin_country: 'JP',
      with_original_language: 'ja',
      without_genres: ANIMATION_GENRE_ID
    }
  },
  {
    key: 'c-drama',
    label: 'C-drama',
    mediaType: 'tv',
    params: {
      with_origin_country: 'CN',
      with_original_language: 'zh'
    }
  },
  {
    key: 'thai-drama',
    label: 'Thai drama',
    mediaType: 'tv',
    params: {
      with_origin_country: 'TH',
      with_original_language: 'th'
    }
  },
  {
    key: 'anime',
    label: 'Anime',
    mediaType: 'tv',
    params: {
      with_genres: ANIMATION_GENRE_ID,
      with_origin_country: 'JP',
      with_original_language: 'ja'
    }
  },
  { key: 'movie', label: 'Films', mediaType: 'movie' },
  { key: 'tv', label: 'Séries', mediaType: 'tv' }
] as const;

function getDiscoveryFilterConfig(key: DiscoveryFilterKey): DiscoveryFilterConfig {
  return discoveryFilters.find((filter) => filter.key === key) ?? DEFAULT_DISCOVERY_FILTER;
}

function mapDiscoverResults(
  mediaType: TmdbDiscoverMediaType,
  results: TmdbDiscoverResponse['results']
): CatalogMedia[] {
  if (mediaType === 'movie') {
    return (results ?? []).map((result) =>
      mapTmdbMovieToCatalogMedia(result as TmdbMovieDiscoverResult)
    );
  }

  return (results ?? []).map((result) => mapTmdbTvToCatalogMedia(result as TmdbTvDiscoverResult));
}

function getIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getSortParams(
  mediaType: TmdbDiscoverMediaType,
  sortKey: DiscoverySortKey,
  date = new Date()
): Record<string, string | number | boolean> {
  if (sortKey === 'top-rated') {
    return {
      sort_by: 'vote_average.desc',
      'vote_count.gte': TOP_RATED_MIN_VOTE_COUNT
    };
  }

  if (sortKey === 'recent') {
    return {
      sort_by: mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc',
      'vote_count.gte': TRENDING_MIN_VOTE_COUNT,
      [mediaType === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte']: getIsoDate(date)
    };
  }

  return {
    sort_by: 'popularity.desc',
    'vote_count.gte': TRENDING_MIN_VOTE_COUNT
  };
}

async function getDiscoverMediaByType(
  client: TmdbClient,
  mediaType: TmdbDiscoverMediaType,
  sortKey: DiscoverySortKey,
  page: number,
  params: Record<string, string | number | boolean> = {}
): Promise<TmdbMediaDiscoveryPage> {
  const response = await client.request<TmdbDiscoverResponse>(`/discover/${mediaType}`, {
    page,
    include_adult: false,
    ...getSortParams(mediaType, sortKey),
    ...params
  });

  return {
    page: response.page ?? page,
    totalPages: response.total_pages ?? 0,
    totalResults: response.total_results ?? 0,
    results: mapDiscoverResults(mediaType, response.results)
  };
}

function sortMixedDiscoveryResults(
  results: CatalogMedia[],
  sortKey: DiscoverySortKey
): CatalogMedia[] {
  if (sortKey === 'top-rated') {
    return [...results].sort((left, right) => (right.voteAverage ?? 0) - (left.voteAverage ?? 0));
  }

  if (sortKey === 'recent') {
    return [...results].sort(
      (left, right) =>
        new Date(right.releaseDate ?? '').getTime() - new Date(left.releaseDate ?? '').getTime()
    );
  }

  return results;
}

export async function getTrendingMoviesAndTv(
  client: TmdbClient,
  page = 1
): Promise<TmdbMediaDiscoveryPage> {
  const response = await client.request<TmdbMultiSearchResponse>('/trending/all/week', {
    page,
    include_adult: false
  });

  return {
    page: response.page,
    totalPages: response.total_pages,
    totalResults: response.total_results,
    results: response.results
      .map((result) => mapTmdbSearchResultToCatalogMedia(result))
      .filter((result): result is CatalogMedia => result !== undefined)
  };
}

export async function getDiscoveryMedia(
  client: TmdbClient,
  filterKey: DiscoveryFilterKey = 'all',
  sortKey: DiscoverySortKey = 'trending',
  page = 1
): Promise<TmdbMediaDiscoveryPage> {
  const filter = getDiscoveryFilterConfig(filterKey);

  if (!filter.mediaType) {
    if (sortKey === 'trending') {
      return getTrendingMoviesAndTv(client, page);
    }

    const [movies, tvShows] = await Promise.all([
      getDiscoverMediaByType(client, 'movie', sortKey, page),
      getDiscoverMediaByType(client, 'tv', sortKey, page)
    ]);

    return {
      page,
      totalPages: Math.max(movies.totalPages, tvShows.totalPages),
      totalResults: movies.totalResults + tvShows.totalResults,
      results: sortMixedDiscoveryResults([...movies.results, ...tvShows.results], sortKey)
    };
  }

  return getDiscoverMediaByType(client, filter.mediaType, sortKey, page, filter.params);
}
