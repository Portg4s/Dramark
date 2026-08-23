import type { TmdbClient } from '@/services/tmdb/client';
import type { TmdbMultiSearchResponse, TmdbMultiSearchResult } from '@/services/tmdb/types';

export function keepCatalogSearchResult(result: TmdbMultiSearchResult): boolean {
  return result.media_type === 'movie' || result.media_type === 'tv';
}

export async function searchMoviesAndTv(client: TmdbClient, query: string, page = 1) {
  const response = await client.request<TmdbMultiSearchResponse>('/search/multi', {
    query,
    page,
    include_adult: false
  });

  return {
    ...response,
    results: response.results.filter(keepCatalogSearchResult)
  };
}
