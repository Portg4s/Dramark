import { afterEach, describe, expect, it, vi } from 'vitest';

import { TmdbClient } from '@/services/tmdb/client';

describe('TmdbClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the same-origin TMDB proxy without an Authorization header', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

    await new TmdbClient().request('/search/multi', {
      query: 'moving',
      page: 2,
      include_adult: false
    });

    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, init] = fetchMock.mock.calls[0] ?? [];

    expect(String(url)).toBe(
      'http://localhost:3000/api/tmdb/search/multi?language=fr-FR&query=moving&page=2&include_adult=false'
    );
    expect((init as RequestInit).headers).toEqual({
      Accept: 'application/json'
    });
    expect(JSON.stringify((init as RequestInit).headers)).not.toContain('Authorization');
  });
});
