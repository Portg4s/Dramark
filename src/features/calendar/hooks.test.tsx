import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { MediaDetails } from '@/features/catalog/types';
import { useCalendarTimeline } from '@/features/calendar/hooks';
import type { LibraryEntryRecord } from '@/types/media';

const repositoryMock = vi.hoisted(() => ({
  entries: [] as LibraryEntryRecord[]
}));

const detailsMock = vi.hoisted(() => ({
  getMediaDetails: vi.fn()
}));

vi.mock('@/db/libraryRepository', () => ({
  listLibraryEntriesByStatus: () => Promise.resolve(repositoryMock.entries),
  listLibraryEntries: () => Promise.resolve(repositoryMock.entries)
}));

vi.mock('@/services/tmdb/config', () => ({
  tmdbRuntimeConfig: { isConfigured: true }
}));

vi.mock('@/services/tmdb/details', () => ({
  getMediaDetails: detailsMock.getMediaDetails
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });

  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useCalendarTimeline', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-08-28T10:00:00.000Z'));
    repositoryMock.entries = [
      {
        id: 'tv:10',
        mediaType: 'tv',
        tmdbId: 10,
        status: 'watchlist',
        addedAt: '2026-08-24T10:00:00.000Z',
        updatedAt: '2026-08-24T10:00:00.000Z',
        snapshot: { title: 'Bleach', releaseYear: 2004 }
      },
      {
        id: 'movie:20',
        mediaType: 'movie',
        tmdbId: 20,
        status: 'watchlist',
        addedAt: '2026-08-24T10:00:00.000Z',
        updatedAt: '2026-08-24T10:00:00.000Z',
        snapshot: { title: 'A Movie', releaseYear: 2026 }
      }
    ];
    detailsMock.getMediaDetails.mockResolvedValue({
      mediaType: 'tv',
      tmdbId: 10,
      title: 'Bleach',
      originCountries: ['JP'],
      galleryBackdropPaths: [],
      genres: ['Animation'],
      watchProviders: [],
      cast: [],
      directors: [],
      creators: [],
      networks: ['TV Tokyo'],
      seasons: [],
      nextEpisodeToAir: {
        tmdbId: 5001,
        seasonNumber: 2,
        episodeNumber: 8,
        name: 'Le Dieu du tonnerre',
        airDate: '2026-08-29'
      }
    } satisfies MediaDetails);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('builds upcoming timeline items from followed TV shows only', async () => {
    const { result } = renderHook(() => useCalendarTimeline(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.items).toHaveLength(1));

    expect(detailsMock.getMediaDetails).toHaveBeenCalledTimes(1);
    expect(result.current.items[0]).toMatchObject({
      id: 'tv:10:2:8',
      title: 'Bleach',
      airDate: '2026-08-29',
      episodeCode: 'S2E8',
      episodeName: 'Le Dieu du tonnerre',
      providerLabel: 'TV Tokyo'
    });
  });
});
