import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CalendarPage } from '@/pages/CalendarPage';

const calendarMock = vi.hoisted(() => ({
  isLoading: false,
  items: [
    {
      id: 'tv:10:2:8',
      mediaType: 'tv' as const,
      tmdbId: 10,
      title: 'Bleach',
      posterPath: '/poster.jpg',
      airDate: '2026-08-28',
      episodeCode: 'S2E8',
      seasonNumber: 2,
      episodeNumber: 8,
      episodeName: 'Le Dieu du tonnerre',
      providerLabel: 'TV Tokyo',
      seasons: [{ seasonNumber: 2, episodeCount: 10 }],
      watchedEpisodes: ['2:7'],
      media: {
        mediaType: 'tv' as const,
        tmdbId: 10,
        title: 'Bleach',
        posterPath: '/poster.jpg',
        originCountries: []
      }
    },
    {
      id: 'tv:20:1:4',
      mediaType: 'tv' as const,
      tmdbId: 20,
      title: 'Link Click',
      posterPath: '/link-click.jpg',
      airDate: '2026-08-29',
      episodeCode: 'S1E4',
      seasonNumber: 1,
      episodeNumber: 4,
      episodeName: 'JAE',
      providerLabel: 'bilibili',
      seasons: [{ seasonNumber: 1, episodeCount: 12 }],
      watchedEpisodes: [],
      media: {
        mediaType: 'tv' as const,
        tmdbId: 20,
        title: 'Link Click',
        posterPath: '/link-click.jpg',
        originCountries: []
      }
    }
  ]
}));

const libraryActionsMock = vi.hoisted(() => ({
  setTvProgressForMedia: vi.fn()
}));

vi.mock('@/features/calendar/hooks', () => ({
  useCalendarTimeline: () => calendarMock
}));

vi.mock('@/features/library/hooks', () => ({
  useLibraryMediaActions: () => ({
    isMutating: false,
    setTvProgressForMedia: libraryActionsMock.setTvProgressForMedia
  })
}));

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(2026, 7, 28, 12));
    calendarMock.items.at(0)!.watchedEpisodes = ['2:7'];
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    cleanup();
  });

  it('renders followed upcoming episodes as a simple timeline', async () => {
    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Calendrier' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "Aujourd'hui" })).toBeInTheDocument();
    expect(screen.getByText('Bleach')).toBeInTheDocument();
    expect(screen.getByText('S2E8')).toBeInTheDocument();
    expect(screen.getByText('Le Dieu du tonnerre')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Demain' })).toBeInTheDocument();
    expect(screen.getByText('Link Click')).toBeInTheDocument();
  });

  it('marks a currently available episode as watched from the timeline', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>
    );

    const markWatchedButton = screen.getByRole('button', { name: 'Marquer Bleach S2E8 vu' });

    expect(markWatchedButton).toHaveTextContent('Marquer vu');

    await user.click(markWatchedButton);

    expect(libraryActionsMock.setTvProgressForMedia).toHaveBeenCalledWith(
      expect.objectContaining({ tmdbId: 10, title: 'Bleach' }),
      [{ seasonNumber: 2, episodeCount: 10 }],
      ['2:7', '2:8']
    );
    expect(screen.queryByRole('button', { name: 'Marquer Link Click S1E4 vu' })).toBeNull();
  });

  it('shows a watched badge when the calendar episode is already watched', () => {
    calendarMock.items.at(0)!.watchedEpisodes = ['2:7', '2:8'];

    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: 'Marquer Bleach S2E8 vu' })).toBeNull();
    expect(screen.getByText('Vu')).toBeInTheDocument();
  });
});
