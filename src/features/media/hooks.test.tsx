import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useSimilarMedia } from '@/features/media/hooks';

const detailsMock = vi.hoisted(() => ({
  getMediaDetails: vi.fn(),
  getSimilarMedia: vi.fn(),
  getTvSeasonDetails: vi.fn()
}));

vi.mock('@/services/tmdb/config', () => ({
  tmdbRuntimeConfig: { isConfigured: true }
}));

vi.mock('@/services/tmdb/details', () => ({
  getMediaDetails: detailsMock.getMediaDetails,
  getSimilarMedia: detailsMock.getSimilarMedia,
  getTvSeasonDetails: detailsMock.getTvSeasonDetails
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });

  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useSimilarMedia', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads recommendations for the selected media', async () => {
    detailsMock.getSimilarMedia.mockResolvedValue([
      {
        mediaType: 'tv',
        tmdbId: 42,
        title: 'Similar Drama',
        releaseYear: 2024
      }
    ]);

    const { result } = renderHook(() => useSimilarMedia('tv', 10), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toHaveLength(1));

    expect(detailsMock.getSimilarMedia).toHaveBeenCalledWith(expect.anything(), 'tv', 10);
    expect(result.current.data?.[0]).toMatchObject({
      mediaType: 'tv',
      tmdbId: 42,
      title: 'Similar Drama'
    });
  });
});
