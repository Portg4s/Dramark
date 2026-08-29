import { describe, expect, it } from 'vitest';

import { buildTmdbUrl, getTmdbPath, isAllowedTmdbPath } from './[[path]]';

describe('TMDB Pages Function routing', () => {
  it('allows only Dramark TMDB API paths', () => {
    expect(isAllowedTmdbPath('/search/multi')).toBe(true);
    expect(isAllowedTmdbPath('/trending/all/week')).toBe(true);
    expect(isAllowedTmdbPath('/discover/movie')).toBe(true);
    expect(isAllowedTmdbPath('/discover/tv')).toBe(true);
    expect(isAllowedTmdbPath('/movie/42')).toBe(true);
    expect(isAllowedTmdbPath('/movie/42/recommendations')).toBe(true);
    expect(isAllowedTmdbPath('/tv/7')).toBe(true);
    expect(isAllowedTmdbPath('/tv/7/recommendations')).toBe(true);
    expect(isAllowedTmdbPath('/tv/7/season/1')).toBe(true);

    expect(isAllowedTmdbPath('/person/1')).toBe(false);
    expect(isAllowedTmdbPath('/tv/popular')).toBe(false);
    expect(isAllowedTmdbPath('/movie/abc')).toBe(false);
    expect(isAllowedTmdbPath('/tv/7/recommendations/latest')).toBe(false);
    expect(isAllowedTmdbPath('/tv/7/season/latest')).toBe(false);
  });

  it('maps the same-origin proxy path to the TMDB path', () => {
    expect(getTmdbPath('https://dramark.example/api/tmdb/tv/7/season/1')).toBe('/tv/7/season/1');
    expect(getTmdbPath('https://dramark.example/api/tmdb/person/1')).toBeUndefined();
  });

  it('preserves query params without accepting external URLs', () => {
    expect(
      buildTmdbUrl(
        'https://dramark.example/api/tmdb/search/multi?language=fr-FR&query=moving&url=https%3A%2F%2Fexample.com'
      )
    ).toBe(
      'https://api.themoviedb.org/3/search/multi?language=fr-FR&query=moving&url=https%3A%2F%2Fexample.com'
    );
  });
});
