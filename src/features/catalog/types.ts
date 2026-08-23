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
