import { ArrowRight, Library, Search } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { MediaCard } from '@/features/catalog/MediaCard';
import {
  mapLibraryEntryToCatalogMedia,
  useLibraryCounts,
  useLibraryEntries
} from '@/features/library/hooks';
import { sortLibraryEntries } from '@/features/library/sorting';

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
  return (
    <NavLink
      to={to}
      className="pressable focus-ring group flex min-h-16 items-center gap-3 rounded-[1.25rem] bg-white/[0.07] px-4 py-3 shadow-[0_16px_38px_rgba(0,0,0,0.22)] hover:bg-white/[0.1]"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-soft">
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
  const media = entries.slice(0, 8).map(mapLibraryEntryToCatalogMedia);

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
      {media.length > 0 ? (
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
          {media.map((item) => (
            <MediaCard key={`${item.mediaType}:${item.tmdbId}`} media={item} />
          ))}
        </div>
      ) : (
        <p className="rounded-[1.25rem] bg-white/[0.055] px-4 py-5 text-sm leading-6 text-muted">
          {empty}
        </p>
      )}
    </section>
  );
}

export function HomePage() {
  const counts = useLibraryCounts();
  const watchlist = useLibraryEntries('watchlist');
  const watched = useLibraryEntries('watched');
  const watchlistEntries = sortLibraryEntries(watchlist.data ?? [], 'recent');
  const watchedEntries = sortLibraryEntries(watched.data ?? [], 'recent');
  const hasEntries = watchlistEntries.length > 0 || watchedEntries.length > 0;

  return (
    <div className="space-y-8">
      <header className="space-y-5 pt-2">
        <div>
          <p className="text-sm font-semibold text-brand-soft">Votre bibliothèque</p>
          <h1 className="mt-1 text-5xl font-black leading-none text-white sm:text-6xl">Dramark</h1>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted">
          {counts.watched} vus <span className="px-2 text-subtle">·</span> {counts.watchlist} à
          regarder
        </p>
      </header>

      {hasEntries ? (
        <div className="space-y-8">
          <HomeRail
            title="À regarder"
            entries={watchlistEntries}
            empty="Ajoutez votre prochain titre depuis la recherche."
          />
          <HomeRail
            title="Récemment vus"
            entries={watchedEntries}
            empty="Les titres terminés apparaîtront ici."
          />
        </div>
      ) : (
        <section className="relative overflow-hidden rounded-[1.7rem] bg-[linear-gradient(135deg,rgba(89,183,255,0.16),rgba(113,215,255,0.08)_52%,rgba(255,255,255,0.055))] p-5 shadow-panel">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 size-48 rounded-full bg-brand/18 blur-3xl"
          />
          <div className="relative space-y-4">
            <h2 className="max-w-sm text-2xl font-black leading-tight text-white">
              Commencez par un titre qui vous donne envie.
            </h2>
            <p className="text-sm leading-6 text-muted">
              Recherchez dans TMDB, classez en un geste, et Dramark garde votre liste sur cet
              appareil.
            </p>
            <NavLink
              to="/recherche"
              className="pressable focus-ring inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white shadow-[0_14px_34px_rgba(89,183,255,0.28)]"
            >
              Rechercher
              <ArrowRight aria-hidden="true" className="size-4" />
            </NavLink>
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
