import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Film,
  MoreHorizontal,
  Star,
  Trash2,
  Tv
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { ActionMenu } from '@/components/ui/ActionMenu';
import { MediaPoster } from '@/components/ui/MediaPoster';
import type { CatalogMedia } from '@/features/catalog/types';
import { getLibraryEntryProgress, getLibraryEntryStatusLabel } from '@/features/library/hooks';
import { createMediaDetailPath } from '@/features/media/route';
import type { LibraryEntryRecord, LibraryStatus } from '@/types/media';
import { listSpring, quickFade } from '@/utils/motion';

type LibraryMediaItemProps = {
  media: CatalogMedia;
  entry?: LibraryEntryRecord;
  mode: 'search' | 'library';
  isBusy?: boolean;
  motionIndex?: number;
  onSetStatus: (
    media: CatalogMedia,
    status: LibraryStatus,
    previousEntry?: LibraryEntryRecord
  ) => void;
  onRemove: (media: CatalogMedia, previousEntry?: LibraryEntryRecord) => void;
};

function getMediaLabel(mediaType: CatalogMedia['mediaType']): string {
  return mediaType === 'movie' ? 'Film' : 'Série';
}

function getPrimaryActionLabel(status: LibraryStatus): string {
  return status === 'watched' ? 'Marquer vu' : 'À regarder';
}

function formatNextEpisodeLabel(
  progress: ReturnType<typeof getLibraryEntryProgress>
): string | undefined {
  if (!progress.nextEpisode) {
    return undefined;
  }

  return `Saison ${progress.nextEpisode.seasonNumber} · Épisode ${progress.nextEpisode.episodeNumber}`;
}

function formatRemainingEpisodes(
  progress: ReturnType<typeof getLibraryEntryProgress>
): string | undefined {
  const remaining = progress.total - progress.watched;

  if (remaining <= 0) {
    return undefined;
  }

  return `${remaining} épisode${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`;
}

function StatusButton({
  active,
  ariaLabel,
  children,
  disabled,
  onClick
}: {
  active: boolean;
  ariaLabel?: string;
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      whileTap={reducedMotion || disabled ? undefined : { scale: 0.975 }}
      className={[
        'pressable focus-ring flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-55',
        active
          ? 'bg-brand text-white shadow-[0_10px_24px_rgba(89,183,255,0.26)]'
          : 'bg-surface-2/50 text-white hover:bg-surface-2/75'
      ].join(' ')}
    >
      {children}
    </motion.button>
  );
}

