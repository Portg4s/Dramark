import { ArrowLeft, CheckCircle2, Clock3, Film, Star, Trash2, Tv, UserRound } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { MediaPoster } from '@/components/ui/MediaPoster';
import { MediaCard } from '@/features/catalog/MediaCard';
import type { CatalogMedia, MediaDetails, WatchProviderOffer } from '@/features/catalog/types';
import { useLibraryIndex, useLibraryMediaActions } from '@/features/library/hooks';
import { useMediaDetails, useSimilarMedia } from '@/features/media/hooks';
import { TvProgressSection } from '@/features/media/TvProgressSection';
import { parseMediaDetailParams } from '@/features/media/route';
import { tmdbRuntimeConfig } from '@/services/tmdb/config';
import { getTmdbImageUrl } from '@/services/tmdb/images';
import type { LibraryEntryRecord, LibraryStatus } from '@/types/media';
import { formatCountryName, formatLanguageName } from '@/utils/displayNames';
import { createMediaKey } from '@/utils/mediaKey';
import { motionEase, quickFade } from '@/utils/motion';

function getMediaLabel(mediaType: CatalogMedia['mediaType']): string {
  return mediaType === 'movie' ? 'Film' : 'Série';
}

function formatRuntime(minutes: number | undefined): string | undefined {
  if (!minutes) {
    return undefined;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return rest ? `${hours} h ${rest}` : `${hours} h`;
}

function formatDate(date: string | undefined): string | undefined {
  if (!date) {
    return undefined;
  }

  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(date));
}

function translateTvStatus(status: string | undefined): string | undefined {
  const statusMap: Record<string, string> = {
    Ended: 'Terminée',
    Returning: 'En diffusion',
    'Returning Series': 'En diffusion',
    Planned: 'Prévue',
    Pilot: 'Pilote',
    Canceled: 'Annulée',
    Cancelled: 'Annulée',
    'In Production': 'En production'
  };

  return status ? (statusMap[status] ?? status) : undefined;
}

function formatVoteSummary(
  voteAverage: number | undefined,
  voteCount: number | undefined
): string | undefined {
  if (!voteAverage) {
    return undefined;
  }

  if (!voteCount || voteCount < 10) {
    return `${voteAverage.toFixed(1)} · peu d'avis`;
  }

  return `${voteAverage.toFixed(1)} · ${voteCount.toLocaleString('fr-FR')} votes`;
}

function buildInfoLine(details: MediaDetails): string[] {
  const countryName = formatCountryName(details.originCountries[0]);
  const values = [
    details.releaseYear ? String(details.releaseYear) : undefined,
    countryName,
    details.mediaType === 'movie' ? formatRuntime(details.runtimeMinutes) : undefined,
    details.mediaType === 'tv' && details.episodesCount
      ? `${details.episodesCount} épisodes`
      : undefined,
    details.mediaType === 'tv' && details.seasonsCount
      ? `${details.seasonsCount} saison${details.seasonsCount > 1 ? 's' : ''}`
      : undefined,
    details.mediaType === 'tv' && details.episodeRuntimeMinutes
      ? `~${details.episodeRuntimeMinutes} min / épisode`
      : undefined
  ];

  return values.filter((value): value is string => Boolean(value));
}

function buildBroadcastLine(details: MediaDetails): string | undefined {
  if (details.mediaType !== 'tv') {
    return undefined;
  }

  const first = formatDate(details.releaseDate);
  const last = formatDate(details.lastAirDate);
  const next = formatDate(details.nextAirDate);

  if (next) {
    return `Prochaine diffusion : ${next}`;
  }

  if (first && last && first !== last) {
    return `Diffusée du ${first} au ${last}`;
  }

  if (first) {
    return `Première diffusion : ${first}`;
  }

  return undefined;
}

