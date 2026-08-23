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
  mediaType: MediaType;
  providerId: number;
  page: number;
  totalPages: number;
  totalResults: number;
  results: CatalogMedia[];
};

export type RakutenVikiProviderIds = Partial<Record<MediaType, number>>;

export type ProviderResolutionDiagnostic = {
  mediaType: MediaType;
  providerFound: boolean;
  providerId?: number;
  providerName?: string;
  providerCount: number;
};

export type RakutenVikiProviderResolution = {
  providerIds: RakutenVikiProviderIds;
  diagnostics: ProviderResolutionDiagnostic[];
};
