import { describe, expect, it, vi } from 'vitest';

import { checkForPwaUpdates } from '@/app/pwaRegistration';

describe('pwaRegistration', () => {
  it('updates the active service worker registration when one exists', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const serviceWorker = {
      getRegistration: vi.fn().mockResolvedValue({ update })
    } as unknown as ServiceWorkerContainer;

    await expect(checkForPwaUpdates(serviceWorker)).resolves.toBe(true);

    expect(update).toHaveBeenCalledTimes(1);
  });

  it('reports false when no service worker registration exists', async () => {
    const serviceWorker = {
      getRegistration: vi.fn().mockResolvedValue(undefined)
    } as unknown as ServiceWorkerContainer;

    await expect(checkForPwaUpdates(serviceWorker)).resolves.toBe(false);
  });
});