export function LibraryMediaItem({
  media,
  entry,
  mode,
  isBusy = false,
  motionIndex = 0,
  onSetStatus,
  onRemove
}: LibraryMediaItemProps) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const Icon = media.mediaType === 'movie' ? Film : Tv;
  const otherStatus: LibraryStatus = entry?.status === 'watchlist' ? 'watched' : 'watchlist';
  const statusLabel = getLibraryEntryStatusLabel(entry);
  const progress = getLibraryEntryProgress(entry);
  const showProgress = media.mediaType === 'tv' && progress.isPartial;
  const nextEpisodeLabel = showProgress ? formatNextEpisodeLabel(progress) : undefined;
  const remainingEpisodesLabel = showProgress ? formatRemainingEpisodes(progress) : undefined;
  const detailPath = createMediaDetailPath(media.mediaType, media.tmdbId);
  const exitX = entry?.status === 'watchlist' ? 28 : -28;

  return (
    <motion.article
      layout
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={
        reducedMotion
          ? { opacity: 0 }
          : { opacity: 0, x: mode === 'library' ? exitX : 0, scale: 0.985 }
      }
      transition={{
        ...listSpring,
        delay: mode === 'search' ? Math.min(motionIndex, 6) * 0.025 : 0
      }}
      className="group relative grid grid-cols-[5.6rem_1fr] gap-3 rounded-[1.35rem] bg-surface/64 p-2.5 shadow-[0_16px_38px_rgba(0,0,0,0.26)] transition-colors duration-200 hover:bg-surface-2/54 sm:grid-cols-[6.2rem_1fr]"
    >
      <motion.div whileTap={reducedMotion ? undefined : { scale: 0.982 }}>
        <NavLink
          to={detailPath}
          className="focus-ring block rounded-[1.05rem]"
          aria-label={`Ouvrir la fiche de ${media.title}`}
        >
          <MediaPoster title={media.title} posterPath={media.posterPath} size="w185" />
        </NavLink>
      </motion.div>

      <div className="min-w-0 py-1 pr-1">
        <motion.div whileTap={reducedMotion ? undefined : { scale: 0.992 }}>
          <NavLink to={detailPath} className="focus-ring block rounded-lg">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium text-subtle">
              <span className="inline-flex items-center gap-1 text-muted">
                <Icon aria-hidden="true" className="size-3.5" />
                {getMediaLabel(media.mediaType)}
              </span>
              {media.releaseYear ? <span>{media.releaseYear}</span> : null}
              {media.originCountries[0] ? <span>{media.originCountries[0]}</span> : null}
              {media.voteAverage ? (
                <span className="inline-flex items-center gap-1 text-cyan-soft">
                  <Star aria-hidden="true" className="size-3.5 fill-current" />
                  {media.voteAverage.toFixed(1)}
                </span>
              ) : null}
            </div>
            <h2 className="line-clamp-2 text-[1.02rem] font-bold leading-5 text-white">
              {media.title}
            </h2>
            <motion.div
              key={`${statusLabel}-${progress.watched}-${progress.total}`}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={quickFade}
              className="mt-1 space-y-1"
            >
              <p className="text-xs font-medium text-subtle">
                <span className={showProgress ? 'text-brand-soft' : undefined}>{statusLabel}</span>
                {showProgress ? (
                  <span className="text-subtle">
                    {' '}
                    · {progress.watched} / {progress.total}
                  </span>
                ) : null}
              </p>
              {showProgress ? (
                <>
                  {nextEpisodeLabel ? (
                    <p className="text-xs font-semibold text-white/82">{nextEpisodeLabel}</p>
                  ) : null}
                  {remainingEpisodesLabel ? (
                    <p className="text-xs text-muted">{remainingEpisodesLabel}</p>
                  ) : null}
                  <span className="block h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.span
                      className="block h-full origin-left rounded-full bg-brand"
                      initial={false}
                      animate={{ scaleX: progress.ratio }}
                      transition={reducedMotion ? { duration: 0.01 } : quickFade}
                    />
                  </span>
                </>
              ) : null}
            </motion.div>
          </NavLink>
        </motion.div>

        {mode === 'search' ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <StatusButton
              active={entry?.status === 'watchlist'}
              ariaLabel="Ajouter aux titres a regarder"
              disabled={isBusy || entry?.status === 'watchlist'}
              onClick={() => onSetStatus(media, 'watchlist', entry)}
            >
              <Clock3 aria-hidden="true" className="size-4" />
              Liste
            </StatusButton>
            <StatusButton
              active={entry?.status === 'watched'}
              ariaLabel="Marquer comme vu"
              disabled={isBusy || entry?.status === 'watched'}
              onClick={() => onSetStatus(media, 'watched', entry)}
            >
              <CheckCircle2 aria-hidden="true" className="size-4" />
              Vu
            </StatusButton>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <motion.button
              type="button"
              disabled={isBusy}
              onClick={() => onSetStatus(media, otherStatus, entry)}
              whileTap={reducedMotion || isBusy ? undefined : { scale: 0.975 }}
              className="pressable focus-ring flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(89,183,255,0.24)] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {otherStatus === 'watched' ? (
                <CheckCircle2 aria-hidden="true" className="size-4" />
              ) : (
                <Clock3 aria-hidden="true" className="size-4" />
              )}
              {getPrimaryActionLabel(otherStatus)}
            </motion.button>
            <ActionMenu
              label={`Options pour ${media.title}`}
              items={[
                {
                  label: 'Ouvrir la fiche',
                  icon: <ExternalLink aria-hidden="true" className="size-4" />,
                  onSelect: () => navigate(detailPath)
                },
                {
                  label: 'Retirer de ma liste',
                  icon: <Trash2 aria-hidden="true" className="size-4" />,
                  destructive: true,
                  onSelect: () => onRemove(media, entry)
                }
              ]}
              trigger={({ ref, isOpen, toggle }) => (
                <motion.button
                  ref={ref}
                  type="button"
                  disabled={isBusy}
                  onClick={toggle}
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  whileTap={reducedMotion || isBusy ? undefined : { scale: 0.965 }}
                  className="pressable focus-ring flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-2/50 text-muted hover:bg-surface-2/75 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
                  aria-label={`Options pour ${media.title}`}
                >
                  <MoreHorizontal aria-hidden="true" className="size-5" />
                </motion.button>
              )}
            />
          </div>
        )}

        {mode === 'search' && entry ? (
          <motion.button
            type="button"
            disabled={isBusy}
            onClick={() => onRemove(media, entry)}
            whileTap={reducedMotion || isBusy ? undefined : { scale: 0.98 }}
            className="pressable focus-ring mt-2 min-h-9 rounded-full px-3 text-xs font-semibold text-subtle hover:bg-surface-2/55 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
          >
            Retirer de ma liste
          </motion.button>
        ) : null}
      </div>
    </motion.article>
  );
}
