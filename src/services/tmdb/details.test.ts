import { describe, expect, it, vi } from 'vitest';

import { getSimilarMedia } from '@/services/tmdb/details';
import type { TmdbClient } from '@/services/tmdb/client';

describe('TMDB details service', () => {
  it('loads TV recommendations as catalog media', async () => {
    const request = vi.fn().mockResolvedValue({
      page: 1,
      total_pages: 1,
      total_results: 1,
      results: [
        {
          id: 42,
          name: 'Similar Drama',
          original_name: 'Similar Drama',
          first_air_date: '2024-02-10',
          poster_path: '/similar.jpg',
          backdrop_path: '/similar-backdrop.jpg',
          original_language: 'ko',
          origin_country: ['KR'],
          vote_average: 8.4,
          popularity: 90
        }
      ]
    });

    const client = { request } as unknown as TmdbClient;

    const results = await getSimilarMedia(client, 'tv', 10);

    expect(request).toHaveBeenCalledWith('/tv/10/recommendations', {
      page: 1,
      include_adult: false
    });
    expect(results).toEqual([
      expect.objectContaining({
        mediaType: 'tv',
        tmdbId: 42,
        title: 'Similar Drama',
        releaseYear: 2024,
        voteAverage: 8.4
      })
    ]);
  });
});
