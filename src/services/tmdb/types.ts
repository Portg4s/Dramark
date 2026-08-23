import type { MediaType } from '@/types/media';

export type TmdbProvider = {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
  display_priority?: number;
};

export type TmdbWatchProvidersResponse = {
  results: TmdbProvider[];
};

export type TmdbMultiSearchResult = {
  id: number;
  media_type: MediaType | 'person';
  title?: string;
  name?: string;
  poster_path?: string | null;
  first_air_date?: string;
  release_date?: string;
};

export type TmdbMultiSearchResponse = {
  page: number;
  results: TmdbMultiSearchResult[];
  total_pages: number;
  total_results: number;
};
