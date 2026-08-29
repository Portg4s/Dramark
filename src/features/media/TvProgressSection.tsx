import { CheckCircle2, Circle, Loader2, Tv } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useMemo, useState } from 'react';

import type {
  CatalogMedia,
  MediaDetails,
  TvEpisode,
  TvSeasonSummary
} from '@/features/catalog/types';
import { createEpisodeProgressKey, getEpisodeByProgressSlot } from '@/features/media/episodeSlots';
import { useTvSeasonDetails } from '@/features/media/hooks';
import {
  getDefaultSeasonNumber,
  getEffectiveWatchedEpisodes,
  createEpisodeKey,
  getNextEpisode,
  getProgressRatio,
  getTotalEpisodeCount,
  getTvViewingState,
  getWatchedEpisodeCount
} from '@/features/media/tvProgress';
import { getEpisodePreview } from '@/features/media/episodePreview';
import { getTmdbImageUrl } from '@/services/tmdb/images';
import type { LibraryEntryRecord, TvSeasonProgressMeta } from '@/types/media';
import { motionEase, quickFade } from '@/utils/motion';

type TvProgressSectionProps = {
  details: MediaDetails;
  entry?: LibraryEntryRecord;
  isBusy: boolean;
  onSetProgress: (
    media: CatalogMedia,
    seasons: TvSeasonProgressMeta[],
    watchedEpisodes: string[]
  ) => void;
};

function toSeasonMeta(seasons: TvSeasonSummary[]): TvSeasonProgressMeta[] {
  return seasons.map((season) => ({
    seasonNumber: season.seasonNumber,
    episodeCount: season.episodeCount
  }));
}

function formatSeasonLabel(season: TvSeasonSummary): string {
  if (season.seasonNumber === 0) {
    return 'Spéciaux';
  }

  return season.name?.trim() || `Saison ${season.seasonNumber}`;
}

function formatEpisodeNumber(episode: TvEpisode): string {
  return `E${String(episode.episodeNumber).padStart(2, '0')}`;
}

function formatEpisodeMeta(episode: TvEpisode): string | undefined {
  return episode.runtimeMinutes ? `~${episode.runtimeMinutes} min` : undefined;
}

function formatRemainingRuntime(minutes: number): string | undefined {
  if (minutes <= 0) {
    return undefined;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `Environ ${remainingMinutes} min restantes`;
  }

  if (remainingMinutes === 0) {
    return `Environ ${hours} h restantes`;
  }

  return `Environ ${hours} h ${remainingMinutes} restantes`;
}

function formatContinueEpisode(
  nextEpisode: ReturnType<typeof getNextEpisode>,
  activeSeasonEpisodes: TvEpisode[]
): string | undefined {
  if (!nextEpisode) {
    return undefined;
  }

  const tmdbEpisode = getEpisodeByProgressSlot(
    activeSeasonEpisodes,
    nextEpisode.seasonNumber,
    nextEpisode.episodeNumber
  );
  const episodeNumber = tmdbEpisode?.episodeNumber ?? nextEpisode.episodeNumber;

  return `Continuer \u00b7 Saison ${nextEpisode.seasonNumber} \u00b7 \u00c9pisode ${episodeNumber}`;
}

function getStateLabel(state: ReturnType<typeof getTvViewingState>): string {
  if (state === 'watched') {
    return 'Vu';
  }

  if (state === 'in_progress') {
    return 'En cours';
  }

  return 'Pas encore commencé';
}

