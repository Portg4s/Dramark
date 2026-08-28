import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LibraryPage } from '@/pages/LibraryPage';
import type { LibraryEntryRecord, LibraryStatus } from '@/types/media';

const libraryEntriesMock = vi.hoisted(() => ({
  watchlist: [] as LibraryEntryRecord[],
  watched: [] as LibraryEntryRecord[]
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

describe('LibraryPage', () => {
  afterEach(() => {
    libraryEntriesMock.watchlist = [];
    libraryEntriesMock.watched = [];
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
});
