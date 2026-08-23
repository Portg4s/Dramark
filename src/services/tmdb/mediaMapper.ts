import type { CatalogMedia } from '@/features/catalog/types';
import type {
  TmdbMovieDiscoverResult,
  TmdbMultiSearchResult,
  TmdbTvDiscoverResult
} from '@/services/tmdb/types';

function cleanOptionalText(value: string | null | undefined): string | undefined {
  const cleanValue = value?.trim();
  return cleanValue ? cleanValue : undefined;
}

function extractReleaseYear(date: string | null | undefined): number | undefined {
  const match = date?.match(/^(\d{4})/);
  return match ? Number(match[1]) : undefined;
}

function cleanNumber(value: number | null | undefined): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function cleanCountries(countries: string[] | null | undefined): string[] {
  return countries?.filter(Boolean) ?? [];
}

export function mapTmdbMovieToCatalogMedia(movie: TmdbMovieDiscoverResult): CatalogMedia {
  const title =
    cleanOptionalText(movie.title) ?? cleanOptionalText(movie.original_title) ?? 'Titre inconnu';
  const originalTitle = cleanOptionalText(movie.original_title);
  const releaseDate = cleanOptionalText(movie.release_date);

  return {
    mediaType: 'movie',
    tmdbId: movie.id,
    title,
    originalTitle: originalTitle && originalTitle !== title ? originalTitle : undefined,
    overview: cleanOptionalText(movie.overview),
    posterPath: cleanOptionalText(movie.poster_path),
    backdropPath: cleanOptionalText(movie.backdrop_path),
    releaseDate,
    releaseYear: extractReleaseYear(releaseDate),
    originalLanguage: cleanOptionalText(movie.original_language),
    originCountries: cleanCountries(movie.origin_country),
    voteAverage: cleanNumber(movie.vote_average),
    popularity: cleanNumber(movie.popularity)
  };
}

export function mapTmdbTvToCatalogMedia(show: TmdbTvDiscoverResult): CatalogMedia {
  const title =
    cleanOptionalText(show.name) ?? cleanOptionalText(show.original_name) ?? 'Titre inconnu';
  const originalTitle = cleanOptionalText(show.original_name);
  const releaseDate = cleanOptionalText(show.first_air_date);

  return {
    mediaType: 'tv',
    tmdbId: show.id,
    title,
    originalTitle: originalTitle && originalTitle !== title ? originalTitle : undefined,
    overview: cleanOptionalText(show.overview),
    posterPath: cleanOptionalText(show.poster_path),
    backdropPath: cleanOptionalText(show.backdrop_path),
    releaseDate,
    releaseYear: extractReleaseYear(releaseDate),
    originalLanguage: cleanOptionalText(show.original_language),
    originCountries: cleanCountries(show.origin_country),
    voteAverage: cleanNumber(show.vote_average),
    popularity: cleanNumber(show.popularity)
  };
}

export function mapTmdbSearchResultToCatalogMedia(
  result: TmdbMultiSearchResult
): CatalogMedia | undefined {
  if (result.media_type === 'movie') {
    return mapTmdbMovieToCatalogMedia(result);
  }

  if (result.media_type === 'tv') {
    return mapTmdbTvToCatalogMedia(result);
  }

  return undefined;
}
