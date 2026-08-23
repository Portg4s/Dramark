import { ArrowRight, Library, Search, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { PageHeader } from '@/components/ui/PageHeader';
import { useLibraryCounts } from '@/features/library/hooks';

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
      className="group flex min-h-28 items-center gap-4 rounded-lg border border-white/10 bg-surface p-4 shadow-panel outline-none transition hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-viki focus-visible:ring-offset-2 focus-visible:ring-offset-app"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-viki text-white">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold text-white">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-muted">{description}</span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="size-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-white"
      />
    </NavLink>
  );
}

export function HomePage() {
  const counts = useLibraryCounts();

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(255,79,135,0.22),rgba(91,141,239,0.14)_48%,rgba(255,255,255,0.05))] px-5 py-7 shadow-panel sm:px-8 sm:py-10">
        <div className="flex items-center gap-2 text-sm font-semibold text-viki-soft">
          <Sparkles aria-hidden="true" size={18} />
          Bibliotheque personnelle
        </div>
        <PageHeader
          title="Dramark"
          description="Recherchez un film ou une serie, puis gardez simplement ce que vous voulez voir ou ce que vous avez termine."
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-2xl font-black text-white">{counts.watchlist}</p>
            <p className="text-xs font-semibold uppercase text-subtle">A regarder</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-2xl font-black text-white">{counts.watched}</p>
            <p className="text-xs font-semibold uppercase text-subtle">Vu</p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <HomeAction
          to="/recherche"
          title="Rechercher"
          description="Trouvez un titre dans TMDB et ajoutez-le en un geste."
          icon={Search}
        />
        <HomeAction
          to="/liste"
          title="Ma liste"
          description="Retrouvez vos contenus a regarder et deja vus sur cet appareil."
          icon={Library}
        />
      </div>
    </div>
  );
}
