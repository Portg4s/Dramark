import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { PwaUpdateListener } from '@/app/pwaRegistration';
import { PwaUpdatePrompt } from '@/components/system/PwaUpdatePrompt';

describe('PwaUpdatePrompt', () => {
  it('applies the waiting update when the user confirms it', async () => {
    const user = userEvent.setup();
    const applyUpdate = vi.fn();
    let listener: PwaUpdateListener | undefined;

    render(
      <PwaUpdatePrompt
        applyUpdate={applyUpdate}
        subscribeUpdates={(nextListener) => {
          listener = nextListener;
          nextListener({ needsRefresh: false, offlineReady: false });

          return vi.fn();
        }}
      />
    );

    expect(screen.queryByText('Nouvelle version disponible')).not.toBeInTheDocument();

    act(() => listener?.({ needsRefresh: true, offlineReady: false }));

    expect(screen.getByText('Nouvelle version disponible')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mettre a jour Dramark' }));

    expect(applyUpdate).toHaveBeenCalledTimes(1);
  });
});
