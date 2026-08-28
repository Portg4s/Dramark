import type { MediaType } from '@/types/media';

export type CatalogMedia = {
  mediaType: MediaType;
  tmdbId: number;
  title: string;
  originalTitle?: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  releaseYear?: number;
  originalLanguage?: string;
  originCountries: string[];
  voteAverage?: number;
  popularity?: number;
};

export type CatalogPage = {
  page: number;
  totalPages: number;
  totalResults: number;
  results: CatalogMedia[];
};

export type MediaCastMember = {
  id: number;
  name: string;
  character?: string;
  profilePath?: string;
};

export type TvSeasonSummary = {
  tmdbId: number;
  seasonNumber: number;
  episodeCount: number;
  name: string;
  airDate?: string;
  posterPath?: string;
};

export type TvEpisode = {
  tmdbId: number;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview?: string;
  airDate?: string;
  stillPath?: string;
  runtimeMinutes?: number;
};

export type TvSeasonDetails = {
  seasonNumber: number;
  name: string;
  episodes: TvEpisode[];
};

export type WatchProviderType = 'flatrate' | 'free' | 'ads' | 'rent' | 'buy';

export type WatchProviderOffer = {
  type: WatchProviderType;
  label: string;
  providerId: number;
  providerName: string;
  logoPath?: string;
  displayPriority?: number;
};

export type MediaDetails = CatalogMedia & {
  tagline?: string;
  logoPath?: string;
  galleryBackdropPaths: string[];
  genres: string[];
  voteCount?: number;
  watchProviders: WatchProviderOffer[];
  cast: MediaCastMember[];
  runtimeMinutes?: number;
  directors: string[];
  seasonsCount?: number;
  episodesCount?: number;
  episodeRuntimeMinutes?: number;
  seasons: TvSeasonSummary[];
  status?: string;
  creators: string[];
  networks: string[];
  lastAirDate?: string;
  nextAirDate?: string;
};
