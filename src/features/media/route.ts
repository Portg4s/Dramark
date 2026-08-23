import type { MediaType } from '@/types/media';

export type MediaDetailRouteParams = {
  mediaType?: string;
  tmdbId?: string;
};

export function isMediaType(value: string | undefined): value is MediaType {
  return value === 'movie' || value === 'tv';
}

export function createMediaDetailPath(mediaType: MediaType, tmdbId: number): string {
  return `/media/${mediaType}/${tmdbId}`;
}

export function parseMediaDetailParams(params: MediaDetailRouteParams):
  | {
      mediaType: MediaType;
      tmdbId: number;
    }
  | undefined {
  const tmdbId = Number(params.tmdbId);

  if (!isMediaType(params.mediaType) || !Number.isInteger(tmdbId) || tmdbId <= 0) {
    return undefined;
  }

  return { mediaType: params.mediaType, tmdbId };
}
