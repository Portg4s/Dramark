import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useMemo, useState } from 'react';

import type {
  CatalogMedia,
  MediaDetails,
  TvEpisode,
  TvSeasonSummary
} from '@/features/catalog/types';
import { useTvSeasonDetails } from '@/features/media/hooks';
import {
  createEpisodeKey,
  getDefaultSeasonNumber,
  getEffectiveWatchedEpisodes,
  getNextEpisode,
  getProgressRatio,
  getTotalEpisodeCount,
  getTvViewingState,
  getWatchedEpisodeCount
} from '@/features/media/tvProgress';
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
  const values = [
    episode.airDate
      ? new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).format(new Date(episode.airDate))
      : undefined,
    episode.runtimeMinutes ? `${episode.runtimeMinutes} min` : undefined
  ];

  return values.filter(Boolean).join(' · ') || undefined;
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
    const key = createEpisodeKey(episode.seasonNumber, episode.episodeNumber);
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
    const seasonKeys = episodes.map((episode) =>
      createEpisodeKey(episode.seasonNumber, episode.episodeNumber)
    );
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
  const activeSeasonKeys = activeSeasonEpisodes.map((episode) =>
    createEpisodeKey(episode.seasonNumber, episode.episodeNumber)
  );
  const isActiveSeasonWatched =
    activeSeasonKeys.length > 0 && activeSeasonKeys.every((key) => watchedSet.has(key));
  const percent = Math.round(ratio * 100);

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
        </p>
        {nextEpisode ? (
          <p className="text-sm font-semibold text-white/82">
            Continuer · Saison {nextEpisode.seasonNumber} · Épisode {nextEpisode.episodeNumber}
          </p>
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
          <div className="space-y-2">
            {activeSeasonEpisodes.map((episode) => {
              const key = createEpisodeKey(episode.seasonNumber, episode.episodeNumber);
              const isWatched = watchedSet.has(key);
              const meta = formatEpisodeMeta(episode);

              return (
                <motion.button
                  key={key}
                  type="button"
                  disabled={isBusy}
                  onClick={() => toggleEpisode(episode)}
                  whileTap={reducedMotion || isBusy ? undefined : { scale: 0.988 }}
                  className="pressable focus-ring grid w-full grid-cols-[2rem_2.8rem_1fr] items-start gap-2 rounded-[1rem] bg-white/[0.055] px-3 py-3 text-left hover:bg-white/[0.085] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="pt-0.5 text-brand-soft">
                    {isWatched ? (
                      <CheckCircle2 aria-hidden="true" className="size-5 fill-brand/20" />
                    ) : (
                      <Circle aria-hidden="true" className="size-5" />
                    )}
                  </span>
                  <span className="pt-0.5 text-xs font-black tabular-nums text-muted">
                    {formatEpisodeNumber(episode)}
                  </span>
                  <span className="min-w-0">
                    <span className="block line-clamp-2 text-sm font-bold leading-5 text-white">
                      {episode.name}
                    </span>
                    {meta ? <span className="mt-1 block text-xs text-subtle">{meta}</span> : null}
                    {episode.overview ? (
                      <span className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                        {episode.overview}
                      </span>
                    ) : null}
                  </span>
                </motion.button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
