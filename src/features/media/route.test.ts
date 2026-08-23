import { describe, expect, it } from 'vitest';

import { createMediaDetailPath, parseMediaDetailParams } from '@/features/media/route';

describe('media detail route helpers', () => {
  it('creates stable media detail paths', () => {
    expect(createMediaDetailPath('movie', 42)).toBe('/media/movie/42');
    expect(createMediaDetailPath('tv', 7)).toBe('/media/tv/7');
  });

  it('parses valid movie and tv route identities', () => {
    expect(parseMediaDetailParams({ mediaType: 'movie', tmdbId: '42' })).toEqual({
      mediaType: 'movie',
      tmdbId: 42
    });
    expect(parseMediaDetailParams({ mediaType: 'tv', tmdbId: '7' })).toEqual({
      mediaType: 'tv',
      tmdbId: 7
    });
  });

  it('rejects invalid route identities', () => {
    expect(parseMediaDetailParams({ mediaType: 'person', tmdbId: '1' })).toBeUndefined();
    expect(parseMediaDetailParams({ mediaType: 'movie', tmdbId: '0' })).toBeUndefined();
    expect(parseMediaDetailParams({ mediaType: 'tv', tmdbId: 'abc' })).toBeUndefined();
  });
});
