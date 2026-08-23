import { TMDB_REGION, rakutenVikiProviderTarget } from '@/services/tmdb/config';
import type { TmdbClient } from '@/services/tmdb/client';
import type { TmdbProvider, TmdbWatchProvidersResponse } from '@/services/tmdb/types';
import type { MediaType } from '@/types/media';
import type { RakutenVikiProviderResolution } from '@/features/catalog/types';

type TmdbRequester = Pick<TmdbClient, 'request'>;

const mediaTypes = ['movie', 'tv'] as const satisfies readonly MediaType[];

const providerEndpointByMediaType: Record<MediaType, string> = {
  movie: '/watch/providers/movie',
  tv: '/watch/providers/tv'
};

function normalizeProviderName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function findRakutenVikiProvider(providers: TmdbProvider[]): TmdbProvider | undefined {
  return providers.find((provider) => {
    const normalizedName = normalizeProviderName(provider.provider_name);
    return rakutenVikiProviderTarget.acceptedNames.some(
      (acceptedName) => normalizedName === acceptedName
    );
  });
}

export async function resolveRakutenVikiProviderId(
  client: TmdbRequester,
  mediaType: MediaType
): Promise<number | undefined> {
  const response = await client.request<TmdbWatchProvidersResponse>(
    providerEndpointByMediaType[mediaType],
    {
      watch_region: TMDB_REGION
    }
  );

  return findRakutenVikiProvider(response.results)?.provider_id;
}

export async function resolveRakutenVikiProviders(
  client: TmdbRequester
): Promise<RakutenVikiProviderResolution> {
  const diagnostics = await Promise.all(
    mediaTypes.map(async (mediaType) => {
      const response = await client.request<TmdbWatchProvidersResponse>(
        providerEndpointByMediaType[mediaType],
        {
          watch_region: TMDB_REGION
        }
      );
      const provider = findRakutenVikiProvider(response.results ?? []);

      return {
        mediaType,
        providerFound: Boolean(provider),
        providerId: provider?.provider_id,
        providerName: provider?.provider_name,
        providerCount: response.results?.length ?? 0
      };
    })
  );

  return {
    providerIds: {
      movie: diagnostics.find((diagnostic) => diagnostic.mediaType === 'movie')?.providerId,
      tv: diagnostics.find((diagnostic) => diagnostic.mediaType === 'tv')?.providerId
    },
    diagnostics
  };
}
