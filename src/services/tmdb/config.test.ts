import { describe, expect, it } from 'vitest';

import { TMDB_API_BASE_URL, tmdbRuntimeConfig } from '@/services/tmdb/config';

describe('TMDB runtime config', () => {
  it('uses the same-origin API proxy', () => {
    expect(TMDB_API_BASE_URL).toBe('/api/tmdb');
  });

  it('keeps TMDB enabled through the server-side proxy', () => {
    expect(tmdbRuntimeConfig).toEqual({ isConfigured: true });
  });
});
