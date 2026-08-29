import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ToastHost } from '@/components/system/ToastHost';
import { dismissToast, showToast, subscribeToasts } from '@/components/system/toastStore';

describe('ToastHost', () => {
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('dismisses visible toasts after two seconds', async () => {
    vi.useFakeTimers();
    render(<ToastHost />);
    const listener = vi.fn();
    const unsubscribe = subscribeToasts(listener);

    let id = '';

    act(() => {
      id = showToast({ title: 'Marque comme vu', detail: 'Obsession' });
    });

    expect(listener).toHaveBeenLastCalledWith([
      { id, title: 'Marque comme vu', detail: 'Obsession' }
    ]);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(listener).toHaveBeenLastCalledWith([]);
    unsubscribe();
    dismissToast(id);
  });
});
