import type { MediaType } from '@/types/media';

export const catalogQueryKeys = {
  all: ['catalog'] as const,
  vikiProviderResolution: () => [...catalogQueryKeys.all, 'viki-provider-resolution'] as const,
  vikiDiscoverPage: (mediaType: MediaType, providerId: number | undefined, page: number) =>
    [
      ...catalogQueryKeys.all,
      'viki-discover',
      mediaType,
      providerId ?? 'missing-provider',
      page
    ] as const
};
