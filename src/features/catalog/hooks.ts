import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { loadVikiCatalogPage } from '@/features/catalog/catalogService';
import { catalogQueryKeys } from '@/features/catalog/queryKeys';
import type { CatalogMedia } from '@/features/catalog/types';
import { tmdbRuntimeConfig } from '@/services/tmdb/config';
import { tmdbClient } from '@/services/tmdb/client';
import { resolveRakutenVikiProviders } from '@/services/tmdb/watchProviders';
import type { MediaType } from '@/types/media';

const providerStaleTime = 1000 * 60 * 60 * 24;
const catalogStaleTime = 1000 * 60 * 30;

export function useRakutenVikiProviderResolution() {
  return useQuery({
    queryKey: catalogQueryKeys.vikiProviderResolution(),
    queryFn: () => resolveRakutenVikiProviders(tmdbClient),
    enabled: tmdbRuntimeConfig.isConfigured,
    staleTime: providerStaleTime,
    gcTime: providerStaleTime * 2,
    retry: 1
  });
}

export function useVikiCatalogRail(mediaType: MediaType, providerId: number | undefined, page = 1) {
  return useQuery({
    queryKey: catalogQueryKeys.vikiDiscoverPage(mediaType, providerId, page),
    queryFn: () => loadVikiCatalogPage({ mediaType, providerId: providerId!, page }),
    enabled: tmdbRuntimeConfig.isConfigured && providerId !== undefined,
    staleTime: catalogStaleTime,
    gcTime: catalogStaleTime * 2,
    retry: 1
  });
}

function createCatalogKey(media: CatalogMedia): string {
  return `${media.mediaType}:${media.tmdbId}`;
}

function mergePopularMedia(tvMedia: CatalogMedia[], movieMedia: CatalogMedia[]): CatalogMedia[] {
  const seen = new Set<string>();

  return [...tvMedia, ...movieMedia]
    .sort((left, right) => (right.popularity ?? 0) - (left.popularity ?? 0))
    .filter((media) => {
      const key = createCatalogKey(media);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

export function useVikiCatalogHome() {
  const providerResolution = useRakutenVikiProviderResolution();
  const providerIds = providerResolution.data?.providerIds;
  const tvRail = useVikiCatalogRail('tv', providerIds?.tv);
  const movieRail = useVikiCatalogRail('movie', providerIds?.movie);

  const popularMedia = useMemo(
    () => mergePopularMedia(tvRail.data?.results ?? [], movieRail.data?.results ?? []),
    [movieRail.data?.results, tvRail.data?.results]
  );

  const popularKeys = useMemo(() => new Set(popularMedia.map(createCatalogKey)), [popularMedia]);

  const tvMedia = useMemo(
    () =>
      tvRail.data?.results
        .filter((media) => !popularKeys.has(createCatalogKey(media)))
        .slice(0, 12) ?? [],
    [popularKeys, tvRail.data?.results]
  );

  const movieMedia = useMemo(
    () =>
      movieRail.data?.results
        .filter((media) => !popularKeys.has(createCatalogKey(media)))
        .slice(0, 12) ?? [],
    [movieRail.data?.results, popularKeys]
  );

  return {
    isTmdbConfigured: tmdbRuntimeConfig.isConfigured,
    providerResolution,
    tvRail,
    movieRail,
    popularMedia,
    tvMedia,
    movieMedia
  };
}
