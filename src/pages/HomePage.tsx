import { ArrowRight, Library, Search, Tv } from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { NavLink } from 'react-router-dom';

import homeBackground from '@/assets/brand/dramark-home-bg.png';
import logoHorizontal from '@/assets/brand/dramark-logo-horizontal.png';
import brandMark from '@/assets/brand/dramark-markV2.png';
import { MediaPoster } from '@/components/ui/MediaPoster';
import { MediaCard } from '@/features/catalog/MediaCard';
import {
  getLibraryEntryProgress,
  mapLibraryEntryToCatalogMedia,
  useLibraryCounts,
  useLibraryEntries
} from '@/features/library/hooks';
import { sortLibraryEntries } from '@/features/library/sorting';
import { createMediaDetailPath } from '@/features/media/route';
import type { LibraryEntryRecord } from '@/types/media';
import { listSpring, motionEase, quickFade } from '@/utils/motion';

function AnimatedCount({ value }: { value: number }) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        className="inline-block tabular-nums"
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

function HomeAction({
  to,
  title,
  description,
  icon: Icon
}: {
  to: string;
  title: string;
  description: string;
  icon: typeof Search;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div whileTap={reducedMotion ? undefined : { scale: 0.985 }}>
      <NavLink
        to={to}
        className="pressable focus-ring group flex min-h-16 items-center gap-3 rounded-[1.25rem] bg-surface/64 px-4 py-3 shadow-[0_16px_38px_rgba(0,0,0,0.22)] hover:bg-surface-2/54"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-2/58 text-brand-soft">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-white">{title}</span>
          <span className="mt-0.5 block text-xs leading-5 text-subtle">{description}</span>
        </span>
        <ArrowRight
          aria-hidden="true"
          className="size-4 shrink-0 text-subtle transition group-hover:translate-x-0.5 group-hover:text-white"
        />
      </NavLink>
    </motion.div>
  );
}

