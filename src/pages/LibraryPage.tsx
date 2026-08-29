import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Clapperboard,
  Film,
  History,
  ListChecks,
  Search,
  Trophy,
  Tv
} from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { showToast } from '@/components/system/toastStore';
import { ActionMenu } from '@/components/ui/ActionMenu';
import {
  getLibraryEntryProgress,
  mapLibraryEntryToCatalogMedia,
  useLibraryActivity,
  useLibraryEntries,
  useLibraryMediaActions
} from '@/features/library/hooks';
import { LibraryMediaItem } from '@/features/library/LibraryMediaItem';
import { filterLibraryEntries, type LibraryMediaTypeFilter } from '@/features/library/filtering';
import { sortLibraryEntries, type LibrarySort } from '@/features/library/sorting';
import {
  getLibraryStats,
  type LibraryAchievement,
  type LibraryStats
} from '@/features/library/stats';
import { createMediaDetailPath } from '@/features/media/route';
import type { LibraryActivityRecord, LibraryEntryRecord, LibraryStatus } from '@/types/media';
import { listSpring, motionEase, quickFade, softSpring } from '@/utils/motion';

type LibraryView = LibraryStatus | 'in_progress';

const emptyLibraryEntries: LibraryEntryRecord[] = [];

const tabs = [
  { view: 'watchlist', label: 'À regarder' },
  { view: 'in_progress', label: 'En cours' },
  { view: 'watched', label: 'Vu' }
] as const;

const sortOptions = [
  { value: 'recent', label: 'Ajout récent' },
  { value: 'title', label: 'Titre A-Z' },
  { value: 'year', label: 'Année' },
  { value: 'rating', label: 'Note TMDB' }
] as const;

const mediaTypeFilters: Array<{
  value: LibraryMediaTypeFilter;
  label: string;
  icon?: typeof Film;
}> = [
  { value: 'all', label: 'Tout' },
  { value: 'movie', label: 'Films', icon: Film },
  { value: 'tv', label: 'Series', icon: Tv }
];

const achievementStorageKey = 'dramark:library-achievements:v1';

function getEmptyMessage(status: LibraryStatus): string {
  return status === 'watchlist'
    ? 'Ajoutez votre prochain drama depuis la recherche.'
    : 'Les films et séries que vous terminez apparaîtront ici.';
}

function getViewEmptyMessage(view: LibraryView): string {
  if (view === 'in_progress') {
    return 'Les séries commencées apparaîtront ici.';
  }

  return getEmptyMessage(view);
}

function readStoredAchievementKeys(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const storedValue = window.localStorage.getItem(achievementStorageKey);
    const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : [];

    return new Set(
      Array.isArray(parsedValue)
        ? parsedValue.filter((value): value is string => typeof value === 'string')
        : []
    );
  } catch {
    return new Set();
  }
}

function storeAchievementKeys(keys: Set<string>) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(achievementStorageKey, JSON.stringify([...keys]));
}

function useAchievementNotifications(achievements: LibraryAchievement[]) {
  useEffect(() => {
    if (achievements.length === 0) {
      return;
    }

    const storedKeys = readStoredAchievementKeys();
    const newAchievements = achievements.filter((achievement) => !storedKeys.has(achievement.key));

    if (newAchievements.length === 0) {
      return;
    }

    newAchievements.forEach((achievement) => storedKeys.add(achievement.key));
    storeAchievementKeys(storedKeys);

    const achievement = newAchievements.at(-1);

    if (!achievement) {
      return;
    }

    showToast({
      title: 'Succès débloqué',
      detail:
        newAchievements.length > 1
          ? `${achievement.label} + ${newAchievements.length - 1} autre${
              newAchievements.length > 2 ? 's' : ''
            }`
          : achievement.label
    });
  }, [achievements]);
}

