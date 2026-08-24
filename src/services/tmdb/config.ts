export const TMDB_REGION = 'FR';
export const TMDB_LANGUAGE = 'fr-FR';
export const TMDB_API_BASE_URL = '/api/tmdb';

export const rakutenVikiProviderTarget = {
  region: TMDB_REGION,
  language: TMDB_LANGUAGE,
  canonicalName: 'Rakuten Viki',
  acceptedNames: ['rakuten viki', 'viki']
} as const;

export type TmdbRuntimeConfig = {
  isConfigured: boolean;
};

export const tmdbRuntimeConfig: TmdbRuntimeConfig = {
  isConfigured: true
};
