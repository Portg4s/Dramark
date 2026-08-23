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
import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

import { ActionMenu } from '@/components/ui/ActionMenu';
import { MediaPoster } from '@/components/ui/MediaPoster';
import type { CatalogMedia } from '@/features/catalog/types';
import { getLibraryEntryStatusLabel } from '@/features/library/hooks';
import { createMediaDetailPath } from '@/features/media/route';
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
  return mediaType === 'movie' ? 'Film' : 'Série';
}

function getPrimaryActionLabel(status: LibraryStatus): string {
  return status === 'watched' ? 'Marquer vu' : 'À regarder';
}

function StatusButton({
  active,
  children,
  disabled,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'pressable focus-ring flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-55',
        active
          ? 'bg-brand text-white shadow-[0_10px_24px_rgba(89,183,255,0.26)]'
          : 'bg-white/9 text-white hover:bg-white/14'
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function LibraryMediaItem({
  media,
  entry,
  mode,
  isBusy = false,
  onSetStatus,
  onRemove
}: LibraryMediaItemProps) {
  const navigate = useNavigate();
  const Icon = media.mediaType === 'movie' ? Film : Tv;
  const otherStatus: LibraryStatus = entry?.status === 'watchlist' ? 'watched' : 'watchlist';
  const statusLabel = getLibraryEntryStatusLabel(entry);
  const detailPath = createMediaDetailPath(media.mediaType, media.tmdbId);

  return (
    <article className="media-enter group relative grid grid-cols-[5.6rem_1fr] gap-3 rounded-[1.35rem] bg-white/[0.055] p-2.5 shadow-[0_16px_38px_rgba(0,0,0,0.26)] transition duration-200 hover:bg-white/[0.075] sm:grid-cols-[6.2rem_1fr]">
      <NavLink
        to={detailPath}
        className="focus-ring rounded-[1.05rem]"
        aria-label={`Ouvrir la fiche de ${media.title}`}
      >
        <MediaPoster title={media.title} posterPath={media.posterPath} size="w185" />
      </NavLink>

      <div className="min-w-0 py-1 pr-1">
        <NavLink to={detailPath} className="focus-ring block rounded-lg">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium text-subtle">
            <span className="inline-flex items-center gap-1 text-muted">
              <Icon aria-hidden="true" className="size-3.5" />
              {getMediaLabel(media.mediaType)}
            </span>
            {media.releaseYear ? <span>{media.releaseYear}</span> : null}
            {media.originCountries[0] ? <span>{media.originCountries[0]}</span> : null}
            {media.voteAverage ? (
              <span className="inline-flex items-center gap-1 text-brand-soft">
                <Star aria-hidden="true" className="size-3.5 fill-current" />
                {media.voteAverage.toFixed(1)}
              </span>
            ) : null}
          </div>
          <h2 className="line-clamp-2 text-[1.02rem] font-bold leading-5 text-white">
            {media.title}
          </h2>
          <p className="mt-1 text-xs font-medium text-subtle">{statusLabel}</p>
        </NavLink>

        {mode === 'search' ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <StatusButton
              active={entry?.status === 'watchlist'}
              disabled={isBusy || entry?.status === 'watchlist'}
              onClick={() => onSetStatus(media, 'watchlist')}
            >
              <Clock3 aria-hidden="true" className="size-4" />À regarder
            </StatusButton>
            <StatusButton
              active={entry?.status === 'watched'}
              disabled={isBusy || entry?.status === 'watched'}
              onClick={() => onSetStatus(media, 'watched')}
            >
              <CheckCircle2 aria-hidden="true" className="size-4" />
              Vu
            </StatusButton>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onSetStatus(media, otherStatus)}
              className="pressable focus-ring flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(89,183,255,0.24)] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {otherStatus === 'watched' ? (
                <CheckCircle2 aria-hidden="true" className="size-4" />
              ) : (
                <Clock3 aria-hidden="true" className="size-4" />
              )}
              {getPrimaryActionLabel(otherStatus)}
            </button>
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
                  onSelect: () => onRemove(media)
                }
              ]}
              trigger={({ ref, isOpen, toggle }) => (
                <button
                  ref={ref}
                  type="button"
                  disabled={isBusy}
                  onClick={toggle}
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  className="pressable focus-ring flex size-11 shrink-0 items-center justify-center rounded-full bg-white/8 text-muted hover:bg-white/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
                  aria-label={`Options pour ${media.title}`}
                >
                  <MoreHorizontal aria-hidden="true" className="size-5" />
                </button>
              )}
            />
          </div>
        )}

        {mode === 'search' && entry ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onRemove(media)}
            className="pressable focus-ring mt-2 min-h-9 rounded-full px-3 text-xs font-semibold text-subtle hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
          >
            Retirer de ma liste
          </button>
        ) : null}
      </div>
    </article>
  );
}
