import { useQuery } from '@tanstack/react-query';

import { tmdbClient } from '@/services/tmdb/client';
import { tmdbRuntimeConfig } from '@/services/tmdb/config';
import { getMediaDetails } from '@/services/tmdb/details';
import type { MediaType } from '@/types/media';

export const mediaDetailQueryKeys = {
  all: ['media-details'] as const,
  detail: (mediaType: MediaType, tmdbId: number) =>
    [...mediaDetailQueryKeys.all, mediaType, tmdbId] as const
};

export function useMediaDetails(mediaType: MediaType | undefined, tmdbId: number | undefined) {
  return useQuery({
    queryKey:
      mediaType && tmdbId
        ? mediaDetailQueryKeys.detail(mediaType, tmdbId)
        : mediaDetailQueryKeys.all,
    queryFn: () => getMediaDetails(tmdbClient, mediaType as MediaType, tmdbId as number),
    enabled: tmdbRuntimeConfig.isConfigured && Boolean(mediaType) && Boolean(tmdbId),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 90,
    retry: 1
  });
}
