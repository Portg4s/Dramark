import { describe, expect, it } from 'vitest';

import { loadVikiCatalogPage } from '@/features/catalog/catalogService';
import type { TmdbClient } from '@/services/tmdb/client';

type FakeClient = Pick<TmdbClient, 'request'>;

describe('loadVikiCatalogPage', () => {
  it('maps TMDB discover responses to catalog pages', async () => {
    const client: FakeClient = {
      request: async <TResponse>() =>
        ({
          page: 2,
          total_pages: 3,
          total_results: 41,
          results: [
            {
              id: 123,
              name: 'Lovely Runner',
              original_name: '선재 업고 튀어',
              first_air_date: '2024-04-08',
              origin_country: ['KR'],
              popularity: 88
            }
          ]
        }) as TResponse
    };

    await expect(
      loadVikiCatalogPage({ mediaType: 'tv', providerId: 77, page: 2, client })
    ).resolves.toEqual({
      mediaType: 'tv',
      providerId: 77,
      page: 2,
      totalPages: 3,
      totalResults: 41,
      results: [
        {
          mediaType: 'tv',
          tmdbId: 123,
          title: 'Lovely Runner',
          originalTitle: '선재 업고 튀어',
          overview: undefined,
          posterPath: undefined,
          backdropPath: undefined,
          releaseDate: '2024-04-08',
          releaseYear: 2024,
          originalLanguage: undefined,
          originCountries: ['KR'],
          voteAverage: undefined,
          popularity: 88
        }
      ]
    });
  });

  it('handles minimal TMDB responses as empty catalog pages', async () => {
    const client: FakeClient = {
      request: async <TResponse>() => ({}) as TResponse
    };

    await expect(
      loadVikiCatalogPage({ mediaType: 'movie', providerId: 12, client })
    ).resolves.toEqual({
      mediaType: 'movie',
      providerId: 12,
      page: 1,
      totalPages: 0,
      totalResults: 0,
      results: []
    });
  });
});
