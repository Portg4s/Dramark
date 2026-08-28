import { useQuery } from '@tanstack/react-query';

import { tmdbClient } from '@/services/tmdb/client';
import { tmdbRuntimeConfig } from '@/services/tmdb/config';
import { getMediaDetails, getSimilarMedia, getTvSeasonDetails } from '@/services/tmdb/details';
import type { MediaType } from '@/types/media';

export const mediaDetailQueryKeys = {
  all: ['media-details'] as const,
  detail: (mediaType: MediaType, tmdbId: number) =>
    [...mediaDetailQueryKeys.all, mediaType, tmdbId] as const,
  similar: (mediaType: MediaType, tmdbId: number) =>
    [...mediaDetailQueryKeys.all, mediaType, tmdbId, 'similar'] as const,
  tvSeason: (tmdbId: number, seasonNumber: number) =>
    [...mediaDetailQueryKeys.all, 'tv-season', tmdbId, seasonNumber] as const
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

export function useTvSeasonDetails(
  tmdbId: number | undefined,
  seasonNumber: number | undefined,
  enabled = true
) {
  return useQuery({
    queryKey:
      tmdbId !== undefined && seasonNumber !== undefined
        ? mediaDetailQueryKeys.tvSeason(tmdbId, seasonNumber)
        : mediaDetailQueryKeys.all,
    queryFn: () => getTvSeasonDetails(tmdbClient, tmdbId as number, seasonNumber as number),
    enabled:
      enabled &&
      tmdbRuntimeConfig.isConfigured &&
      tmdbId !== undefined &&
      seasonNumber !== undefined,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 90,
    retry: 1
  });
}

export function useSimilarMedia(mediaType: MediaType | undefined, tmdbId: number | undefined) {
  return useQuery({
    queryKey:
      mediaType && tmdbId
        ? mediaDetailQueryKeys.similar(mediaType, tmdbId)
        : mediaDetailQueryKeys.all,
    queryFn: () => getSimilarMedia(tmdbClient, mediaType as MediaType, tmdbId as number),
    enabled: tmdbRuntimeConfig.isConfigured && Boolean(mediaType) && Boolean(tmdbId),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 90,
    retry: 1
  });
}
