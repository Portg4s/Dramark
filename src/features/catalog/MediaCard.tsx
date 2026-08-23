import { Film, Tv } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { MediaPoster } from '@/components/ui/MediaPoster';
import type { CatalogMedia } from '@/features/catalog/types';
import { createMediaDetailPath } from '@/features/media/route';
import type { LibraryEntryRecord } from '@/types/media';

type MediaCardProps = {
  media: CatalogMedia;
  entry?: LibraryEntryRecord;
};

function getMediaLabel(mediaType: CatalogMedia['mediaType']): string {
  return mediaType === 'movie' ? 'Film' : 'Série';
}

function getStatusLabel(entry: LibraryEntryRecord | undefined): string | undefined {
  if (!entry) {
    return undefined;
  }

  return entry.status === 'watchlist' ? 'À regarder' : 'Vu';
}

export function MediaCard({ media, entry }: MediaCardProps) {
  const Icon = media.mediaType === 'movie' ? Film : Tv;
  const statusLabel = getStatusLabel(entry);

  return (
    <NavLink
      to={createMediaDetailPath(media.mediaType, media.tmdbId)}
      className="group block w-32 shrink-0 outline-none sm:w-36"
      aria-label={`Ouvrir la fiche de ${media.title}`}
    >
      <MediaPoster
        title={media.title}
        posterPath={media.posterPath}
        className="transition duration-300 group-hover:scale-[1.025] group-focus-visible:ring-2 group-focus-visible:ring-brand group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-app"
      />
      <div className="mt-2 min-h-14">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-white">{media.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.72rem] font-medium text-subtle">
          <span className="inline-flex items-center gap-1 text-muted">
            <Icon aria-hidden="true" className="size-3" />
            {getMediaLabel(media.mediaType)}
          </span>
          {media.releaseYear ? <span>{media.releaseYear}</span> : null}
          {statusLabel ? <span className="text-brand-soft">{statusLabel}</span> : null}
        </div>
      </div>
    </NavLink>
  );
}
