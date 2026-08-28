import { Film, Star, Tv } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { NavLink } from 'react-router-dom';

import { MediaPoster } from '@/components/ui/MediaPoster';
import type { CatalogMedia } from '@/features/catalog/types';
import { getLibraryEntryProgress, getLibraryEntryStatusLabel } from '@/features/library/hooks';
import { createMediaDetailPath } from '@/features/media/route';
import type { LibraryEntryRecord } from '@/types/media';
import { listSpring } from '@/utils/motion';

type MediaCardProps = {
  media: CatalogMedia;
  entry?: LibraryEntryRecord;
};

function getMediaLabel(mediaType: CatalogMedia['mediaType']): string {
  return mediaType === 'movie' ? 'Film' : 'Série';
}

export function MediaCard({ media, entry }: MediaCardProps) {
  const reducedMotion = useReducedMotion();
  const Icon = media.mediaType === 'movie' ? Film : Tv;
  const statusLabel = entry ? getLibraryEntryStatusLabel(entry) : undefined;
  const progress = getLibraryEntryProgress(entry);
  const showProgress = media.mediaType === 'tv' && progress.isPartial;

  return (
    <motion.div
      layout
      className="w-32 shrink-0 sm:w-36"
      whileTap={reducedMotion ? undefined : { scale: 0.982 }}
      transition={listSpring}
    >
      <NavLink
        to={createMediaDetailPath(media.mediaType, media.tmdbId)}
        className="group block outline-none"
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
            {media.voteAverage ? (
              <span className="inline-flex items-center gap-1 text-cyan-soft">
                <Star aria-hidden="true" className="size-3 fill-current" />
                {media.voteAverage.toFixed(1)}
              </span>
            ) : null}
            {statusLabel ? <span className="text-brand-soft">{statusLabel}</span> : null}
            {showProgress ? (
              <span>
                {progress.watched} / {progress.total}
              </span>
            ) : null}
          </div>
          {showProgress ? (
            <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.span
                className="block h-full origin-left rounded-full bg-brand"
                initial={false}
                animate={{ scaleX: progress.ratio }}
                transition={reducedMotion ? { duration: 0.01 } : listSpring}
              />
            </span>
          ) : null}
        </div>
      </NavLink>
    </motion.div>
  );
}
