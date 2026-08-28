import { describe, expect, it, vi } from 'vitest';

import { dismissToast, showToast, subscribeToasts } from '@/components/system/toastStore';

describe('toastStore', () => {
  it('notifies listeners when a toast is shown and dismissed', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToasts(listener);

    const id = showToast({ title: 'Action effectuee' });

    expect(listener).toHaveBeenLastCalledWith([{ id, title: 'Action effectuee' }]);

    dismissToast(id);

    expect(listener).toHaveBeenLastCalledWith([]);

    unsubscribe();
  });

  it('keeps only the latest toast visible', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToasts(listener);

    const firstId = showToast({ title: 'Ajoute a regarder', detail: 'Lanterns' });
    const latestId = showToast({ title: 'Ajoute a regarder', detail: 'Mutiny' });

    expect(listener).toHaveBeenLastCalledWith([
      { id: latestId, title: 'Ajoute a regarder', detail: 'Mutiny' }
    ]);

    dismissToast(firstId);
    dismissToast(latestId);
    unsubscribe();
  });
});
