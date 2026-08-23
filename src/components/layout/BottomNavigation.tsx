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
      className="fixed inset-x-0 bottom-0 z-20 px-3 pb-[calc(0.65rem+env(safe-area-inset-bottom))] pt-2 lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 rounded-[1.65rem] border border-white/8 bg-[#080b14]/82 p-1.5 shadow-nav backdrop-blur-2xl">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'pressable focus-ring relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 text-[0.68rem] font-semibold',
                isActive ? 'text-white' : 'text-subtle hover:text-white'
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={[
                    'flex size-8 items-center justify-center rounded-full transition duration-200',
                    isActive
                      ? 'bg-brand/14 text-brand-soft shadow-[0_0_18px_rgba(89,183,255,0.18)]'
                      : 'text-subtle'
                  ].join(' ')}
                >
                  <Icon aria-hidden="true" size={20} strokeWidth={2.15} />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
