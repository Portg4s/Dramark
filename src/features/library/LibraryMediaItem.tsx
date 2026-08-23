import { CheckCircle2, Clock3, Film, Star, Trash2, Tv } from 'lucide-react';
import { useState } from 'react';

import type { CatalogMedia } from '@/features/catalog/types';
import { getLibraryEntryStatusLabel } from '@/features/library/hooks';
import { getTmdbImageUrl } from '@/services/tmdb/images';
import type { LibraryEntryRecord, LibraryStatus } from '@/types/media';

type LibraryMediaItemProps = {
  media: CatalogMedia;
  entry?: LibraryEntryRecord;
  mode: 'search' | 'library';
  isBusy?: boolean;
  onSetStatus: (media: CatalogMedia, status: LibraryStatus) => void;
  onRemove: (media: CatalogMedia) => void;
};

function getMediaLabel(mediaType: CatalogMedia['mediaType']): string {
  return mediaType === 'movie' ? 'Film' : 'Serie';
}

function getStatusClasses(status: LibraryStatus, isActive: boolean): string {
  if (isActive) {
    return status === 'watchlist'
      ? 'bg-viki text-white border-viki'
      : 'bg-emerald-400 text-emerald-950 border-emerald-300';
  }

  return 'border-white/12 bg-white/8 text-white hover:bg-white/14';
}

export function LibraryMediaItem({
  media,
  entry,
  mode,
  isBusy = false,
  onSetStatus,
  onRemove
}: LibraryMediaItemProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const posterUrl = getTmdbImageUrl(media.posterPath, 'w185');
  const shouldShowPoster = posterUrl && !imageFailed;
  const Icon = media.mediaType === 'movie' ? Film : Tv;
  const otherStatus: LibraryStatus = entry?.status === 'watchlist' ? 'watched' : 'watchlist';
  const statusLabel = getLibraryEntryStatusLabel(entry);

  return (
    <article className="grid grid-cols-[5.25rem_1fr] gap-3 rounded-lg border border-white/10 bg-surface p-3 shadow-panel sm:grid-cols-[6rem_1fr]">
      <div className="aspect-[2/3] overflow-hidden rounded-md border border-white/10 bg-white/10">
        {shouldShowPoster ? (
          <img
            src={posterUrl}
            alt={`Affiche de ${media.title}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(145deg,rgba(255,79,135,0.20),rgba(91,141,239,0.14))] p-2 text-center text-[0.68rem] font-semibold leading-4 text-white">
            {media.title}
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[0.68rem] font-bold uppercase text-subtle">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-1 text-white">
              <Icon aria-hidden="true" className="size-3" />
              {getMediaLabel(media.mediaType)}
            </span>
            <span>{statusLabel}</span>
          </div>
          <h2 className="line-clamp-2 text-base font-bold leading-5 text-white">{media.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-subtle">
            {media.releaseYear ? <span>{media.releaseYear}</span> : null}
            {media.originCountries[0] ? <span>{media.originCountries[0]}</span> : null}
            {media.voteAverage ? (
              <span className="inline-flex items-center gap-1">
                <Star aria-hidden="true" className="size-3" />
                {media.voteAverage.toFixed(1)}
              </span>
            ) : null}
          </div>
        </div>

        {mode === 'search' ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isBusy || entry?.status === 'watchlist'}
              onClick={() => onSetStatus(media, 'watchlist')}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-md border px-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-75 ${getStatusClasses('watchlist', entry?.status === 'watchlist')}`}
            >
              <Clock3 aria-hidden="true" className="size-4" />A regarder
            </button>
            <button
              type="button"
              disabled={isBusy || entry?.status === 'watched'}
              onClick={() => onSetStatus(media, 'watched')}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-md border px-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-75 ${getStatusClasses('watched', entry?.status === 'watched')}`}
            >
              <CheckCircle2 aria-hidden="true" className="size-4" />
              Vu
            </button>
            {entry ? (
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onRemove(media)}
                className="col-span-2 flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-transparent px-2 text-sm font-semibold text-muted transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Retirer de ma liste
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onSetStatus(media, otherStatus)}
              className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-viki px-3 text-sm font-bold text-white transition hover:bg-viki-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {otherStatus === 'watched' ? (
                <CheckCircle2 aria-hidden="true" className="size-4" />
              ) : (
                <Clock3 aria-hidden="true" className="size-4" />
              )}
              {otherStatus === 'watched' ? 'Marquer vu' : 'A regarder'}
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onRemove(media)}
              className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold text-muted transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Retirer
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
