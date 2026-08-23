import { describe, expect, it } from 'vitest';

import {
  resolveRakutenVikiProviderId,
  resolveRakutenVikiProviders
} from '@/services/tmdb/watchProviders';
import type { TmdbClient } from '@/services/tmdb/client';
import type { TmdbWatchProvidersResponse } from '@/services/tmdb/types';

type FakeClient = Pick<TmdbClient, 'request'>;

function createProviderClient(responses: Record<string, TmdbWatchProvidersResponse>): FakeClient {
  return {
    request: async <TResponse>(path: string) => responses[path] as TResponse
  };
}

describe('Rakuten Viki provider resolution', () => {
  it('resolves Rakuten Viki separately for movies and TV', async () => {
    const client = createProviderClient({
      '/watch/providers/movie': {
        results: [{ provider_id: 11, provider_name: 'Rakuten Viki' }]
      },
      '/watch/providers/tv': {
        results: [{ provider_id: 22, provider_name: 'Rakuten Viki' }]
      }
    });

    await expect(resolveRakutenVikiProviderId(client, 'movie')).resolves.toBe(11);
    await expect(resolveRakutenVikiProviders(client)).resolves.toMatchObject({
      providerIds: { movie: 11, tv: 22 },
      diagnostics: [
        { mediaType: 'movie', providerFound: true, providerId: 11, providerCount: 1 },
        { mediaType: 'tv', providerFound: true, providerId: 22, providerCount: 1 }
      ]
    });
  });

  it('keeps provider ids undefined when Rakuten Viki is absent', async () => {
    const client = createProviderClient({
      '/watch/providers/movie': {
        results: [{ provider_id: 8, provider_name: 'Another Provider' }]
      },
      '/watch/providers/tv': { results: [] }
    });

    await expect(resolveRakutenVikiProviders(client)).resolves.toEqual({
      providerIds: { movie: undefined, tv: undefined },
      diagnostics: [
        {
          mediaType: 'movie',
          providerFound: false,
          providerId: undefined,
          providerName: undefined,
          providerCount: 1
        },
        {
          mediaType: 'tv',
          providerFound: false,
          providerId: undefined,
          providerName: undefined,
          providerCount: 0
        }
      ]
    });
  });
});
