import type { MediaDetails } from '@/features/catalog/types';
import type { TmdbClient } from '@/services/tmdb/client';
import {
  mapTmdbMovieDetailsToMediaDetails,
  mapTmdbTvDetailsToMediaDetails
} from '@/services/tmdb/detailsMapper';
import type { TmdbMovieDetailsResponse, TmdbTvDetailsResponse } from '@/services/tmdb/types';
import type { MediaType } from '@/types/media';

export async function getMediaDetails(
  client: TmdbClient,
  mediaType: MediaType,
  tmdbId: number
): Promise<MediaDetails> {
  if (mediaType === 'movie') {
    const response = await client.request<TmdbMovieDetailsResponse>(`/movie/${tmdbId}`, {
      append_to_response: 'credits,images',
      include_image_language: 'fr,en,null'
    });

    return mapTmdbMovieDetailsToMediaDetails(response);
  }

  const response = await client.request<TmdbTvDetailsResponse>(`/tv/${tmdbId}`, {
    append_to_response: 'aggregate_credits,images',
    include_image_language: 'fr,en,null'
  });

  return mapTmdbTvDetailsToMediaDetails(response);
}