function AnimatedCount({ value, className = '' }: { value: number; className?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        className={`inline-block tabular-nums ${className}`}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
        transition={quickFade}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

function StatMetric({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: number;
  icon: typeof Film;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-[1rem] bg-white/[0.055] px-2.5 py-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-soft">
        <Icon aria-hidden="true" className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-black leading-none tabular-nums text-white">
          {value.toLocaleString('fr-FR')}
        </p>
        <p className="mt-1 truncate text-[0.68rem] font-semibold leading-3 text-subtle">{label}</p>
      </div>
    </div>
  );
}

function AchievementBadge({ achievement }: { achievement: LibraryAchievement }) {
  return (
    <div className="inline-flex min-h-9 min-w-0 items-center gap-2 rounded-full bg-brand/12 px-2.5 py-1.5 ring-1 ring-brand/20">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_18px_rgba(89,183,255,0.18)]">
        <BadgeCheck aria-hidden="true" className="size-3.5" />
      </span>
      <span className="truncate text-xs font-black text-white">{achievement.label}</span>
    </div>
  );
}

function getActivityActionLabel(activity: LibraryActivityRecord): string {
  if (activity.action === 'episode_watched') {
    return 'Épisode vu';
  }

  if (activity.action === 'media_watched') {
    return activity.mediaType === 'movie' ? 'Film vu' : 'Série vue';
  }

  return 'Ajouté à regarder';
}

function getActivityDetail(activity: LibraryActivityRecord): string {
  if (
    activity.action === 'episode_watched' &&
    activity.seasonNumber !== undefined &&
    activity.episodeNumber !== undefined
  ) {
    return `Saison ${activity.seasonNumber} · Épisode ${activity.episodeNumber}`;
  }

  return activity.mediaType === 'movie' ? 'Film' : 'Série';
}

function LibraryActivitySection({
  activities,
  isLoading
}: {
  activities: LibraryActivityRecord[];
  isLoading: boolean;
}) {
  if (isLoading || activities.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-white">Activité récente</h2>
        <p className="text-xs font-semibold text-subtle">Local</p>
      </div>
      <div className="space-y-1.5 rounded-[1.15rem] bg-white/[0.045] p-2">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            to={createMediaDetailPath(activity.mediaType, activity.tmdbId)}
            className="focus-ring pressable flex min-h-14 items-center gap-3 rounded-[0.95rem] px-2.5 py-2 transition hover:bg-white/[0.055]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/13 text-brand-soft">
              {activity.action === 'episode_watched' ? (
                <CheckCircle2 aria-hidden="true" className="size-4" />
              ) : (
                <History aria-hidden="true" className="size-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-black text-white">
                {activity.snapshot?.title ?? 'Titre inconnu'}
              </span>
              <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs font-semibold text-muted">
                <span className="shrink-0 text-brand-soft">{getActivityActionLabel(activity)}</span>
                <span aria-hidden="true" className="text-subtle">
                  ·
                </span>
                <span className="truncate">{getActivityDetail(activity)}</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LibraryStatsSection({ stats }: { stats: LibraryStats }) {
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  if (stats.totalTitles === 0) {
    return null;
  }

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-white">Statistiques</h2>
        <p className="text-xs font-semibold text-subtle">
          {stats.totalTitles.toLocaleString('fr-FR')} titre{stats.totalTitles > 1 ? 's' : ''}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <StatMetric label="Titres vus" value={stats.watchedTitles} icon={Trophy} />
        <StatMetric label="Épisodes vus" value={stats.watchedEpisodes} icon={Clapperboard} />
        <StatMetric label="En cours" value={stats.inProgressSeries} icon={ListChecks} />
      </div>
      {stats.achievements.length > 0 ? (
        <>
          <button
            type="button"
            onClick={() => setIsAchievementsOpen((isOpen) => !isOpen)}
            className="pressable focus-ring inline-flex min-h-9 items-center gap-2 rounded-full bg-brand/12 px-3 text-xs font-black text-white ring-1 ring-brand/18"
            aria-expanded={isAchievementsOpen}
          >
            <BadgeCheck aria-hidden="true" className="size-4 text-brand-soft" />
            <span>Succès {stats.achievements.length}</span>
            <ChevronDown
              aria-hidden="true"
              className={[
                'size-4 text-subtle transition',
                isAchievementsOpen ? 'rotate-180' : ''
              ].join(' ')}
            />
          </button>
          <AnimatePresence initial={false}>
            {isAchievementsOpen ? (
              <motion.div
                key="library-achievements"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={quickFade}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 rounded-[1rem] bg-white/[0.045] p-2">
                  {stats.achievements.map((achievement) => (
                    <AchievementBadge key={achievement.key} achievement={achievement} />
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}
    </section>
  );
}

export function LibraryPage() {
  const [activeView, setActiveView] = useState<LibraryView>('watchlist');
  const [sort, setSort] = useState<LibrarySort>('recent');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<LibraryMediaTypeFilter>('all');
  const [libraryQuery, setLibraryQuery] = useState('');
  const reducedMotion = useReducedMotion();
  const watchlistQuery = useLibraryEntries('watchlist');
  const watchedQuery = useLibraryEntries('watched');
  const activityQuery = useLibraryActivity(5);
  const libraryActions = useLibraryMediaActions();

  const watchlistEntries = watchlistQuery.data ?? emptyLibraryEntries;
  const watchedEntries = watchedQuery.data ?? emptyLibraryEntries;
  const allEntries = useMemo(
    () => [...watchlistEntries, ...watchedEntries],
    [watchlistEntries, watchedEntries]
  );
  const stats = useMemo(() => getLibraryStats(allEntries), [allEntries]);
  useAchievementNotifications(stats.achievements);
  const inProgressEntries = useMemo(
    () => watchlistEntries.filter((entry) => getLibraryEntryProgress(entry).isPartial),
    [watchlistEntries]
  );
  const unstartedWatchlistEntries = useMemo(
    () => watchlistEntries.filter((entry) => !getLibraryEntryProgress(entry).isPartial),
    [watchlistEntries]
  );
  const activeEntries =
    activeView === 'watched'
      ? watchedEntries
      : activeView === 'in_progress'
        ? inProgressEntries
        : unstartedWatchlistEntries;
  const counts = {
    watchlist: unstartedWatchlistEntries.length,
    in_progress: inProgressEntries.length,
    watched: watchedEntries.length
  } satisfies Record<LibraryView, number>;
  const sortedEntries = useMemo(() => {
    const filteredEntries = filterLibraryEntries(activeEntries, {
      mediaType: mediaTypeFilter,
      query: libraryQuery
    });

    return sortLibraryEntries(filteredEntries, sort);
  }, [activeEntries, libraryQuery, mediaTypeFilter, sort]);
  const activeTabIndex = tabs.findIndex((tab) => tab.view === activeView);
  const direction = activeTabIndex === 2 ? 1 : -1;
  const selectedSort = sortOptions.find((option) => option.value === sort) ?? sortOptions[0];
  const hasActiveFilters = mediaTypeFilter !== 'all' || libraryQuery.trim().length > 0;
  const activeQuery = activeView === 'watched' ? watchedQuery : watchlistQuery;

  return (
    <div className="space-y-6">
      <header className="space-y-4 pt-2">
        <div>
          <p className="text-sm font-semibold text-brand-soft">Collection</p>
          <h1 className="mt-1 text-3xl font-black text-white">Ma liste</h1>
        </div>
        <p className="text-sm font-medium text-muted">
          <AnimatedCount value={counts.watchlist} /> à regarder{' '}
          <span className="px-2 text-subtle">·</span> <AnimatedCount value={counts.in_progress} />{' '}
          en cours <span className="px-2 text-subtle">·</span>{' '}
          <AnimatedCount value={counts.watched} /> vus
        </p>
      </header>

      <LibraryStatsSection stats={stats} />

      <LibraryActivitySection
        activities={activityQuery.data ?? []}
        isLoading={activityQuery.isLoading}
      />

      <LayoutGroup id="library-tabs">
        <div className="relative grid grid-cols-3 overflow-hidden rounded-full bg-surface/72 p-1">
          {tabs.map(({ view, label }) => {
            const count = counts[view];
            const isActive = activeView === view;

            return (
              <button
                key={view}
                type="button"
                onClick={() => setActiveView(view)}
                className={[
                  'focus-ring relative z-10 flex min-h-11 items-center justify-center gap-1 rounded-full px-1.5 text-[0.83rem] font-bold transition-colors duration-200',
                  isActive ? 'text-white' : 'text-muted hover:text-white'
                ].join(' ')}
                aria-pressed={isActive}
                aria-label={`${label} ${count}`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="library-active-tab"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-brand shadow-[0_10px_24px_rgba(89,183,255,0.24)]"
                    transition={reducedMotion ? { duration: 0.01 } : softSpring}
                  />
                ) : null}
                <span className="relative z-10 whitespace-nowrap">{label}</span>
                <AnimatedCount
                  value={count}
                  className={isActive ? 'relative z-10 text-white/82' : 'relative z-10 text-subtle'}
                />
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <div className="space-y-3">
        <label className="group flex min-h-12 items-center gap-3 rounded-full bg-surface/72 px-4 text-sm text-white transition focus-within:bg-surface-2/64 focus-within:shadow-[0_0_0_2px_rgba(89,183,255,0.42)]">
          <Search aria-hidden="true" className="size-4 shrink-0 text-brand-soft" />
          <input
            value={libraryQuery}
            onChange={(event) => setLibraryQuery(event.target.value)}
            placeholder="Rechercher dans ma liste"
            className="min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-subtle outline-none"
            aria-label="Rechercher dans ma liste"
          />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-full bg-surface/72 p-1">
            {mediaTypeFilters.map(({ value, label, icon: Icon }) => {
              const isActive = mediaTypeFilter === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMediaTypeFilter(value)}
                  className={[
                    'focus-ring flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition-colors',
                    isActive ? 'bg-brand text-white' : 'text-muted hover:text-white'
                  ].join(' ')}
                  aria-pressed={isActive}
                >
                  {Icon ? <Icon aria-hidden="true" className="size-4" /> : null}
                  {label}
                </button>
              );
            })}
          </div>
          <ActionMenu
            label="Trier la liste"
            align="left"
            side="bottom"
            items={sortOptions.map((option) => ({
              label: option.label,
              selected: option.value === sort,
              onSelect: () => setSort(option.value)
            }))}
            trigger={({ ref, isOpen, toggle }) => (
              <motion.button
                ref={ref}
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                whileTap={reducedMotion ? undefined : { scale: 0.975 }}
                className="pressable focus-ring inline-flex min-h-11 items-center gap-2 rounded-full bg-surface/72 px-4 text-sm font-semibold text-white hover:bg-surface-2/70"
              >
                {selectedSort.label}
                <ChevronDown
                  aria-hidden="true"
                  className={['size-4 text-subtle transition', isOpen ? 'rotate-180' : ''].join(
                    ' '
                  )}
                />
              </motion.button>
            )}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={activeView}
          custom={direction}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? 24 : -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction > 0 ? -24 : 24 }}
          transition={{ duration: reducedMotion ? 0.12 : 0.28, ease: motionEase }}
        >
          {activeQuery.isLoading ? (
            <div
              role="status"
              className="rounded-[1.35rem] bg-surface/64 px-5 py-6 text-sm text-muted"
            >
              Chargement de votre liste...
            </div>
          ) : null}

          {activeQuery.error ? (
            <div className="rounded-[1.35rem] bg-danger/12 px-5 py-4 text-sm text-red-100">
              Impossible de lire la bibliothèque locale pour le moment.
            </div>
          ) : null}

          {!activeQuery.isLoading && !activeQuery.error && sortedEntries.length === 0 ? (
            <div className="rounded-[1.35rem] bg-surface/64 px-5 py-8 text-center">
              <p className="text-sm font-medium text-muted">
                {hasActiveFilters
                  ? 'Aucun titre ne correspond a ces filtres.'
                  : getViewEmptyMessage(activeView)}
              </p>
            </div>
          ) : null}

          {sortedEntries.length > 0 ? (
            <LayoutGroup id={`library-list-${activeView}`}>
              <motion.div layout className="space-y-3" transition={listSpring}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {sortedEntries.map((entry) => {
                    const media = mapLibraryEntryToCatalogMedia(entry);

                    return (
                      <LibraryMediaItem
                        key={entry.id}
                        media={media}
                        entry={entry}
                        mode="library"
                        isBusy={libraryActions.isMutating}
                        onSetStatus={libraryActions.setStatusForMedia}
                        onSetProgress={libraryActions.setTvProgressForMedia}
                        onRemove={libraryActions.removeMedia}
                      />
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