export function TvProgressSection({
  details,
  entry,
  isBusy,
  onSetProgress
}: TvProgressSectionProps) {
  const reducedMotion = useReducedMotion();
  const seasons = useMemo(() => toSeasonMeta(details.seasons), [details.seasons]);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number | undefined>();
  const [expandedSeasonNumber, setExpandedSeasonNumber] = useState<number | undefined>();
  const defaultSeasonNumber = useMemo(
    () => getDefaultSeasonNumber(entry, seasons),
    [entry, seasons]
  );
  const activeSeasonNumber = details.seasons.some(
    (season) => season.seasonNumber === selectedSeasonNumber
  )
    ? selectedSeasonNumber
    : defaultSeasonNumber;
  const seasonDetails = useTvSeasonDetails(details.tmdbId, activeSeasonNumber);
  const watchedEpisodes = getEffectiveWatchedEpisodes(entry, seasons);
  const watchedSet = new Set(watchedEpisodes);
  const watchedCount = getWatchedEpisodeCount(entry, seasons);
  const totalCount = getTotalEpisodeCount(seasons);
  const ratio = getProgressRatio(entry, seasons);
  const viewingState = getTvViewingState(entry, seasons);
  const nextEpisode = getNextEpisode(entry, seasons);
  const activeSeason = details.seasons.find((season) => season.seasonNumber === activeSeasonNumber);

  function updateWatched(nextWatchedEpisodes: string[]) {
    onSetProgress(details, seasons, nextWatchedEpisodes);
  }

  function toggleEpisode(episode: TvEpisode) {
    const episodes = seasonDetails.data?.episodes ?? [];
    const key = createEpisodeProgressKey(episodes, episode);
    const nextWatched = new Set(watchedEpisodes);

    if (nextWatched.has(key)) {
      nextWatched.delete(key);
    } else {
      nextWatched.add(key);
    }

    updateWatched(Array.from(nextWatched));
  }

  function toggleSeason() {
    const episodes = seasonDetails.data?.episodes ?? [];
    const nextWatched = new Set(watchedEpisodes);
    const seasonKeys = episodes.map((episode) => createEpisodeProgressKey(episodes, episode));
    const isSeasonWatched =
      seasonKeys.length > 0 && seasonKeys.every((key) => nextWatched.has(key));

    seasonKeys.forEach((key) => {
      if (isSeasonWatched) {
        nextWatched.delete(key);
      } else {
        nextWatched.add(key);
      }
    });

    updateWatched(Array.from(nextWatched));
  }

  function markNextEpisodeWatched() {
    if (!nextEpisode) {
      return;
    }

    const episodes = seasonDetails.data?.episodes ?? [];
    const tmdbEpisode = getEpisodeByProgressSlot(
      episodes,
      nextEpisode.seasonNumber,
      nextEpisode.episodeNumber
    );
    const episodeKey = tmdbEpisode
      ? createEpisodeProgressKey(episodes, tmdbEpisode)
      : createEpisodeKey(nextEpisode.seasonNumber, nextEpisode.episodeNumber);
    const nextWatched = new Set(watchedEpisodes);
    nextWatched.add(episodeKey);

    updateWatched(Array.from(nextWatched));
  }

  if (details.seasons.length === 0) {
    return (
      <section className="space-y-3 rounded-[1.35rem] bg-surface/64 p-4 shadow-panel">
        <h2 className="text-xl font-black text-white">Votre progression</h2>
        <p className="text-sm leading-6 text-muted">
          TMDB ne fournit pas encore de saisons exploitables pour cette série.
        </p>
      </section>
    );
  }

  const activeSeasonEpisodes = seasonDetails.data?.episodes ?? [];
  const isEpisodeListExpanded = expandedSeasonNumber === activeSeasonNumber;
  const displayedEpisodes = isEpisodeListExpanded
    ? activeSeasonEpisodes
    : getEpisodePreview(activeSeasonEpisodes, nextEpisode);
  const hiddenEpisodeCount = activeSeasonEpisodes.length - displayedEpisodes.length;
  const activeSeasonKeys = activeSeasonEpisodes.map((episode) =>
    createEpisodeProgressKey(activeSeasonEpisodes, episode)
  );
  const isActiveSeasonWatched =
    activeSeasonKeys.length > 0 && activeSeasonKeys.every((key) => watchedSet.has(key));
  const percent = Math.round(ratio * 100);
  const continueLabel = formatContinueEpisode(nextEpisode, activeSeasonEpisodes);
  const remainingRuntimeLabel = details.episodeRuntimeMinutes
    ? formatRemainingRuntime((totalCount - watchedCount) * details.episodeRuntimeMinutes)
    : undefined;

  return (
    <section className="space-y-4 rounded-[1.35rem] bg-surface/64 p-4 shadow-panel">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white">Votre progression</h2>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={`${viewingState}-${watchedCount}-${totalCount}`}
                className="mt-2 text-sm font-bold text-brand-soft"
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={quickFade}
              >
                {getStateLabel(viewingState)}
              </motion.p>
            </AnimatePresence>
          </div>
          <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm font-black tabular-nums text-white">
            {percent} %
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full origin-left rounded-full bg-brand"
            initial={false}
            animate={{ scaleX: ratio }}
            transition={reducedMotion ? { duration: 0.01 } : { duration: 0.28, ease: motionEase }}
          />
        </div>

        <p className="text-sm font-medium text-muted">
          {viewingState === 'watched'
            ? `${watchedCount} / ${totalCount} épisodes`
            : `${watchedCount} / ${totalCount} épisodes vus`}
          {viewingState !== 'watched' && remainingRuntimeLabel ? (
            <span className="block pt-1 text-xs font-semibold text-subtle">
              {remainingRuntimeLabel}
            </span>
          ) : null}
        </p>
        {continueLabel && nextEpisode ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-white/82">{continueLabel}</p>
            <motion.button
              type="button"
              disabled={isBusy || seasonDetails.isLoading}
              onClick={markNextEpisodeWatched}
              aria-label={`Marquer l'épisode ${nextEpisode.episodeNumber} vu`}
              whileTap={reducedMotion || isBusy ? undefined : { scale: 0.975 }}
              className="pressable focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand px-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(89,183,255,0.22)] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <CheckCircle2 aria-hidden="true" className="size-4" />
              Marquer vu
            </motion.button>
          </div>
        ) : null}
      </div>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {details.seasons.map((season) => {
          const isActive = season.seasonNumber === activeSeasonNumber;

          return (
            <button
              key={season.seasonNumber}
              type="button"
              onClick={() => setSelectedSeasonNumber(season.seasonNumber)}
              className={[
                'focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors',
                isActive
                  ? 'bg-brand text-white'
                  : 'bg-white/10 text-muted hover:bg-white/15 hover:text-white'
              ].join(' ')}
              aria-pressed={isActive}
            >
              {formatSeasonLabel(season)}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-white">
              {activeSeason ? formatSeasonLabel(activeSeason) : 'Saison'}
            </h3>
            {activeSeason?.episodeCount ? (
              <p className="text-xs font-medium text-subtle">
                {activeSeason.episodeCount} épisode{activeSeason.episodeCount > 1 ? 's' : ''}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            disabled={isBusy || seasonDetails.isLoading || activeSeasonEpisodes.length === 0}
            onClick={toggleSeason}
            className="pressable focus-ring shrink-0 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isActiveSeasonWatched ? 'Tout décocher' : 'Tout marquer vu'}
          </button>
        </div>

        {seasonDetails.isLoading ? (
          <div className="flex items-center gap-2 rounded-[1rem] bg-white/[0.055] px-4 py-5 text-sm text-muted">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Chargement de la saison...
          </div>
        ) : null}

        {seasonDetails.error ? (
          <p className="rounded-[1rem] bg-white/[0.055] px-4 py-5 text-sm leading-6 text-muted">
            Cette saison n'est pas disponible pour le moment. Votre progression locale est
            conservée.
          </p>
        ) : null}

        {activeSeasonEpisodes.length > 0 ? (
          <>
            <motion.div
              layout={!reducedMotion}
              className="space-y-2"
              transition={reducedMotion ? { duration: 0.01 } : { duration: 0.22, ease: motionEase }}
            >
              <AnimatePresence initial={false}>
                {displayedEpisodes.map((episode) => {
                  const key = createEpisodeProgressKey(activeSeasonEpisodes, episode);
                  const isWatched = watchedSet.has(key);
                  const meta = formatEpisodeMeta(episode);
                  const stillUrl = getTmdbImageUrl(episode.stillPath, 'w300');

                  return (
                    <motion.button
                      key={key}
                      layout={!reducedMotion}
                      type="button"
                      disabled={isBusy}
                      onClick={() => toggleEpisode(episode)}
                      aria-pressed={isWatched}
                      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                      transition={
                        reducedMotion ? { duration: 0.01 } : { duration: 0.16, ease: motionEase }
                      }
                      whileTap={reducedMotion || isBusy ? undefined : { scale: 0.988 }}
                      className="pressable focus-ring grid w-full grid-cols-[5.5rem_1fr_1.75rem] items-center gap-3 rounded-[1rem] bg-white/[0.055] px-3 py-2.5 text-left hover:bg-white/[0.085] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="relative aspect-video w-full overflow-hidden rounded-[0.8rem] bg-surface-2/70">
                        {stillUrl ? (
                          <img
                            src={stillUrl}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-white/[0.045] text-subtle">
                            <Tv aria-hidden="true" className="size-5" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="mb-0.5 flex items-baseline gap-2">
                          <span className="text-xs font-black tabular-nums text-brand-soft">
                            {formatEpisodeNumber(episode)}
                          </span>
                          <span className="line-clamp-1 min-w-0 flex-1 text-sm font-bold leading-5 text-white">
                            {episode.name}
                          </span>
                        </span>
                        {meta ? <span className="block text-xs text-subtle">{meta}</span> : null}
                      </span>
                      <span className="justify-self-end text-brand-soft">
                        {isWatched ? (
                          <CheckCircle2 aria-hidden="true" className="size-5 fill-brand/20" />
                        ) : (
                          <Circle aria-hidden="true" className="size-5" />
                        )}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>
            {hiddenEpisodeCount > 0 || isEpisodeListExpanded ? (
              <motion.button
                type="button"
                onClick={() =>
                  setExpandedSeasonNumber(isEpisodeListExpanded ? undefined : activeSeasonNumber)
                }
                aria-expanded={isEpisodeListExpanded}
                whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                className="pressable focus-ring mx-auto block rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"
              >
                {isEpisodeListExpanded
                  ? 'R\u00e9duire'
                  : `Voir les ${hiddenEpisodeCount} autres \u00e9pisodes`}
              </motion.button>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
