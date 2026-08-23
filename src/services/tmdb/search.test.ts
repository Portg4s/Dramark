import { describe, expect, it } from 'vitest';

import { keepCatalogSearchResult, searchMoviesAndTv } from '@/services/tmdb/search';
import type { TmdbClient } from '@/services/tmdb/client';
import type { TmdbMultiSearchResponse } from '@/services/tmdb/types';

describe('TMDB search', () => {
  it('keeps only movie and tv results', () => {
    expect(keepCatalogSearchResult({ id: 1, media_type: 'movie' })).toBe(true);
    expect(keepCatalogSearchResult({ id: 2, media_type: 'tv' })).toBe(true);
    expect(keepCatalogSearchResult({ id: 3, media_type: 'person' })).toBe(false);
  });

  it('searches movie and tv results without leaking people to the domain', async () => {
    const response: TmdbMultiSearchResponse = {
      page: 1,
      total_pages: 1,
      total_results: 3,
      results: [
        {
          id: 1,
          media_type: 'person'
        },
        {
          id: 2,
          media_type: 'movie',
          title: 'Past Lives',
          original_title: 'Past Lives',
          release_date: '2023-06-02',
          poster_path: '/past.jpg',
          origin_country: ['US'],
          vote_average: 7.7
        },
        {
          id: 3,
          media_type: 'tv',
          name: 'Moving',
          original_name: '무빙',
          first_air_date: '2023-08-09',
          origin_country: ['KR'],
          vote_average: 8.4
        }
      ]
    };
    const client = {
      request: async () => response
    } as Pick<TmdbClient, 'request'> as TmdbClient;

    const page = await searchMoviesAndTv(client, 'moving');

    expect(page.results).toEqual([
      expect.objectContaining({
        mediaType: 'movie',
        tmdbId: 2,
        title: 'Past Lives',
        releaseYear: 2023,
        posterPath: '/past.jpg',
        originCountries: ['US'],
        voteAverage: 7.7
      }),
      expect.objectContaining({
        mediaType: 'tv',
        tmdbId: 3,
        title: 'Moving',
        releaseYear: 2023,
        originCountries: ['KR'],
        voteAverage: 8.4
      })
    ]);
  });
});
