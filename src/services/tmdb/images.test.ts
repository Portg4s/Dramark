import { describe, expect, it } from 'vitest';

import { getTmdbImageUrl } from '@/services/tmdb/images';

describe('getTmdbImageUrl', () => {
  it('builds a sized TMDB image URL', () => {
    expect(getTmdbImageUrl('/poster.jpg', 'w342')).toBe(
      'https://image.tmdb.org/t/p/w342/poster.jpg'
    );
  });

  it('returns undefined without a path', () => {
    expect(getTmdbImageUrl(undefined, 'w500')).toBeUndefined();
    expect(getTmdbImageUrl('   ', 'w500')).toBeUndefined();
  });
});
