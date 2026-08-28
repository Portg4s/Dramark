import { useQuery } from '@tanstack/react-query';

import { tmdbClient } from '@/services/tmdb/client';
import { tmdbRuntimeConfig } from '@/services/tmdb/config';
import {
  getDiscoveryMedia,
  type DiscoveryFilterKey,
  type DiscoverySortKey
} from '@/services/tmdb/discovery';

export const discoveryQueryKeys = {
  all: ['discovery'] as const,
  media: (filterKey: DiscoveryFilterKey, sortKey: DiscoverySortKey) =>
    [...discoveryQueryKeys.all, 'media', filterKey, sortKey] as const
};

export function useDiscoveryMedia(
  filterKey: DiscoveryFilterKey = 'all',
  sortKey: DiscoverySortKey = 'trending'
) {
  return useQuery({
    queryKey: discoveryQueryKeys.media(filterKey, sortKey),
    queryFn: () => getDiscoveryMedia(tmdbClient, filterKey, sortKey),
    enabled: tmdbRuntimeConfig.isConfigured,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 6,
    retry: 1
  });
}

export function useTrendingMedia() {
  return useDiscoveryMedia('all', 'trending');
}
