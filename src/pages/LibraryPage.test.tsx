import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LibraryPage } from '@/pages/LibraryPage';
import type { LibraryEntryRecord, LibraryStatus } from '@/types/media';

const libraryEntriesMock = vi.hoisted(() => ({
  watchlist: [] as LibraryEntryRecord[],
  watched: [] as LibraryEntryRecord[]
}));

const toastMock = vi.hoisted(() => ({
  showToast: vi.fn()
}));

vi.mock('@/features/library/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/features/library/hooks')>(
    '@/features/library/hooks'
  );

  return {
    ...actual,
    useLibraryCounts: () => ({
      watchlist: libraryEntriesMock.watchlist.length,
      watched: libraryEntriesMock.watched.length
    }),
    useLibraryEntries: (status?: LibraryStatus) => ({
      data: status
        ? libraryEntriesMock[status]
        : [...libraryEntriesMock.watchlist, ...libraryEntriesMock.watched],
      isLoading: false,
      error: null
    }),
    useLibraryMediaActions: () => ({
      isMutating: false,
      removeMedia: vi.fn(),
      setStatusForMedia: vi.fn()
    })
  };
});

vi.mock('@/components/system/toastStore', () => ({
  showToast: toastMock.showToast
}));

function makeWatchedMovie(index: number): LibraryEntryRecord {
  return {
    id: `movie:${index}`,
    mediaType: 'movie',
    tmdbId: index,
    status: 'watched',
    addedAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-08-25T10:00:00.000Z',
    snapshot: { title: `Movie ${index}`, releaseYear: 2026 }
  };
}

describe('LibraryPage', () => {
  afterEach(() => {
    libraryEntriesMock.watchlist = [];
    libraryEntriesMock.watched = [];
    window.localStorage.clear();
    toastMock.showToast.mockReset();
    cleanup();
  });

  it('opens the sort menu from the left on mobile so it stays in view', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Ajout récent' }));

    expect(screen.getByRole('menu', { name: 'Trier la liste' })).toHaveClass('left-0');
  });

  it('separates in-progress series from unstarted watchlist titles', async () => {
    const user = userEvent.setup();

    libraryEntriesMock.watchlist = [
      {
        id: 'tv:1',
        mediaType: 'tv',
        tmdbId: 1,
        status: 'watchlist',
        addedAt: '2026-08-24T10:00:00.000Z',
        updatedAt: '2026-08-24T10:00:00.000Z',
        snapshot: { title: 'Long Anime', releaseYear: 2026 },
        tvProgress: {
          watchedEpisodes: ['1:1', '1:2'],
          seasons: [{ seasonNumber: 1, episodeCount: 10 }],
          updatedAt: '2026-08-24T12:00:00.000Z'
        }
      },
      {
        id: 'movie:2',
        mediaType: 'movie',
        tmdbId: 2,
        status: 'watchlist',
        addedAt: '2026-08-24T11:00:00.000Z',
        updatedAt: '2026-08-24T11:00:00.000Z',
        snapshot: { title: 'Fresh Movie', releaseYear: 2026 }
      }
    ];

    render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /À regarder\s+1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /En cours\s+1/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fresh Movie' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Long Anime' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /En cours\s+1/i }));

    expect(await screen.findByRole('heading', { name: 'Long Anime' })).toBeInTheDocument();
    expect(screen.getByText('Saison 1 · Épisode 3')).toBeInTheDocument();
    expect(screen.getByText('8 épisodes restants')).toBeInTheDocument();
  });

  it('shows compact local stats and reveals unlocked achievements on demand', async () => {
    const user = userEvent.setup();

    libraryEntriesMock.watchlist = [
      {
        id: 'tv:1',
        mediaType: 'tv',
        tmdbId: 1,
        status: 'watchlist',
        addedAt: '2026-08-24T10:00:00.000Z',
        updatedAt: '2026-08-24T10:00:00.000Z',
        snapshot: { title: 'Long Anime', releaseYear: 2026 },
        tvProgress: {
          watchedEpisodes: Array.from({ length: 141 }, (_, index) => `1:${index + 1}`),
          seasons: [{ seasonNumber: 1, episodeCount: 150 }],
          updatedAt: '2026-08-24T12:00:00.000Z'
        }
      }
    ];
    libraryEntriesMock.watched = [
      {
        id: 'tv:2',
        mediaType: 'tv',
        tmdbId: 2,
        status: 'watched',
        addedAt: '2026-08-25T10:00:00.000Z',
        updatedAt: '2026-08-25T10:00:00.000Z',
        snapshot: { title: 'Finished Drama', releaseYear: 2025 },
        tvProgress: {
          watchedEpisodes: ['1:1', '1:2', '1:3'],
          seasons: [{ seasonNumber: 1, episodeCount: 3 }],
          updatedAt: '2026-08-25T12:00:00.000Z'
        }
      },
      ...Array.from({ length: 5 }, (_, index) => makeWatchedMovie(index + 3))
    ];

    render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Statistiques' })).toBeInTheDocument();
    expect(screen.getByText('Épisodes vus')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Succès 6' })).toBeInTheDocument();
    expect(screen.queryByText('Série terminée')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Succès 6' }));

    expect(screen.getByText('Série terminée')).toBeInTheDocument();
    expect(screen.getByText('100 épisodes')).toBeInTheDocument();
    expect(screen.getByText('5 films vus')).toBeInTheDocument();
    expect(screen.getAllByText('144')).not.toHaveLength(0);
  });

  it('announces newly unlocked achievements once', async () => {
    libraryEntriesMock.watched = Array.from({ length: 5 }, (_, index) =>
      makeWatchedMovie(index + 1)
    );

    render(
      <MemoryRouter>
        <LibraryPage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(toastMock.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Succès débloqué'
        })
      )
    );
  });
});
