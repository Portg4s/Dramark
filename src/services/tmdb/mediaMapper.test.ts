import { describe, expect, it } from 'vitest';

import { mapTmdbMovieToCatalogMedia, mapTmdbTvToCatalogMedia } from '@/services/tmdb/mediaMapper';

describe('TMDB catalog mappers', () => {
  it('maps a movie discover result to the catalog domain', () => {
    expect(
      mapTmdbMovieToCatalogMedia({
        id: 42,
        title: 'Decision to Leave',
        original_title: '헤어질 결심',
        overview: 'Mystere romantique.',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg',
        release_date: '2022-06-29',
        original_language: 'ko',
        origin_country: ['KR'],
        vote_average: 7.4,
        popularity: 31.2
      })
    ).toEqual({
      mediaType: 'movie',
      tmdbId: 42,
      title: 'Decision to Leave',
      originalTitle: '헤어질 결심',
      overview: 'Mystere romantique.',
      posterPath: '/poster.jpg',
      backdropPath: '/backdrop.jpg',
      releaseDate: '2022-06-29',
      releaseYear: 2022,
      originalLanguage: 'ko',
      originCountries: ['KR'],
      voteAverage: 7.4,
      popularity: 31.2
    });
  });

  it('maps a TV discover result to the catalog domain', () => {
    expect(
      mapTmdbTvToCatalogMedia({
        id: 7,
        name: 'Extraordinary Attorney Woo',
        original_name: '이상한 변호사 우영우',
        first_air_date: '2022-06-29',
        origin_country: ['KR'],
        poster_path: null,
        original_language: 'ko'
      })
    ).toMatchObject({
      mediaType: 'tv',
      tmdbId: 7,
      title: 'Extraordinary Attorney Woo',
      originalTitle: '이상한 변호사 우영우',
      releaseDate: '2022-06-29',
      releaseYear: 2022,
      originCountries: ['KR'],
      posterPath: undefined,
      originalLanguage: 'ko'
    });
  });

  it('handles incomplete discover results without leaking raw TMDB fields', () => {
    expect(mapTmdbMovieToCatalogMedia({ id: 10, original_title: 'Only Original' })).toEqual({
      mediaType: 'movie',
      tmdbId: 10,
      title: 'Only Original',
      originalTitle: undefined,
      overview: undefined,
      posterPath: undefined,
      backdropPath: undefined,
      releaseDate: undefined,
      releaseYear: undefined,
      originalLanguage: undefined,
      originCountries: [],
      voteAverage: undefined,
      popularity: undefined
    });
  });
});
