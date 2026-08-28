import type {
  MediaDetails,
  TvSeasonDetails,
  TvSeasonSummary,
  WatchProviderOffer,
  WatchProviderType
} from '@/features/catalog/types';
import type {
  TmdbAggregateCast,
  TmdbCreditCast,
  TmdbCreditCrew,
  TmdbGenre,
  TmdbImageMetadata,
  TmdbMovieDetailsResponse,
  TmdbNamedEntity,
  TmdbProductionCountry,
  TmdbTvEpisode,
  TmdbTvDetailsResponse,
  TmdbTvSeasonDetailsResponse,
  TmdbTvSeasonSummary,
  TmdbWatchProvider,
  TmdbWatchProvidersResponse
} from '@/services/tmdb/types';

const watchProviderGroups: Array<{ type: WatchProviderType; label: string }> = [
  { type: 'flatrate', label: 'Streaming' },
  { type: 'free', label: 'Gratuit' },
  { type: 'ads', label: 'Avec pub' },
  { type: 'rent', label: 'Location' },
  { type: 'buy', label: 'Achat' }
];

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

function scoreLogo(logo: TmdbImageMetadata): number {
  const language = logo.iso_639_1;
  const languageScore =
    language === 'fr' ? 30 : language === 'en' ? 20 : language === null ? 10 : 0;
  return languageScore + (logo.vote_average ?? 0);
}

function pickLogoPath(logos: TmdbImageMetadata[] | null | undefined): string | undefined {
  return (
    [...(logos ?? [])]
      .filter((logo) => cleanOptionalText(logo.file_path))
      .sort((first, second) => scoreLogo(second) - scoreLogo(first))[0]?.file_path ?? undefined
  );
}

function pickGalleryBackdrops(backdrops: TmdbImageMetadata[] | null | undefined): string[] {
  return [...(backdrops ?? [])]
    .filter((backdrop) => cleanOptionalText(backdrop.file_path) && (backdrop.width ?? 0) >= 700)
    .sort((first, second) => (second.vote_average ?? 0) - (first.vote_average ?? 0))
    .map((backdrop) => backdrop.file_path)
    .filter((path): path is string => Boolean(path))
    .slice(0, 6);
}

function mapWatchProvider(
  provider: TmdbWatchProvider,
  type: WatchProviderType,
  label: string
): WatchProviderOffer | undefined {
  const providerId = cleanNumber(provider.provider_id);
  const providerName = cleanOptionalText(provider.provider_name);

  if (providerId === undefined || !providerName) {
    return undefined;
  }

  return {
    type,
    label,
    providerId,
    providerName,
    logoPath: cleanOptionalText(provider.logo_path),
    displayPriority: cleanNumber(provider.display_priority)
  };
}

function mapWatchProviders(
  watchProviders: TmdbWatchProvidersResponse | null | undefined
): WatchProviderOffer[] {
  const frenchProviders = watchProviders?.results?.FR;

  if (!frenchProviders) {
    return [];
  }

  return watchProviderGroups.flatMap(({ type, label }) =>
    [...(frenchProviders[type] ?? [])]
      .sort((first, second) => (first.display_priority ?? 999) - (second.display_priority ?? 999))
      .map((provider) => mapWatchProvider(provider, type, label))
      .filter((provider): provider is WatchProviderOffer => Boolean(provider))
  );
}

function mapTvSeasonSummary(season: TmdbTvSeasonSummary): TvSeasonSummary | undefined {
  const seasonNumber = cleanNumber(season.season_number);

  if (seasonNumber === undefined) {
    return undefined;
  }

  return {
    tmdbId: season.id,
    seasonNumber,
    episodeCount: cleanNumber(season.episode_count) ?? 0,
    name:
      cleanOptionalText(season.name) ??
      (seasonNumber === 0 ? 'Spéciaux' : `Saison ${seasonNumber}`),
    airDate: cleanOptionalText(season.air_date),
    posterPath: cleanOptionalText(season.poster_path)
  };
}

