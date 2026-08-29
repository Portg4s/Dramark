import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HomePage } from '@/pages/HomePage';
import type { LibraryEntryRecord, LibraryStatus } from '@/types/media';

const discoveryMock = vi.hoisted(() => ({
  selectedFilters: [] as string[],
  selectedSorts: [] as string[]
}));

const libraryActionsMock = vi.hoisted(() => ({
  setTvProgressForMedia: vi.fn()
}));

const libraryEntries: Record<LibraryStatus, LibraryEntryRecord[]> = {
  watchlist: [
    {
      id: 'tv:1',
      mediaType: 'tv',
      tmdbId: 1,
      status: 'watchlist',
      addedAt: '2026-08-24T10:00:00.000Z',
      updatedAt: '2026-08-24T10:00:00.000Z',
      snapshot: { title: 'Moving On', releaseYear: 2026 }
    }
  ],
  watched: [
    {
      id: 'movie:2',
      mediaType: 'movie',
      tmdbId: 2,
      status: 'watched',
      addedAt: '2026-08-24T10:00:00.000Z',
      updatedAt: '2026-08-24T10:00:00.000Z',
      snapshot: { title: 'Whisper', releaseYear: 2007 }
    }
  ]
};

vi.mock('@/features/discovery/hooks', () => ({
  useDiscoveryMedia: (filterKey: string, sortKey: string) => {
    discoveryMock.selectedFilters.push(filterKey);
    discoveryMock.selectedSorts.push(sortKey);

    return {
      data: {
        results: [
          {
            mediaType: 'tv',
            tmdbId: 900,
            title: 'Lovely Runner',
            releaseYear: 2024,
            voteAverage: 8.2
          }
        ]
      },
      isLoading: false
    };
  }
}));

vi.mock('@/features/library/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/features/library/hooks')>(
    '@/features/library/hooks'
  );

  return {
    ...actual,
    useLibraryCounts: () => ({
      watchlist: libraryEntries.watchlist.length,
      watched: libraryEntries.watched.length
    }),
    useLibraryEntries: (status?: LibraryStatus) => ({
      data: status
        ? libraryEntries[status]
        : [...libraryEntries.watchlist, ...libraryEntries.watched]
    }),
    useLibraryMediaActions: () => ({
      isMutating: false,
      setTvProgressForMedia: libraryActionsMock.setTvProgressForMedia
    })
  };
});

describe('HomePage', () => {
  beforeEach(() => {
    discoveryMock.selectedFilters = [];
    discoveryMock.selectedSorts = [];
    libraryActionsMock.setTvProgressForMedia.mockReset();
    libraryEntries.watchlist = [
      {
        id: 'tv:1',
        mediaType: 'tv',
        tmdbId: 1,
        status: 'watchlist',
        addedAt: '2026-08-24T10:00:00.000Z',
        updatedAt: '2026-08-24T10:00:00.000Z',
        snapshot: { title: 'Moving On', releaseYear: 2026 }
      }
    ];
    libraryEntries.watched = [
      {
        id: 'movie:2',
        mediaType: 'movie',
        tmdbId: 2,
        status: 'watched',
        addedAt: '2026-08-24T10:00:00.000Z',
        updatedAt: '2026-08-24T10:00:00.000Z',
        snapshot: { title: 'Whisper', releaseYear: 2007 }
      }
    ];
  });

  afterEach(() => {
    cleanup();
  });

  it('does not render shortcut cards when the library already has content', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.queryByText('Ajouter un film ou une serie.')).not.toBeInTheDocument();
    expect(screen.queryByText('Parcourir votre collection.')).not.toBeInTheDocument();
  });

  it('lets the discovery rail switch between quick filters', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(discoveryMock.selectedFilters.at(-1)).toBe('all');

    await user.click(screen.getByRole('button', { name: 'K-drama' }));

    expect(discoveryMock.selectedFilters.at(-1)).toBe('k-drama');
    expect(screen.getByRole('button', { name: 'K-drama' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps all discovery filters directly available without a submenu', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: 'Plus de filtres' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'J-drama' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'C-drama' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thai drama' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'J-drama' }));

    expect(discoveryMock.selectedFilters.at(-1)).toBe('j-drama');
    expect(screen.getByRole('button', { name: 'J-drama' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows ratings on discovery cards', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText('8.2')).toBeInTheDocument();
  });

  it('shows in-progress titles as their own home count', () => {
    libraryEntries.watchlist = [
      ...libraryEntries.watchlist,
      {
        id: 'tv:3',
        mediaType: 'tv',
        tmdbId: 3,
        status: 'watchlist',
        addedAt: '2026-08-24T12:00:00.000Z',
        updatedAt: '2026-08-24T12:00:00.000Z',
        snapshot: { title: 'Long Anime', releaseYear: 2026 },
        tvProgress: {
          watchedEpisodes: ['1:1'],
          seasons: [{ seasonNumber: 1, episodeCount: 12 }],
          updatedAt: '2026-08-24T12:00:00.000Z'
        }
      }
    ];

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('1 vus, 1 en cours, 1 à regarder')).toBeInTheDocument();
  });

  it('highlights the next title to resume and marks its next episode watched', async () => {
    const user = userEvent.setup();

    libraryEntries.watchlist = [
      {
        id: 'tv:3',
        mediaType: 'tv',
        tmdbId: 3,
        status: 'watchlist',
        addedAt: '2026-08-24T12:00:00.000Z',
        updatedAt: '2026-08-26T12:00:00.000Z',
        snapshot: { title: 'Long Anime', releaseYear: 2026 },
        tvProgress: {
          watchedEpisodes: ['1:1'],
          seasons: [{ seasonNumber: 1, episodeCount: 12 }],
          updatedAt: '2026-08-26T12:00:00.000Z'
        }
      },
      {
        id: 'tv:4',
        mediaType: 'tv',
        tmdbId: 4,
        status: 'watchlist',
        addedAt: '2026-08-24T11:00:00.000Z',
        updatedAt: '2026-08-25T12:00:00.000Z',
        snapshot: { title: 'Side Drama', releaseYear: 2025 },
        tvProgress: {
          watchedEpisodes: ['1:1', '1:2'],
          seasons: [{ seasonNumber: 1, episodeCount: 8 }],
          updatedAt: '2026-08-25T12:00:00.000Z'
        }
      },
      {
        id: 'movie:5',
        mediaType: 'movie',
        tmdbId: 5,
        status: 'watchlist',
        addedAt: '2026-08-24T10:00:00.000Z',
        updatedAt: '2026-08-24T10:00:00.000Z',
        snapshot: { title: 'Fresh Movie', releaseYear: 2026 }
      }
    ];

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /reprendre/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Long Anime' })).toBeInTheDocument();
    expect(screen.getByText('Saison 1 · Épisode 2')).toBeInTheDocument();
    expect(screen.getByText('1 / 12 épisodes vus')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Autres en cours' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Side Drama' })).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Marquer le prochain épisode de Long Anime vu' })
    );

    expect(libraryActionsMock.setTvProgressForMedia).toHaveBeenCalledWith(
      expect.objectContaining({ tmdbId: 3, title: 'Long Anime' }),
      [{ seasonNumber: 1, episodeCount: 12 }],
      ['1:1', '1:2']
    );
  });

  it('lets the discovery rail switch sort modes', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(discoveryMock.selectedSorts.at(-1)).toBe('trending');

    await user.click(screen.getByRole('button', { name: 'Mieux notés' }));

    expect(discoveryMock.selectedSorts.at(-1)).toBe('top-rated');
    expect(screen.getByRole('button', { name: 'Mieux notés' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
