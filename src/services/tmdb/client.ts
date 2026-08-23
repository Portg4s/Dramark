import {
  TMDB_API_BASE_URL,
  TMDB_LANGUAGE,
  TMDB_REGION,
  type TmdbRuntimeConfig,
  tmdbRuntimeConfig
} from '@/services/tmdb/config';
import { MissingTmdbConfigurationError, TmdbRequestError } from '@/services/tmdb/errors';
import type { MediaType } from '@/types/media';

type RequestParams = Record<string, string | number | boolean | undefined>;

export class TmdbClient {
  constructor(private readonly config: TmdbRuntimeConfig = tmdbRuntimeConfig) {}

  async request<TResponse>(path: string, params: RequestParams = {}): Promise<TResponse> {
    if (!this.config.accessToken) {
      throw new MissingTmdbConfigurationError();
    }

    const url = new URL(`${TMDB_API_BASE_URL}${path}`);
    url.searchParams.set('language', TMDB_LANGUAGE);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new TmdbRequestError(`Erreur TMDB ${response.status} sur ${path}.`, response.status);
    }

    return response.json() as Promise<TResponse>;
  }

  discover(mediaType: MediaType, providerId: number, page = 1) {
    return this.request(`/discover/${mediaType}`, {
      page,
      watch_region: TMDB_REGION,
      with_watch_providers: providerId,
      sort_by: 'popularity.desc'
    });
  }
}

export const tmdbClient = new TmdbClient();
