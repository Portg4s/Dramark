import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LibraryPage } from '@/pages/LibraryPage';

vi.mock('@/features/library/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/features/library/hooks')>(
    '@/features/library/hooks'
  );

  return {
    ...actual,
    useLibraryCounts: () => ({ watchlist: 0, watched: 0 }),
    useLibraryEntries: () => ({ data: [], isLoading: false, error: null }),
    useLibraryMediaActions: () => ({
      isMutating: false,
      removeMedia: vi.fn(),
      setStatusForMedia: vi.fn()
    })
  };
});

describe('LibraryPage', () => {
  afterEach(() => {
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
});
