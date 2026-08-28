export type TmdbPosterSize = 'w185' | 'w342' | 'w500';
export type TmdbBackdropSize = 'w780' | 'w1280';
export type TmdbLogoSize = 'w300' | 'w500';
export type TmdbProviderLogoSize = 'w45' | 'w92';
export type TmdbImageSize = TmdbPosterSize | TmdbBackdropSize | TmdbLogoSize | TmdbProviderLogoSize;

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export function getTmdbImageUrl(path: string | undefined, size: TmdbImageSize): string | undefined {
  const cleanPath = path?.trim();

  if (!cleanPath) {
    return undefined;
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}/${cleanPath.replace(/^\/+/, '')}`;
}
