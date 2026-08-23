import type { MediaType } from '@/types/media';

export type TmdbDiscoverResultBase = {
  id: number;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  original_language?: string | null;
  vote_average?: number | null;
  popularity?: number | null;
};

export type TmdbMovieDiscoverResult = TmdbDiscoverResultBase & {
  title?: string | null;
  original_title?: string | null;
  release_date?: string | null;
  origin_country?: string[] | null;
};

export type TmdbTvDiscoverResult = TmdbDiscoverResultBase & {
  name?: string | null;
  original_name?: string | null;
  first_air_date?: string | null;
  origin_country?: string[] | null;
};

export type TmdbDiscoverResult = TmdbMovieDiscoverResult | TmdbTvDiscoverResult;

export type TmdbDiscoverResponse<TResult extends TmdbDiscoverResult = TmdbDiscoverResult> = {
  page?: number;
  results?: TResult[];
  total_pages?: number;
  total_results?: number;
};

export type TmdbMovieSearchResult = TmdbMovieDiscoverResult & {
  media_type: 'movie';
};

export type TmdbTvSearchResult = TmdbTvDiscoverResult & {
  media_type: 'tv';
};

export type TmdbPersonSearchResult = {
  id: number;
  media_type: 'person';
};

export type TmdbMultiSearchResult =
  TmdbMovieSearchResult | TmdbTvSearchResult | TmdbPersonSearchResult;

export type TmdbMultiSearchResponse = {
  page: number;
  results: TmdbMultiSearchResult[];
  total_pages: number;
  total_results: number;
};

export type TmdbCatalogSearchResponse = {
  page: number;
  results: TmdbMultiSearchResult[];
  total_pages: number;
  total_results: number;
};

export type TmdbSearchableMediaType = Extract<MediaType, 'movie' | 'tv'>;
