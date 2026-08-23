import type { MediaDetails } from '@/features/catalog/types';
import type {
  TmdbAggregateCast,
  TmdbCreditCast,
  TmdbCreditCrew,
  TmdbGenre,
  TmdbMovieDetailsResponse,
  TmdbNamedEntity,
  TmdbProductionCountry,
  TmdbTvDetailsResponse
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

function cleanNames(values: TmdbGenre[] | TmdbNamedEntity[] | null | undefined): string[] {
  return (
    values
      ?.map((value) => cleanOptionalText(value.name))
      .filter((value): value is string => Boolean(value)) ?? []
  );
}

function cleanCountries(countries: TmdbProductionCountry[] | null | undefined): string[] {
  return (
    countries
      ?.map((country) => cleanOptionalText(country.iso_3166_1))
      .filter((country): country is string => Boolean(country)) ?? []
  );
}

function mapMovieCast(cast: TmdbCreditCast[] | null | undefined) {
  return [...(cast ?? [])]
    .sort((first, second) => (first.order ?? 999) - (second.order ?? 999))
    .slice(0, 12)
    .map((member) => ({
      id: member.id,
      name: cleanOptionalText(member.name) ?? 'Nom inconnu',
      character: cleanOptionalText(member.character),
      profilePath: cleanOptionalText(member.profile_path)
    }));
}

function mapTvCast(
  aggregateCast: TmdbAggregateCast[] | null | undefined,
  fallbackCast: TmdbCreditCast[] | null | undefined
) {
  const cast = aggregateCast ?? [];

  if (cast.length === 0) {
    return mapMovieCast(fallbackCast);
  }

  return [...cast]
    .sort((first, second) => (first.order ?? 999) - (second.order ?? 999))
    .slice(0, 12)
    .map((member) => ({
      id: member.id,
      name: cleanOptionalText(member.name) ?? 'Nom inconnu',
      character: member.roles
        ?.map((role) => cleanOptionalText(role.character))
        .filter((role): role is string => Boolean(role))
        .slice(0, 2)
        .join(', '),
      profilePath: cleanOptionalText(member.profile_path)
    }));
}

function getDirectors(crew: TmdbCreditCrew[] | null | undefined): string[] {
  return (
    crew
      ?.filter((member) => member.job === 'Director')
      .map((member) => cleanOptionalText(member.name))
      .filter((name): name is string => Boolean(name)) ?? []
  );
}

export function mapTmdbMovieDetailsToMediaDetails(movie: TmdbMovieDetailsResponse): MediaDetails {
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
    originCountries: cleanCountries(movie.production_countries),
    voteAverage: cleanNumber(movie.vote_average),
    popularity: cleanNumber(movie.popularity),
    genres: cleanNames(movie.genres),
    voteCount: cleanNumber(movie.vote_count),
    runtimeMinutes: cleanNumber(movie.runtime),
    directors: getDirectors(movie.credits?.crew),
    creators: [],
    networks: [],
    cast: mapMovieCast(movie.credits?.cast)
  };
}

export function mapTmdbTvDetailsToMediaDetails(show: TmdbTvDetailsResponse): MediaDetails {
  const title =
    cleanOptionalText(show.name) ?? cleanOptionalText(show.original_name) ?? 'Titre inconnu';
  const originalTitle = cleanOptionalText(show.original_name);
  const releaseDate = cleanOptionalText(show.first_air_date);
  const episodeRuntime = show.episode_run_time?.find((runtime) => runtime > 0);

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
    originCountries: show.origin_country?.filter(Boolean) ?? [],
    voteAverage: cleanNumber(show.vote_average),
    popularity: cleanNumber(show.popularity),
    genres: cleanNames(show.genres),
    voteCount: cleanNumber(show.vote_count),
    seasonsCount: cleanNumber(show.number_of_seasons),
    episodesCount: cleanNumber(show.number_of_episodes),
    episodeRuntimeMinutes: cleanNumber(episodeRuntime),
    status: cleanOptionalText(show.status),
    directors: [],
    creators: cleanNames(show.created_by),
    networks: cleanNames(show.networks),
    cast: mapTvCast(show.aggregate_credits?.cast, show.credits?.cast)
  };
}
