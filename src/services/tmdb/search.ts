import type { CatalogMedia } from '@/features/catalog/types';
import type { TmdbClient } from '@/services/tmdb/client';
import { mapTmdbSearchResultToCatalogMedia } from '@/services/tmdb/mediaMapper';
import type { TmdbMultiSearchResponse, TmdbMultiSearchResult } from '@/services/tmdb/types';

export type TmdbMediaSearchPage = {
  page: number;
  results: CatalogMedia[];
  totalPages: number;
  totalResults: number;
};

export function keepCatalogSearchResult(result: TmdbMultiSearchResult): boolean {
  return result.media_type === 'movie' || result.media_type === 'tv';
}

export async function searchMoviesAndTv(
  client: TmdbClient,
  query: string,
  page = 1
): Promise<TmdbMediaSearchPage> {
  const response = await client.request<TmdbMultiSearchResponse>('/search/multi', {
    query,
    page,
    include_adult: false
  });

  return {
    page: response.page,
    totalPages: response.total_pages,
    totalResults: response.total_results,
    results: response.results
      .filter(keepCatalogSearchResult)
      .map((result) => mapTmdbSearchResultToCatalogMedia(result))
      .filter((result): result is CatalogMedia => result !== undefined)
  };
}
