import { describe, expect, it } from 'vitest';

import { keepCatalogSearchResult } from '@/services/tmdb/search';

describe('keepCatalogSearchResult', () => {
  it('keeps only movie and tv results', () => {
    expect(keepCatalogSearchResult({ id: 1, media_type: 'movie' })).toBe(true);
    expect(keepCatalogSearchResult({ id: 2, media_type: 'tv' })).toBe(true);
    expect(keepCatalogSearchResult({ id: 3, media_type: 'person' })).toBe(false);
  });
});
