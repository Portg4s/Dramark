import { rakutenVikiProviderTarget } from '@/services/tmdb/config';
import type { TmdbClient } from '@/services/tmdb/client';
import type { TmdbProvider, TmdbWatchProvidersResponse } from '@/services/tmdb/types';
import type { MediaType } from '@/types/media';

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

function findRakutenVikiProvider(providers: TmdbProvider[]): TmdbProvider | undefined {
  return providers.find((provider) => {
    const normalizedName = normalizeProviderName(provider.provider_name);
    return rakutenVikiProviderTarget.acceptedNames.some((acceptedName) => normalizedName === acceptedName);
  });
}

export async function resolveRakutenVikiProviderId(
  client: TmdbClient,
  mediaType: MediaType
): Promise<number | undefined> {
  const response = await client.request<TmdbWatchProvidersResponse>(providerEndpointByMediaType[mediaType], {
    watch_region: rakutenVikiProviderTarget.region
  });

  return findRakutenVikiProvider(response.results)?.provider_id;
}
