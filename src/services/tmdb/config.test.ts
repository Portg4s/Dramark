import { describe, expect, it } from 'vitest';

import { readTmdbRuntimeConfig } from '@/services/tmdb/config';

describe('readTmdbRuntimeConfig', () => {
  it('marks TMDB as missing when no browser token is configured', () => {
    expect(readTmdbRuntimeConfig({})).toEqual({ accessToken: undefined, isConfigured: false });
  });

  it('accepts a non-empty VITE_TMDB_ACCESS_TOKEN', () => {
    expect(readTmdbRuntimeConfig({ VITE_TMDB_ACCESS_TOKEN: 'token' })).toEqual({
      accessToken: 'token',
      isConfigured: true
    });
  });
});
