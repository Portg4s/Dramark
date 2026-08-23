import { describe, expect, it } from 'vitest';

import {
  mapTmdbMovieDetailsToMediaDetails,
  mapTmdbTvDetailsToMediaDetails
} from '@/services/tmdb/detailsMapper';

describe('TMDB media detail mappers', () => {
  it('maps movie details with director, runtime, images and cast', () => {
    expect(
      mapTmdbMovieDetailsToMediaDetails({
        id: 42,
        title: 'Decision to Leave',
        original_title: '헤어질 결심',
        overview: 'Mystere romantique.',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg',
        release_date: '2022-06-29',
        tagline: 'Plus proche que jamais.',
        runtime: 138,
        original_language: 'ko',
        production_countries: [{ iso_3166_1: 'KR', name: 'South Korea' }],
        genres: [{ id: 1, name: 'Romance' }],
        vote_average: 7.4,
        vote_count: 1200,
        popularity: 31.2,
        images: {
          logos: [
            { file_path: '/logo-en.png', iso_639_1: 'en', vote_average: 8 },
            { file_path: '/logo-fr.png', iso_639_1: 'fr', vote_average: 3 }
          ],
          backdrops: [
            { file_path: '/backdrop-low.jpg', width: 500, vote_average: 10 },
            { file_path: '/backdrop-good.jpg', width: 1280, vote_average: 7 }
          ]
        },
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
      tagline: 'Plus proche que jamais.',
      logoPath: '/logo-fr.png',
      galleryBackdropPaths: ['/backdrop-good.jpg'],
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

  it('maps TV details with dates, seasons, episodes, images, creators, networks and aggregate cast', () => {
    expect(
      mapTmdbTvDetailsToMediaDetails({
        id: 7,
        name: 'Moving',
        original_name: '무빙',
        overview: 'Des familles avec pouvoirs.',
        poster_path: '/poster.jpg',
        backdrop_path: '/backdrop.jpg',
        first_air_date: '2023-08-09',
        last_air_date: '2023-09-20',
        next_episode_to_air: { air_date: '2024-01-01' },
        episode_run_time: [45],
        number_of_episodes: 20,
        number_of_seasons: 1,
        status: 'Ended',
        tagline: 'Ils ne sont pas ordinaires.',
        original_language: 'ko',
        origin_country: ['KR'],
        genres: [{ id: 2, name: 'Drame' }],
        created_by: [{ id: 20, name: 'Kang Full' }],
        networks: [{ id: 30, name: 'Disney+' }],
        vote_average: 8.4,
        vote_count: 500,
        images: {
          logos: [{ file_path: '/logo.png', iso_639_1: null, vote_average: 7 }],
          backdrops: [{ file_path: '/gallery.jpg', width: 1000, vote_average: 8 }]
        },
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
      tagline: 'Ils ne sont pas ordinaires.',
      logoPath: '/logo.png',
      galleryBackdropPaths: ['/gallery.jpg'],
      seasonsCount: 1,
      episodesCount: 20,
      episodeRuntimeMinutes: 45,
      status: 'Ended',
      lastAirDate: '2023-09-20',
      nextAirDate: '2024-01-01',
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
});
