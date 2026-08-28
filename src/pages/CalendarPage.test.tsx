import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CalendarPage } from '@/pages/CalendarPage';

const calendarMock = vi.hoisted(() => ({
  isLoading: false,
  items: [
    {
      id: 'tv:10',
      mediaType: 'tv' as const,
      tmdbId: 10,
      title: 'Bleach',
      posterPath: '/poster.jpg',
      airDate: '2026-08-28',
      episodeCode: 'S2E8',
      episodeName: 'Le Dieu du tonnerre',
      providerLabel: 'TV Tokyo'
    }
  ]
}));

vi.mock('@/features/calendar/hooks', () => ({
  useCalendarTimeline: () => calendarMock
}));

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(2026, 7, 28, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
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
  });
});