function ContinueCard({ entry }: { entry: LibraryEntryRecord }) {
  const reducedMotion = useReducedMotion();
  const media = mapLibraryEntryToCatalogMedia(entry);
  const progress = getLibraryEntryProgress(entry);

  return (
    <motion.div
      layout
      className="w-64 shrink-0 sm:w-72"
      whileTap={reducedMotion ? undefined : { scale: 0.982 }}
      transition={listSpring}
    >
      <NavLink
        to={createMediaDetailPath(entry.mediaType, entry.tmdbId)}
        className="focus-ring group block overflow-hidden rounded-[1.2rem] bg-surface/64 shadow-[0_16px_38px_rgba(0,0,0,0.24)]"
        aria-label={`Continuer ${media.title}`}
      >
        <div className="grid grid-cols-[5.2rem_1fr] gap-3 p-2.5">
          <MediaPoster
            title={media.title}
            posterPath={media.posterPath}
            size="w185"
            className="rounded-[0.95rem]"
          />
          <div className="min-w-0 py-1 pr-1">
            <div className="mb-1 flex items-center gap-1 text-xs font-bold text-brand-soft">
              <Tv aria-hidden="true" className="size-3.5" />
              Continuer
            </div>
            <h3 className="line-clamp-2 text-sm font-black leading-5 text-white">{media.title}</h3>
            {progress.nextEpisode ? (
              <p className="mt-1 text-xs font-semibold text-white/82">
                Saison {progress.nextEpisode.seasonNumber} {'\u00b7 prochain \u00e9pisode'}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-muted">
              {progress.watched} / {progress.total} épisodes
            </p>
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.span
                className="block h-full origin-left rounded-full bg-brand"
                initial={false}
                animate={{ scaleX: progress.ratio }}
                transition={reducedMotion ? { duration: 0.01 } : listSpring}
              />
            </span>
          </div>
        </div>
      </NavLink>
    </motion.div>
  );
}

function ContinueRail({ entries }: { entries: LibraryEntryRecord[] }) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Continuer</h2>
        <NavLink
          to="/liste"
          className="focus-ring rounded-full px-2 py-1 text-sm font-semibold text-brand-soft"
        >
          Tout voir
        </NavLink>
      </div>
      <LayoutGroup id="home-continue-rail">
        <motion.div
          layout
          className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6"
          transition={listSpring}
        >
          <AnimatePresence initial={false}>
            {entries.slice(0, 8).map((entry) => (
              <ContinueCard key={entry.id} entry={entry} />
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </section>
  );
}

function HomeRail({
  title,
  entries,
  empty
}: {
  title: string;
  entries: ReturnType<typeof sortLibraryEntries>;
  empty: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <NavLink
          to="/liste"
          className="focus-ring rounded-full px-2 py-1 text-sm font-semibold text-brand-soft"
        >
          Tout voir
        </NavLink>
      </div>
      {entries.length > 0 ? (
        <LayoutGroup id={`home-rail-${title}`}>
          <motion.div
            layout
            className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6"
            transition={listSpring}
          >
            <AnimatePresence initial={false}>
              {entries.slice(0, 8).map((entry) => {
                const media = mapLibraryEntryToCatalogMedia(entry);

                return <MediaCard key={entry.id} media={media} entry={entry} />;
              })}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      ) : (
        <p className="rounded-[1.25rem] bg-surface/64 px-4 py-5 text-sm leading-6 text-muted">
          {empty}
        </p>
      )}
    </section>
  );
}

export function HomePage() {
  const reducedMotion = useReducedMotion();
  const counts = useLibraryCounts();
  const watchlist = useLibraryEntries('watchlist');
  const watched = useLibraryEntries('watched');
  const watchlistEntries = sortLibraryEntries(watchlist.data ?? [], 'recent');
  const watchedEntries = sortLibraryEntries(watched.data ?? [], 'recent');
  const continueEntries = watchlistEntries.filter(
    (entry) => getLibraryEntryProgress(entry).isPartial
  );
  const pureWatchlistEntries = watchlistEntries.filter(
    (entry) => !getLibraryEntryProgress(entry).isPartial
  );
  const hasEntries = watchlistEntries.length > 0 || watchedEntries.length > 0;

  return (
    <div className="space-y-8">
      <motion.header
        initial={reducedMotion ? { opacity: 0.8 } : { opacity: 0.6, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.12 : 0.3, ease: motionEase }}
        className="relative -mx-4 -mt-[calc(1rem+env(safe-area-inset-top))] -mb-10 overflow-visible px-4 pb-20 pt-[calc(2.6rem+env(safe-area-inset-top))] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      >
        <img
          src={homeBackground}
          alt=""
          className="absolute inset-x-0 -bottom-24 top-0 h-[calc(100%+6rem)] w-full object-cover object-[50%_22%] opacity-[0.66]"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-x-0 -bottom-24 top-0 bg-[radial-gradient(circle_at_50%_34%,rgba(89,183,255,0.18),transparent_17rem),radial-gradient(circle_at_72%_18%,rgba(255,107,182,0.08),transparent_14rem),linear-gradient(180deg,rgba(11,18,32,0.20)_0%,rgba(11,18,32,0.62)_52%,rgba(11,18,32,0.86)_76%,#0B1220_100%)]" />
        <div className="absolute inset-x-0 -bottom-28 h-40 bg-[linear-gradient(180deg,rgba(11,18,32,0)_0%,rgba(11,18,32,0.72)_42%,#0B1220_100%)]" />
        <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
          <img
            src={logoHorizontal}
            alt="Dramark"
            className="h-auto w-[min(15.5rem,72vw)] drop-shadow-[0_0_30px_rgba(89,183,255,0.24)] sm:w-72"
            loading="eager"
            decoding="async"
          />
          <p className="mt-4 rounded-full bg-black/24 px-4 py-2 text-sm font-semibold text-white/88 shadow-[0_16px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <AnimatedCount value={counts.watched} /> vus{' '}
            <span className="px-2 text-brand-soft/75">·</span>{' '}
            <AnimatedCount value={counts.watchlist} /> à regarder
          </p>
        </div>
      </motion.header>

      {hasEntries ? (
        <div className="relative space-y-8">
          <ContinueRail entries={continueEntries} />
          <HomeRail
            title="À regarder"
            entries={pureWatchlistEntries}
            empty="Ajoutez votre prochain titre depuis la recherche."
          />
          <HomeRail
            title="Récemment vus"
            entries={watchedEntries}
            empty="Les titres terminés apparaîtront ici."
          />
        </div>
      ) : (
        <section className="relative overflow-hidden rounded-[1.7rem] bg-[linear-gradient(135deg,rgba(62,166,255,0.16),rgba(0,210,255,0.08)_52%,rgba(27,42,82,0.32))] p-5 shadow-panel">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 size-48 rounded-full bg-brand/18 blur-3xl"
          />
          <img
            src={brandMark}
            alt=""
            className="absolute -right-8 bottom-0 size-36 opacity-[0.08]"
            loading="lazy"
            decoding="async"
          />
          <div className="relative space-y-4">
            <h2 className="max-w-sm text-2xl font-black leading-tight text-white">
              Commencez par un titre qui vous donne envie.
            </h2>
            <p className="text-sm leading-6 text-muted">
              Recherchez dans TMDB, classez en un geste, et Dramark garde votre liste sur cet
              appareil.
            </p>
            <motion.div whileTap={reducedMotion ? undefined : { scale: 0.975 }}>
              <NavLink
                to="/recherche"
                className="pressable focus-ring inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(89,183,255,0.28)]"
              >
                Rechercher
                <ArrowRight aria-hidden="true" className="size-4" />
              </NavLink>
            </motion.div>
          </div>
        </section>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <HomeAction
          to="/recherche"
          title="Recherche"
          description="Ajouter un film ou une série."
          icon={Search}
        />
        <HomeAction
          to="/liste"
          title="Ma liste"
          description="Parcourir votre collection."
          icon={Library}
        />
      </div>
    </div>
  );
}
