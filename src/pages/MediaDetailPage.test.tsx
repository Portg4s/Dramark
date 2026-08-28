import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { MediaDetails, TvSeasonDetails } from '@/features/catalog/types';
import { MediaDetailPage } from '@/pages/MediaDetailPage';
import type { LibraryEntryRecord } from '@/types/media';

const mocks = vi.hoisted(() => ({
  setStatusForMedia: vi.fn(),
  setTvProgressForMedia: vi.fn(),
  removeMedia: vi.fn()
}));

const tvDetails: MediaDetails = {
  mediaType: 'tv',
  tmdbId: 10,
  title: 'Whisper of Desire',
  originalTitle: 'Whisper of Desire',
  overview: 'Synopsis.',
  releaseDate: '2026-04-27',
  releaseYear: 2026,
  originalLanguage: 'th',
  originCountries: ['TH'],
  voteAverage: 4.2,
  voteCount: 2,
  popularity: 12,
  galleryBackdropPaths: [],
  genres: ['Mystère'],
  directors: [],
  creators: [],
  networks: ['ONE 31'],
  watchProviders: [
    {
      type: 'flatrate',
      label: 'Streaming',
      providerId: 8,
      providerName: 'Netflix',
      logoPath: '/netflix.jpg',
      displayPriority: 1
    }
  ],
  cast: [],
  seasonsCount: 1,
  episodesCount: 2,
  seasons: [{ tmdbId: 101, seasonNumber: 1, episodeCount: 2, name: 'Saison 1' }],
  status: 'Ended'
};

const seasonDetails: TvSeasonDetails = {
  seasonNumber: 1,
  name: 'Saison 1',
  episodes: [
    { tmdbId: 1001, seasonNumber: 1, episodeNumber: 1, name: 'Épisode 1' },
    { tmdbId: 1002, seasonNumber: 1, episodeNumber: 2, name: 'Épisode 2' }
  ]
};

const entry: LibraryEntryRecord = {
  id: 'tv:10',
  mediaType: 'tv',
  tmdbId: 10,
  status: 'watchlist',
  addedAt: '2026-08-24T10:00:00.000Z',
  updatedAt: '2026-08-24T10:00:00.000Z',
  snapshot: { title: 'Whisper of Desire', releaseYear: 2026 }
};

vi.mock('@/features/media/hooks', () => ({
  useMediaDetails: () => ({ data: tvDetails, isLoading: false, error: null }),
  useTvSeasonDetails: () => ({ data: seasonDetails, isLoading: false, error: null })
}));

vi.mock('@/features/library/hooks', () => ({
  useLibraryIndex: () => ({ data: new Map([['tv:10', entry]]) }),
  useLibraryMediaActions: () => ({
    isMutating: false,
    removeMedia: mocks.removeMedia,
    setStatusForMedia: mocks.setStatusForMedia,
    setTvProgressForMedia: mocks.setTvProgressForMedia
  })
}));

function renderMediaDetailPage() {
  return render(
    <MemoryRouter initialEntries={['/media/tv/10']}>
      <Routes>
        <Route path="/media/:mediaType/:tmdbId" element={<MediaDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('MediaDetailPage', () => {
  afterEach(() => {
    cleanup();
    mocks.setStatusForMedia.mockReset();
    mocks.setTvProgressForMedia.mockReset();
    mocks.removeMedia.mockReset();
  });

  it('keeps the selected status button readable instead of disabled-looking', () => {
    renderMediaDetailPage();

    expect(screen.getByRole('button', { name: 'À regarder' })).not.toBeDisabled();
  });

  it('softens very low vote counts in the hero rating', () => {
    renderMediaDetailPage();

    expect(screen.getByText(/4\.2 · peu d'avis/)).toBeInTheDocument();
    expect(screen.queryByText(/2 votes/)).not.toBeInTheDocument();
  });

  it('marks the next episode as watched from the progress summary', async () => {
    const user = userEvent.setup();

    renderMediaDetailPage();

    await user.click(screen.getByRole('button', { name: "Marquer l'épisode 1 vu" }));

    expect(mocks.setTvProgressForMedia).toHaveBeenCalledWith(
      tvDetails,
      [{ seasonNumber: 1, episodeCount: 2 }],
      ['1:1']
    );
  });

  it('lets the hero fade continue into the page content', () => {
    renderMediaDetailPage();

    expect(
      screen.getByRole('heading', { name: 'Whisper of Desire' }).closest('section')
    ).toHaveClass('overflow-visible');
  });

  it('shows French watch providers on the detail page', () => {
    renderMediaDetailPage();

    expect(screen.getByRole('heading', { name: 'Regarder sur' })).toBeInTheDocument();
    expect(screen.getByText('Streaming')).toBeInTheDocument();
    expect(screen.getByAltText('Netflix')).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w92/netflix.jpg'
    );
  });
});
