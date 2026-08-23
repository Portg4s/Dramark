import type { MediaIdentity } from '@/types/media';

export function createMediaKey({ mediaType, tmdbId }: MediaIdentity): string {
  return `${mediaType}:${tmdbId}`;
}
