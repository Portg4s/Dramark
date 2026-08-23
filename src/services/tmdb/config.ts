import { z } from 'zod';

export const TMDB_REGION = 'FR';
export const TMDB_LANGUAGE = 'fr-FR';
export const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

export const rakutenVikiProviderTarget = {
  region: TMDB_REGION,
  language: TMDB_LANGUAGE,
  canonicalName: 'Rakuten Viki',
  acceptedNames: ['rakuten viki', 'viki']
} as const;

const tmdbEnvSchema = z
  .object({
    VITE_TMDB_ACCESS_TOKEN: z.string().trim().min(1).optional()
  })
  .passthrough();

export type TmdbRuntimeConfig = {
  accessToken?: string;
  isConfigured: boolean;
};

export function readTmdbRuntimeConfig(env: Record<string, unknown>): TmdbRuntimeConfig {
  const parsed = tmdbEnvSchema.safeParse(env);
  const accessToken = parsed.success ? parsed.data.VITE_TMDB_ACCESS_TOKEN : undefined;

  return {
    accessToken,
    isConfigured: Boolean(accessToken)
  };
}

export const tmdbRuntimeConfig = readTmdbRuntimeConfig(import.meta.env);
