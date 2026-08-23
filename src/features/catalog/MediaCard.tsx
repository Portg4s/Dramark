import { AlertTriangle, Clapperboard, Film, Tv } from 'lucide-react';
import { useState } from 'react';

import type { CatalogMedia } from '@/features/catalog/types';
import { getTmdbImageUrl } from '@/services/tmdb/images';

type MediaCardProps = {
  media: CatalogMedia;
};

function getMediaLabel(mediaType: CatalogMedia['mediaType']): string {
  return mediaType === 'movie' ? 'Film' : 'Serie';
}

export function MediaCard({ media }: MediaCardProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const posterUrl = getTmdbImageUrl(media.posterPath, 'w342');
  const shouldShowPoster = posterUrl && imageState !== 'error';
  const Icon = media.mediaType === 'movie' ? Film : Tv;

  return (
    <article className="group w-36 shrink-0 sm:w-40 lg:w-auto">
      <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-white/10 bg-white/10 shadow-poster">
        {shouldShowPoster ? (
          <img
            src={posterUrl}
            alt={`Affiche de ${media.title}`}
            loading="lazy"
            decoding="async"
            className={[
              'h-full w-full object-cover transition duration-300',
              imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
            ].join(' ')}
            onLoad={() => setImageState('loaded')}
            onError={() => setImageState('error')}
          />
        ) : null}

        {imageState === 'loading' && posterUrl ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/18 via-white/8 to-transparent"
          />
        ) : null}

        {!shouldShowPoster ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[linear-gradient(145deg,rgba(255,79,135,0.22),rgba(91,141,239,0.14),rgba(255,255,255,0.06))] p-4 text-center">
            {imageState === 'error' ? (
              <AlertTriangle aria-hidden="true" className="size-7 text-viki-soft" />
            ) : (
              <Clapperboard aria-hidden="true" className="size-8 text-viki-soft" />
            )}
            <span className="line-clamp-3 text-xs font-semibold leading-5 text-white">
              {media.title}
            </span>
          </div>
        ) : null}

        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/62 px-2 py-1 text-[0.65rem] font-bold text-white backdrop-blur">
          <Icon aria-hidden="true" className="size-3" />
          {getMediaLabel(media.mediaType)}
        </div>
      </div>

      <div className="mt-2 min-h-12">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-white">{media.title}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs font-medium text-subtle">
          {media.releaseYear ? <span>{media.releaseYear}</span> : null}
          {media.originCountries[0] ? <span>{media.originCountries[0]}</span> : null}
        </div>
      </div>
    </article>
  );
}
