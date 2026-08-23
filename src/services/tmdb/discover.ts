import { TMDB_REGION } from '@/services/tmdb/config';
import type { TmdbClient } from '@/services/tmdb/client';
import type {
  TmdbDiscoverResponse,
  TmdbMovieDiscoverResult,
  TmdbTvDiscoverResult
} from '@/services/tmdb/types';
import type { MediaType } from '@/types/media';

type TmdbRequester = Pick<TmdbClient, 'request'>;

type DiscoverResultByMediaType<TMediaType extends MediaType> = TMediaType extends 'movie'
  ? TmdbMovieDiscoverResult
  : TmdbTvDiscoverResult;

export async function discoverVikiFrancePage<TMediaType extends MediaType>(
  client: TmdbRequester,
  mediaType: TMediaType,
  providerId: number,
  page = 1
): Promise<TmdbDiscoverResponse<DiscoverResultByMediaType<TMediaType>>> {
  return client.request<TmdbDiscoverResponse<DiscoverResultByMediaType<TMediaType>>>(
    `/discover/${mediaType}`,
    {
      include_adult: false,
      include_video: mediaType === 'movie' ? false : undefined,
      page,
      sort_by: 'popularity.desc',
      watch_region: TMDB_REGION,
      with_watch_providers: providerId
    }
  );
}
