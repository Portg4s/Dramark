import type { CatalogPage } from '@/features/catalog/types';
import { discoverVikiFrancePage } from '@/services/tmdb/discover';
import { mapTmdbMovieToCatalogMedia, mapTmdbTvToCatalogMedia } from '@/services/tmdb/mediaMapper';
import { tmdbClient } from '@/services/tmdb/client';
import type { TmdbClient } from '@/services/tmdb/client';
import type { MediaType } from '@/types/media';

type TmdbRequester = Pick<TmdbClient, 'request'>;

export type LoadVikiCatalogPageParams = {
  mediaType: MediaType;
  providerId: number;
  page?: number;
  client?: TmdbRequester;
};

export async function loadVikiCatalogPage({
  mediaType,
  providerId,
  page = 1,
  client = tmdbClient
}: LoadVikiCatalogPageParams): Promise<CatalogPage> {
  const response = await discoverVikiFrancePage(client, mediaType, providerId, page);
  const results = response.results ?? [];

  return {
    mediaType,
    providerId,
    page: response.page ?? page,
    totalPages: response.total_pages ?? 0,
    totalResults: response.total_results ?? 0,
    results:
      mediaType === 'movie'
        ? results.map((result) => mapTmdbMovieToCatalogMedia(result))
        : results.map((result) => mapTmdbTvToCatalogMedia(result))
  };
}
