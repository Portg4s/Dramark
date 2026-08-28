import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { SearchPage } from '@/pages/SearchPage';

vi.mock('@/features/search/hooks', () => ({
  useTmdbMediaSearch: () => ({
    data: undefined,
    error: null,
    isLoading: false
  })
}));

vi.mock('@/features/library/hooks', () => ({
  useLibraryIndex: () => ({
    data: new Map()
  }),
  useLibraryMediaActions: () => ({
    isMutating: false,
    removeMedia: vi.fn(),
    setStatusForMedia: vi.fn()
  })
}));

describe('SearchPage', () => {
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
});
