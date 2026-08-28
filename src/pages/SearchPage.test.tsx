import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchPage } from '@/pages/SearchPage';

const discoveryMock = vi.hoisted(() => ({
  selectedFilters: [] as string[],
  selectedSorts: [] as string[]
}));

vi.mock('@/features/search/hooks', () => ({
  useTmdbMediaSearch: () => ({
    data: undefined,
    error: null,
    isLoading: false
  })
}));

vi.mock('@/features/discovery/hooks', () => ({
  useDiscoveryMedia: (filterKey: string, sortKey: string) => {
    discoveryMock.selectedFilters.push(filterKey);
    discoveryMock.selectedSorts.push(sortKey);

    return {
      data: {
        results: Array.from({ length: 12 }, (_, index) => ({
          mediaType: 'tv',
          tmdbId: index + 10,
          title: `Discovery ${index + 1}`,
          releaseYear: 2024,
          originCountries: ['KR'],
          voteAverage: 8.7
        }))
      },
      error: null,
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
    useLibraryIndex: () => ({
      data: new Map()
    }),
    useLibraryMediaActions: () => ({
      isMutating: false,
      removeMedia: vi.fn(),
      setStatusForMedia: vi.fn()
    })
  };
});

describe('SearchPage', () => {
  beforeEach(() => {
    discoveryMock.selectedFilters = [];
    discoveryMock.selectedSorts = [];
  });

  afterEach(() => {
    cleanup();
  });

  it('keeps spaces while typing in the search input', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/recherche']}>
        <SearchPage />
      </MemoryRouter>
    );

    const input = screen.getByRole('textbox', { name: 'Recherche' });

    await user.type(input, 'moving castle');

    expect(input).toHaveValue('moving castle');
  });

  it('uses the discovery copy in the search placeholder without the empty hint panel', () => {
    render(
      <MemoryRouter initialEntries={['/recherche']}>
        <SearchPage />
      </MemoryRouter>
    );

    expect(
      screen.getByPlaceholderText("Recherchez le nom d'un drama, film, série ou animé")
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Recherchez le titre que vous venez de repérer.')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Tapez au moins 2 caractères.')).not.toBeInTheDocument();
  });

  it('lets empty search discovery switch between all filters', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/recherche']}>
        <SearchPage />
      </MemoryRouter>
    );

    expect(discoveryMock.selectedFilters.at(-1)).toBe('all');
    expect(screen.getByRole('button', { name: 'J-drama' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'C-drama' }));

    expect(discoveryMock.selectedFilters.at(-1)).toBe('c-drama');
    expect(screen.getAllByText('8.7').length).toBeGreaterThan(0);
  });

  it('shows ten discovery suggestions when search is empty', () => {
    render(
      <MemoryRouter initialEntries={['/recherche']}>
        <SearchPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Discovery 10').length).toBeGreaterThan(0);
    expect(screen.queryByText('Discovery 11')).not.toBeInTheDocument();
  });

  it('lets empty search discovery switch sort modes', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/recherche']}>
        <SearchPage />
      </MemoryRouter>
    );

    expect(discoveryMock.selectedSorts.at(-1)).toBe('trending');

    await user.click(screen.getByRole('button', { name: 'Plus récents' }));

    expect(discoveryMock.selectedSorts.at(-1)).toBe('recent');
    expect(screen.getByRole('button', { name: 'Plus récents' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