function ActionButton({
  active,
  children,
  disabled,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'pressable focus-ring flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-black disabled:cursor-not-allowed disabled:opacity-55',
        active
          ? 'bg-brand text-white shadow-[0_16px_34px_rgba(89,183,255,0.30)]'
          : 'bg-white/10 text-white hover:bg-white/15'
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function PersonalActions({
  details,
  entry,
  isBusy,
  onSetStatus,
  onRemove
}: {
  details: MediaDetails;
  entry?: LibraryEntryRecord;
  isBusy: boolean;
  onSetStatus: (
    media: CatalogMedia,
    status: LibraryStatus,
    previousEntry?: LibraryEntryRecord
  ) => void;
  onRemove: (media: CatalogMedia, previousEntry?: LibraryEntryRecord) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          active={entry?.status === 'watchlist'}
          disabled={isBusy}
          onClick={() => {
            if (entry?.status !== 'watchlist') {
              onSetStatus(details, 'watchlist', entry);
            }
          }}
        >
          <Clock3 aria-hidden="true" className="size-4" />À regarder
        </ActionButton>
        <ActionButton
          active={entry?.status === 'watched'}
          disabled={isBusy}
          onClick={() => {
            if (entry?.status !== 'watched') {
              onSetStatus(details, 'watched', entry);
            }
          }}
        >
          <CheckCircle2 aria-hidden="true" className="size-4" />
          Vu
        </ActionButton>
      </div>
      {entry ? (
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onRemove(details, entry)}
          className="pressable focus-ring inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-subtle hover:bg-danger/12 hover:text-danger disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          Retirer de ma liste
        </button>
      ) : null}
    </div>
  );
}

function groupWatchProviders(providers: WatchProviderOffer[]) {
  const groups = new Map<string, WatchProviderOffer[]>();

  providers.forEach((provider) => {
    const group = groups.get(provider.label) ?? [];
    group.push(provider);
    groups.set(provider.label, group);
  });

  return [...groups.entries()].map(([label, items]) => ({
    label,
    providers: items
  }));
}

function WatchProvidersSection({ providers }: { providers: WatchProviderOffer[] }) {
  const groups = groupWatchProviders(providers);

  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-black text-white">Regarder sur</h2>
      <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
        {groups.map(({ label, providers: groupProviders }) => (
          <div
            key={label}
            className="min-w-[8.75rem] shrink-0 rounded-[1.15rem] bg-white/[0.055] px-3 py-3"
          >
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-subtle">{label}</p>
            <div className="mt-3 flex gap-2">
              {groupProviders.slice(0, 4).map((provider) => {
                const logoUrl = getTmdbImageUrl(provider.logoPath, 'w92');

                return (
                  <div
                    key={`${provider.type}-${provider.providerId}`}
                    className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-black/28 ring-1 ring-white/10"
                    title={provider.providerName}
                  >
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={provider.providerName}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-1 text-center text-[0.65rem] font-black leading-3 text-white">
                        {provider.providerName}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SimilarMediaSection({
  currentMedia,
  entries,
  isLoading,
  libraryEntries
}: {
  currentMedia: CatalogMedia;
  entries: CatalogMedia[];
  isLoading: boolean;
  libraryEntries: Map<string, LibraryEntryRecord>;
}) {
  const filteredEntries = entries.filter(
    (media) => media.mediaType !== currentMedia.mediaType || media.tmdbId !== currentMedia.tmdbId
  );

  if (!isLoading && filteredEntries.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-black text-white">Vous pourriez aimer</h2>
      {isLoading ? (
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
          {[0, 1, 2].map((item) => (
            <div key={item} className="w-32 shrink-0 space-y-2">
              <div className="aspect-[2/3] animate-pulse rounded-[1.05rem] bg-surface/64" />
              <div className="h-4 w-24 animate-pulse rounded-full bg-surface/64" />
              <div className="h-3 w-16 animate-pulse rounded-full bg-surface/64" />
            </div>
          ))}
        </div>
      ) : (
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
          {filteredEntries.slice(0, 8).map((media) => (
            <MediaCard
              key={`${media.mediaType}:${media.tmdbId}`}
              media={media}
              entry={libraryEntries.get(createMediaKey(media))}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-dvh px-4 pb-10 pt-[calc(1rem+env(safe-area-inset-top))]">
      <div className="h-64 animate-pulse rounded-b-[2rem] bg-white/8" />
      <div className="-mt-16 grid grid-cols-[7rem_1fr] gap-4 px-1">
        <div className="aspect-[2/3] animate-pulse rounded-[1.1rem] bg-white/10" />
        <div className="space-y-3 pt-16">
          <div className="h-7 w-4/5 animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
          <div className="h-11 w-full animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export function MediaDetailPage() {
  const params = parseMediaDetailParams(useParams());
  const navigate = useNavigate();
  const details = useMediaDetails(params?.mediaType, params?.tmdbId);
  const similarMedia = useSimilarMedia(params?.mediaType, params?.tmdbId);
  const libraryIndex = useLibraryIndex();
  const libraryActions = useLibraryMediaActions();
  const reducedMotion = useReducedMotion();

  if (!params) {
    return <Navigate to="/recherche" replace />;
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/recherche');
  }

  if (!tmdbRuntimeConfig.isConfigured) {
    return (
      <div className="px-4 pb-10 pt-[calc(1rem+env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={handleBack}
          className="pressable focus-ring flex size-11 items-center justify-center rounded-full bg-white/10 text-white"
          aria-label="Retour"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </button>
        <div className="mt-8 rounded-[1.35rem] bg-white/[0.055] px-5 py-6 text-sm leading-6 text-muted">
          Ajoutez un token TMDB local pour charger cette fiche.
        </div>
      </div>
    );
  }

  if (details.isLoading) {
    return <DetailSkeleton />;
  }

  if (details.error || !details.data) {
    return (
      <div className="px-4 pb-10 pt-[calc(1rem+env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={handleBack}
          className="pressable focus-ring flex size-11 items-center justify-center rounded-full bg-white/10 text-white"
          aria-label="Retour"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </button>
        <div className="mt-8 rounded-[1.35rem] bg-danger/12 px-5 py-6 text-sm leading-6 text-red-100">
          Impossible de charger cette fiche TMDB pour le moment.
        </div>
      </div>
    );
  }

  const media = details.data;
  const backdropUrl = getTmdbImageUrl(media.backdropPath, 'w1280');
  const logoUrl = getTmdbImageUrl(media.logoPath, 'w500');
  const entry = libraryIndex.data.get(createMediaKey(media));
  const Icon = media.mediaType === 'movie' ? Film : Tv;
  const infoLine = buildInfoLine(media);
  const broadcastLine = buildBroadcastLine(media);
  const statusLabel = translateTvStatus(media.status);
  const languageName = formatLanguageName(media.originalLanguage);
  const voteSummary = formatVoteSummary(media.voteAverage, media.voteCount);

  return (
    <motion.article
      className="min-h-dvh pb-10"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
      transition={reducedMotion ? { duration: 0.12 } : { duration: 0.3, ease: motionEase }}
    >
      <button
        type="button"
        onClick={handleBack}
        className="pressable focus-ring fixed left-4 top-[calc(0.85rem+env(safe-area-inset-top))] z-40 flex size-11 items-center justify-center rounded-full bg-black/42 text-white shadow-panel backdrop-blur-xl sm:left-6 lg:left-8"
        aria-label="Retour"
      >
        <ArrowLeft aria-hidden="true" className="size-5" />
      </button>

      <section className="relative -mb-12 min-h-[25rem] overflow-visible px-4 pb-20 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 lg:px-8">
        {backdropUrl ? (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={quickFade}
            src={backdropUrl}
            alt=""
            className="absolute inset-x-0 -bottom-16 top-0 h-[calc(100%+4rem)] w-full object-cover opacity-70"
            decoding="async"
          />
        ) : null}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-16 top-0 bg-[linear-gradient(180deg,rgba(7,9,18,0.20)_0%,rgba(7,9,18,0.72)_54%,rgba(11,18,32,0.94)_82%,#0B1220_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-20 h-40 bg-[linear-gradient(180deg,rgba(11,18,32,0)_0%,rgba(11,18,32,0.78)_42%,#0B1220_100%)]"
        />
        <motion.div
          className="relative z-10 mt-36 grid grid-cols-[7.2rem_1fr] gap-4 sm:grid-cols-[9rem_1fr]"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0.12 } : { duration: 0.3, ease: motionEase }}
        >
          <MediaPoster
            title={media.title}
            posterPath={media.posterPath}
            size="w342"
            loading="eager"
            className="rounded-[1.1rem]"
          />
          <div className="self-end pb-1">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold text-white/85">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 backdrop-blur">
                <Icon aria-hidden="true" className="size-3.5" />
                {getMediaLabel(media.mediaType)}
              </span>
              {voteSummary ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-brand-soft backdrop-blur">
                  <Star aria-hidden="true" className="size-3.5 fill-current" />
                  {voteSummary}
                </span>
              ) : null}
            </div>
            {logoUrl ? (
              <div className="mb-3">
                <img
                  src={logoUrl}
                  alt=""
                  className="max-h-20 max-w-[13rem] object-contain object-left drop-shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
                  loading="eager"
                  decoding="async"
                />
              </div>
            ) : null}
            <h1
              className={
                logoUrl ? 'sr-only' : 'text-2xl font-black leading-tight text-white sm:text-4xl'
              }
            >
              {media.title}
            </h1>
            {media.originalTitle ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted">{media.originalTitle}</p>
            ) : null}
            {media.tagline ? (
              <p className="mt-2 line-clamp-2 text-sm font-medium italic text-white/82">
                {media.tagline}
              </p>
            ) : null}
          </div>
        </motion.div>
      </section>

      <motion.div
        className="relative z-10 space-y-8 px-4 pt-5 sm:px-6 sm:pt-6 lg:px-8"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reducedMotion ? { duration: 0.12 } : { duration: 0.28, delay: 0.05, ease: motionEase }
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-sm font-medium text-muted">
            {infoLine.map((item) => (
              <span key={item} className="rounded-full bg-white/[0.075] px-3 py-1.5">
                {item}
              </span>
            ))}
            {media.genres.slice(0, 3).map((genre) => (
              <span key={genre} className="rounded-full bg-white/[0.075] px-3 py-1.5">
                {genre}
              </span>
            ))}
          </div>
          <PersonalActions
            details={media}
            entry={entry}
            isBusy={libraryActions.isMutating}
            onSetStatus={libraryActions.setStatusForMedia}
            onRemove={libraryActions.removeMedia}
          />
        </div>

        <WatchProvidersSection providers={media.watchProviders} />

        {media.mediaType === 'tv' ? (
          <TvProgressSection
            details={media}
            entry={entry}
            isBusy={libraryActions.isMutating}
            onSetProgress={libraryActions.setTvProgressForMedia}
          />
        ) : null}

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">Synopsis</h2>
          <p className="text-[0.95rem] leading-7 text-muted">
            {media.overview ?? 'Aucun synopsis disponible pour ce titre.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black text-white">Informations</h2>
          <div className="space-y-2 text-sm leading-6 text-muted">
            {media.mediaType === 'movie' && media.directors.length > 0 ? (
              <p>Réalisation : {media.directors.join(', ')}</p>
            ) : null}
            {media.mediaType === 'tv' && media.creators.length > 0 ? (
              <p>Création : {media.creators.join(', ')}</p>
            ) : null}
            {media.mediaType === 'tv' && media.networks.length > 0 ? (
              <p>Diffuseur : {media.networks.join(', ')}</p>
            ) : null}
            {statusLabel ? <p>Statut : {statusLabel}</p> : null}
            {broadcastLine ? <p>{broadcastLine}</p> : null}
            {languageName ? <p>Langue originale : {languageName}</p> : null}
          </div>
        </section>

        {media.galleryBackdropPaths.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white">Galerie</h2>
            <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
              {media.galleryBackdropPaths.slice(0, 6).map((path) => {
                const imageUrl = getTmdbImageUrl(path, 'w780');

                return imageUrl ? (
                  <img
                    key={path}
                    src={imageUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-video w-64 shrink-0 rounded-[1rem] object-cover shadow-poster"
                  />
                ) : null;
              })}
            </div>
          </section>
        ) : null}

        {media.cast.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-xl font-black text-white">Casting</h2>
            <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
              {media.cast.map((member) => {
                const profileUrl = getTmdbImageUrl(member.profilePath, 'w185');

                return (
                  <div key={member.id} className="w-24 shrink-0">
                    <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[1rem] bg-white/[0.07]">
                      {profileUrl ? (
                        <img
                          src={profileUrl}
                          alt={`Photo de ${member.name}`}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound aria-hidden="true" className="size-8 text-subtle" />
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-white">
                      {member.name}
                    </p>
                    {member.character ? (
                      <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-subtle">
                        {member.character}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <SimilarMediaSection
          currentMedia={media}
          entries={similarMedia.data ?? []}
          isLoading={similarMedia.isLoading}
          libraryEntries={libraryIndex.data}
        />
      </motion.div>
    </motion.article>
  );
}
