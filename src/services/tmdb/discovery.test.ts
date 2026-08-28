import { describe, expect, it, vi } from 'vitest';

import { getDiscoveryMedia, getTrendingMoviesAndTv } from '@/services/tmdb/discovery';
import type { TmdbClient } from '@/services/tmdb/client';

describe('TMDB discovery', () => {
  it('loads trending movie and tv results without leaking people to the domain', async () => {
    const request = vi.fn().mockResolvedValue({
      page: 1,
      total_pages: 1,
      total_results: 3,
      results: [
        {
          id: 1,
          media_type: 'tv',
          name: 'Moving',
          first_air_date: '2023-08-09',
          poster_path: '/moving.jpg',
          vote_average: 8.4
        },
        {
          id: 2,
          media_type: 'person',
          name: 'Actor'
        },
        {
          id: 3,
          media_type: 'movie',
          title: 'Past Lives',
          release_date: '2023-06-02'
        }
      ]
    });
    const client = { request } as unknown as TmdbClient;

    const page = await getTrendingMoviesAndTv(client);

    expect(request).toHaveBeenCalledWith('/trending/all/week', {
      page: 1,
      include_adult: false
    });
    expect(page.results).toEqual([
      expect.objectContaining({ mediaType: 'tv', tmdbId: 1, title: 'Moving' }),
      expect.objectContaining({ mediaType: 'movie', tmdbId: 3, title: 'Past Lives' })
    ]);
  });

  it('discovers K-drama through Korean TV filters', async () => {
    const request = vi.fn().mockResolvedValue({
      page: 1,
      total_pages: 1,
      total_results: 1,
      results: [
        {
          id: 10,
          name: 'Lovely Runner',
          first_air_date: '2024-04-08',
          origin_country: ['KR'],
          original_language: 'ko'
        }
      ]
    });
    const client = { request } as unknown as TmdbClient;

    const page = await getDiscoveryMedia(client, 'k-drama');

    expect(request).toHaveBeenCalledWith('/discover/tv', {
      page: 1,
      include_adult: false,
      sort_by: 'popularity.desc',
      'vote_count.gte': 20,
      with_origin_country: 'KR',
      with_original_language: 'ko'
    });
    expect(page.results).toEqual([
      expect.objectContaining({ mediaType: 'tv', tmdbId: 10, title: 'Lovely Runner' })
    ]);
  });

  it('discovers anime through Japanese animation TV filters', async () => {
    const request = vi.fn().mockResolvedValue({
      page: 1,
      total_pages: 1,
      total_results: 1,
      results: [
        {
          id: 20,
          name: 'Frieren',
          first_air_date: '2023-09-29',
          origin_country: ['JP'],
          original_language: 'ja'
        }
      ]
    });
    const client = { request } as unknown as TmdbClient;

    const page = await getDiscoveryMedia(client, 'anime');

    expect(request).toHaveBeenCalledWith('/discover/tv', {
      page: 1,
      include_adult: false,
      sort_by: 'popularity.desc',
      'vote_count.gte': 20,
      with_genres: 16,
      with_origin_country: 'JP',
      with_original_language: 'ja'
    });
    expect(page.results).toEqual([
      expect.objectContaining({ mediaType: 'tv', tmdbId: 20, title: 'Frieren' })
    ]);
  });

  it('keeps J-drama separate from anime by excluding animation', async () => {
    const request = vi.fn().mockResolvedValue({
      page: 1,
      total_pages: 1,
      total_results: 0,
      results: []
    });
    const client = { request } as unknown as TmdbClient;

    await getDiscoveryMedia(client, 'j-drama', 'trending', 2);

    expect(request).toHaveBeenCalledWith('/discover/tv', {
      page: 2,
      include_adult: false,
      sort_by: 'popularity.desc',
      'vote_count.gte': 20,
      with_origin_country: 'JP',
      with_original_language: 'ja',
      without_genres: 16
    });
  });

  it('uses stricter vote filters for top rated discovery', async () => {
    const request = vi.fn().mockResolvedValue({
      page: 1,
      total_pages: 1,
      total_results: 1,
      results: [
        {
          id: 30,
          name: 'Reply 1988',
          first_air_date: '2015-11-06',
          vote_average: 8.7
        }
      ]
    });
    const client = { request } as unknown as TmdbClient;

    await getDiscoveryMedia(client, 'k-drama', 'top-rated');

    expect(request).toHaveBeenCalledWith('/discover/tv', {
      page: 1,
      include_adult: false,
      sort_by: 'vote_average.desc',
      'vote_count.gte': 200,
      with_origin_country: 'KR',
      with_original_language: 'ko'
    });
  });

  it('merges movie and tv results for all top rated discovery', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce({
        page: 1,
        total_pages: 1,
        total_results: 1,
        results: [
          {
            id: 40,
            title: 'Past Lives',
            release_date: '2023-06-02',
            vote_average: 8.1
          }
        ]
      })
      .mockResolvedValueOnce({
        page: 1,
        total_pages: 1,
        total_results: 1,
        results: [
          {
            id: 41,
            name: 'Moving',
            first_air_date: '2023-08-09',
            vote_average: 8.5
          }
        ]
      });
    const client = { request } as unknown as TmdbClient;

    const page = await getDiscoveryMedia(client, 'all', 'top-rated');

    expect(request).toHaveBeenNthCalledWith(1, '/discover/movie', {
      page: 1,
      include_adult: false,
      sort_by: 'vote_average.desc',
      'vote_count.gte': 200
    });
    expect(request).toHaveBeenNthCalledWith(2, '/discover/tv', {
      page: 1,
      include_adult: false,
      sort_by: 'vote_average.desc',
      'vote_count.gte': 200
    });
    expect(page.results.map((media) => media.title)).toEqual(['Moving', 'Past Lives']);
  });
});
