import { Home, Library, Search, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

type NavigationItem = {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
};

const navItems: NavigationItem[] = [
  { to: '/', label: 'Accueil', icon: Home, end: true },
  { to: '/recherche', label: 'Recherche', icon: Search },
  { to: '/liste', label: 'Ma liste', icon: Library },
  { to: '/reglages', label: 'Réglages', icon: Settings }
] as const;

export function BottomNavigation() {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#08090f]/92 px-3 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2 shadow-nav backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[0.7rem] font-medium outline-none transition',
                'focus-visible:ring-2 focus-visible:ring-viki focus-visible:ring-offset-2 focus-visible:ring-offset-app',
                isActive ? 'bg-white/10 text-white' : 'text-muted hover:bg-white/10 hover:text-white'
              ].join(' ')
            }
          >
            <Icon aria-hidden="true" size={21} strokeWidth={2.2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
