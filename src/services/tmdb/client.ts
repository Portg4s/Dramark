import { TMDB_API_BASE_URL, TMDB_LANGUAGE } from '@/services/tmdb/config';
import { TmdbRequestError } from '@/services/tmdb/errors';

type RequestParams = Record<string, string | number | boolean | undefined>;

export class TmdbClient {
  async request<TResponse>(path: string, params: RequestParams = {}): Promise<TResponse> {
    const url = new URL(`${TMDB_API_BASE_URL}${path}`, window.location.origin);
    url.searchParams.set('language', TMDB_LANGUAGE);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new TmdbRequestError(`Erreur TMDB ${response.status} sur ${path}.`, response.status);
    }

    return response.json() as Promise<TResponse>;
  }
}

export const tmdbClient = new TmdbClient();
