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

export type TmdbGenre = {
  id: number;
  name?: string | null;
};

export type TmdbProductionCountry = {
  iso_3166_1?: string | null;
  name?: string | null;
};

export type TmdbNamedEntity = {
  id: number;
  name?: string | null;
};

export type TmdbCreditCast = {
  id: number;
  name?: string | null;
  character?: string | null;
  profile_path?: string | null;
  order?: number | null;
};

export type TmdbCreditCrew = {
  id: number;
  name?: string | null;
  job?: string | null;
  department?: string | null;
};

export type TmdbAggregateCast = {
  id: number;
  name?: string | null;
  profile_path?: string | null;
  order?: number | null;
  roles?: Array<{ character?: string | null; episode_count?: number | null }> | null;
};

export type TmdbCreditsResponse = {
  cast?: TmdbCreditCast[] | null;
  crew?: TmdbCreditCrew[] | null;
};

export type TmdbAggregateCreditsResponse = {
  cast?: TmdbAggregateCast[] | null;
};

export type TmdbMovieDetailsResponse = TmdbDiscoverResultBase & {
  title?: string | null;
  original_title?: string | null;
  release_date?: string | null;
  runtime?: number | null;
  genres?: TmdbGenre[] | null;
  production_countries?: TmdbProductionCountry[] | null;
  vote_count?: number | null;
  credits?: TmdbCreditsResponse | null;
};

export type TmdbTvDetailsResponse = TmdbDiscoverResultBase & {
  name?: string | null;
  original_name?: string | null;
  first_air_date?: string | null;
  episode_run_time?: number[] | null;
  number_of_episodes?: number | null;
  number_of_seasons?: number | null;
  status?: string | null;
  genres?: TmdbGenre[] | null;
  origin_country?: string[] | null;
  created_by?: TmdbNamedEntity[] | null;
  networks?: TmdbNamedEntity[] | null;
  vote_count?: number | null;
  aggregate_credits?: TmdbAggregateCreditsResponse | null;
  credits?: TmdbCreditsResponse | null;
};

export type TmdbCatalogSearchResponse = {
  page: number;
  results: TmdbMultiSearchResult[];
  total_pages: number;
  total_results: number;
};

export type TmdbSearchableMediaType = Extract<MediaType, 'movie' | 'tv'>;
