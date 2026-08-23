import { describe, expect, it } from 'vitest';

import { createMediaKey } from '@/utils/mediaKey';

describe('createMediaKey', () => {
  it('uses media type and TMDB id to avoid movie/tv collisions', () => {
    expect(createMediaKey({ mediaType: 'movie', tmdbId: 42 })).toBe('movie:42');
    expect(createMediaKey({ mediaType: 'tv', tmdbId: 42 })).toBe('tv:42');
  });
});