function mapTvEpisode(
  episode: TmdbTvEpisode,
  fallbackSeasonNumber?: number
): TvSeasonDetails['episodes'][number] | undefined {
  const episodeNumber = cleanNumber(episode.episode_number);

  if (episodeNumber === undefined) {
    return undefined;
  }

  return {
    tmdbId: episode.id,
    seasonNumber: cleanNumber(episode.season_number) ?? fallbackSeasonNumber ?? 0,
    episodeNumber,
    name: cleanOptionalText(episode.name) ?? `Épisode ${episodeNumber}`,
    overview: cleanOptionalText(episode.overview),
    airDate: cleanOptionalText(episode.air_date),
    stillPath: cleanOptionalText(episode.still_path),
    runtimeMinutes: cleanNumber(episode.runtime)
  };
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
    tagline: cleanOptionalText(movie.tagline),
    logoPath: pickLogoPath(movie.images?.logos),
    galleryBackdropPaths: pickGalleryBackdrops(movie.images?.backdrops),
    genres: cleanNames(movie.genres),
    voteCount: cleanNumber(movie.vote_count),
    watchProviders: mapWatchProviders(movie['watch/providers']),
    runtimeMinutes: cleanNumber(movie.runtime),
    directors: getDirectors(movie.credits?.crew),
    seasons: [],
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
  const seasons = [...(show.seasons ?? [])]
    .map(mapTvSeasonSummary)
    .filter((season): season is TvSeasonSummary => Boolean(season))
    .sort((first, second) => first.seasonNumber - second.seasonNumber);

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
    tagline: cleanOptionalText(show.tagline),
    logoPath: pickLogoPath(show.images?.logos),
    galleryBackdropPaths: pickGalleryBackdrops(show.images?.backdrops),
    genres: cleanNames(show.genres),
    voteCount: cleanNumber(show.vote_count),
    watchProviders: mapWatchProviders(show['watch/providers']),
    seasonsCount: cleanNumber(show.number_of_seasons),
    episodesCount: cleanNumber(show.number_of_episodes),
    episodeRuntimeMinutes: cleanNumber(episodeRuntime),
    seasons,
    status: cleanOptionalText(show.status),
    directors: [],
    creators: cleanNames(show.created_by),
    networks: cleanNames(show.networks),
    cast: mapTvCast(show.aggregate_credits?.cast, undefined),
    lastAirDate: cleanOptionalText(show.last_air_date),
    nextAirDate: cleanOptionalText(show.next_episode_to_air?.air_date),
    nextEpisodeToAir: show.next_episode_to_air ? mapTvEpisode(show.next_episode_to_air) : undefined
  };
}

export function mapTmdbTvSeasonDetails(response: TmdbTvSeasonDetailsResponse): TvSeasonDetails {
  const seasonNumber = cleanNumber(response.season_number) ?? 0;
  const episodes: TvSeasonDetails['episodes'] = [];

  for (const episode of response.episodes ?? []) {
    const episodeNumber = cleanNumber(episode.episode_number);

    if (episodeNumber === undefined) {
      continue;
    }

    episodes.push({
      tmdbId: episode.id,
      seasonNumber: cleanNumber(episode.season_number) ?? seasonNumber,
      episodeNumber,
      name: cleanOptionalText(episode.name) ?? `Épisode ${episodeNumber}`,
      overview: cleanOptionalText(episode.overview),
      airDate: cleanOptionalText(episode.air_date),
      stillPath: cleanOptionalText(episode.still_path),
      runtimeMinutes: cleanNumber(episode.runtime)
    });
  }

  return {
    seasonNumber,
    name:
      cleanOptionalText(response.name) ??
      (seasonNumber === 0 ? 'Spéciaux' : `Saison ${seasonNumber}`),
    episodes: episodes.sort((first, second) => first.episodeNumber - second.episodeNumber)
  };
}
