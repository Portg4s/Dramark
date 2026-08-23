import { describe, expect, it } from 'vitest';

import { createSearchParamsForQuery, normalizeSearchQuery } from '@/features/search/searchParams';

describe('search params helpers', () => {
  it('normalizes query values from URL and input', () => {
    expect(normalizeSearchQuery('  whisper  ')).toBe('whisper');
    expect(normalizeSearchQuery(null)).toBe('');
  });

  it('keeps q only when the query has content', () => {
    expect(createSearchParamsForQuery('whisper of desire').toString()).toBe('q=whisper+of+desire');
    expect(createSearchParamsForQuery('   ').toString()).toBe('');
  });
});
