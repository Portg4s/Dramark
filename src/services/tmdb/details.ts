import type { MediaDetails, TvSeasonDetails } from '@/features/catalog/types';
import type { TmdbClient } from '@/services/tmdb/client';
import {
  mapTmdbMovieDetailsToMediaDetails,
  mapTmdbTvDetailsToMediaDetails,
  mapTmdbTvSeasonDetails
} from '@/services/tmdb/detailsMapper';
import type {
  TmdbMovieDetailsResponse,
  TmdbTvDetailsResponse,
  TmdbTvSeasonDetailsResponse
} from '@/services/tmdb/types';
import type { MediaType } from '@/types/media';

export async function getMediaDetails(
  client: TmdbClient,
  mediaType: MediaType,
  tmdbId: number
): Promise<MediaDetails> {
  if (mediaType === 'movie') {
    const response = await client.request<TmdbMovieDetailsResponse>(`/movie/${tmdbId}`, {
      append_to_response: 'credits,images,watch/providers',
      include_image_language: 'fr,en,null'
    });

    return mapTmdbMovieDetailsToMediaDetails(response);
  }

  const response = await client.request<TmdbTvDetailsResponse>(`/tv/${tmdbId}`, {
    append_to_response: 'aggregate_credits,images,watch/providers',
    include_image_language: 'fr,en,null'
  });

  return mapTmdbTvDetailsToMediaDetails(response);
}

export async function getTvSeasonDetails(
  client: TmdbClient,
  tmdbId: number,
  seasonNumber: number
): Promise<TvSeasonDetails> {
  const response = await client.request<TmdbTvSeasonDetailsResponse>(
    `/tv/${tmdbId}/season/${seasonNumber}`
  );

  return mapTmdbTvSeasonDetails(response);
}
