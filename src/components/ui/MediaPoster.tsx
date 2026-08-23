import { Clapperboard } from 'lucide-react';
import { useState } from 'react';

import { getTmdbImageUrl, type TmdbImageSize } from '@/services/tmdb/images';

type MediaPosterProps = {
  title: string;
  posterPath?: string;
  size?: TmdbImageSize;
  className?: string;
  imageClassName?: string;
  loading?: 'lazy' | 'eager';
};

export function MediaPoster({
  title,
  posterPath,
  size = 'w342',
  className = '',
  imageClassName = '',
  loading = 'lazy'
}: MediaPosterProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const posterUrl = getTmdbImageUrl(posterPath, size);
  const shouldShowPoster = posterUrl && imageState !== 'error';

  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-[1.05rem] bg-white/8 shadow-poster ${className}`}
    >
      {shouldShowPoster ? (
        <img
          src={posterUrl}
          alt={`Affiche de ${title}`}
          loading={loading}
          decoding="async"
          className={[
            'h-full w-full object-cover transition duration-300',
            imageState === 'loaded' ? 'opacity-100' : 'opacity-0',
            imageClassName
          ].join(' ')}
          onLoad={() => setImageState('loaded')}
          onError={() => setImageState('error')}
        />
      ) : null}

      {posterUrl && imageState === 'loading' ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-[linear-gradient(115deg,rgba(255,255,255,0.08),rgba(255,79,135,0.12),rgba(113,215,255,0.07))]"
        />
      ) : null}

      {!shouldShowPoster ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[linear-gradient(145deg,rgba(255,79,135,0.22),rgba(113,215,255,0.10),rgba(255,255,255,0.06))] p-4 text-center">
          <Clapperboard aria-hidden="true" className="size-8 text-viki-soft" />
          <span className="line-clamp-4 text-xs font-semibold leading-5 text-white">{title}</span>
        </div>
      ) : null}

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent"
      />
    </div>
  );
}
