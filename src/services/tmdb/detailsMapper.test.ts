import { describe, expect, it } from 'vitest';

import {
  mapTmdbMovieDetailsToMediaDetails,
  mapTmdbTvDetailsToMediaDetails
} from '@/services/tmdb/detailsMapper';

describe('TMDB media detail mappers', () => {
  it('maps movie details with director, runtime and cast', () => {
    expect(
      mapTmdbMovieDetailsToMediaDetails({
        id: 42,
        title: 'Decision to Leave',
        original_title: '헤어질 결심',
        overview: 'Mystere romantique.',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg',
        release_date: '2022-06-29',
        runtime: 138,
        original_language: 'ko',
        production_countries: [{ iso_3166_1: 'KR', name: 'South Korea' }],
        genres: [{ id: 1, name: 'Romance' }],
        vote_average: 7.4,
        vote_count: 1200,
        popularity: 31.2,
        credits: {
          cast: [
            {
              id: 10,
              name: 'Tang Wei',
              character: 'Song Seo-rae',
              profile_path: '/tang.jpg',
              order: 1
            }
          ],
          crew: [{ id: 99, name: 'Park Chan-wook', job: 'Director', department: 'Directing' }]
        }
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
      popularity: 31.2,
      genres: ['Romance'],
      voteCount: 1200,
      runtimeMinutes: 138,
      directors: ['Park Chan-wook'],
      creators: [],
      networks: [],
      cast: [
        {
          id: 10,
          name: 'Tang Wei',
          character: 'Song Seo-rae',
          profilePath: '/tang.jpg'
        }
      ]
    });
  });

  it('maps TV details with seasons, episodes, creators, networks and aggregate cast', () => {
    expect(
      mapTmdbTvDetailsToMediaDetails({
        id: 7,
        name: 'Moving',
        original_name: '무빙',
        overview: 'Des familles avec pouvoirs.',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg',
        first_air_date: '2023-08-09',
        episode_run_time: [45],
        number_of_episodes: 20,
        number_of_seasons: 1,
        status: 'Ended',
        original_language: 'ko',
        origin_country: ['KR'],
        genres: [{ id: 2, name: 'Drame' }],
        created_by: [{ id: 20, name: 'Kang Full' }],
        networks: [{ id: 30, name: 'Disney+' }],
        vote_average: 8.4,
        vote_count: 500,
        aggregate_credits: {
          cast: [
            {
              id: 11,
              name: 'Han Hyo-joo',
              profile_path: '/han.jpg',
              order: 0,
              roles: [{ character: 'Lee Mi-hyun', episode_count: 20 }]
            }
          ]
        }
      })
    ).toMatchObject({
      mediaType: 'tv',
      tmdbId: 7,
      title: 'Moving',
      originalTitle: '무빙',
      releaseYear: 2023,
      originCountries: ['KR'],
      genres: ['Drame'],
      voteAverage: 8.4,
      voteCount: 500,
      seasonsCount: 1,
      episodesCount: 20,
      episodeRuntimeMinutes: 45,
      status: 'Ended',
      creators: ['Kang Full'],
      networks: ['Disney+'],
      cast: [
        {
          id: 11,
          name: 'Han Hyo-joo',
          character: 'Lee Mi-hyun',
          profilePath: '/han.jpg'
        }
      ]
    });
  });

  it('falls back to normal TV credits when aggregate credits are empty', () => {
    expect(
      mapTmdbTvDetailsToMediaDetails({
        id: 8,
        name: 'Fallback Show',
        credits: {
          cast: [{ id: 12, name: 'Actor', character: 'Hero', order: 0 }]
        }
      }).cast
    ).toEqual([{ id: 12, name: 'Actor', character: 'Hero', profilePath: undefined }]);
  });
});
