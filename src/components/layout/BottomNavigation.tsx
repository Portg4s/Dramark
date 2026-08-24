import { Home, Library, Search, Settings } from 'lucide-react';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { NavLink } from 'react-router-dom';

import { softSpring } from '@/utils/motion';

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
  const reducedMotion = useReducedMotion();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-20 px-3 pb-[calc(0.65rem+env(safe-area-inset-bottom))] pt-2 lg:hidden"
    >
      <LayoutGroup id="bottom-navigation">
        <div className="mx-auto grid max-w-md grid-cols-4 rounded-[1.65rem] border border-white/8 bg-surface/82 p-1.5 shadow-nav backdrop-blur-2xl">
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
                  <motion.span
                    className={[
                      'relative z-10 flex size-8 items-center justify-center rounded-full transition-colors duration-200',
                      isActive ? 'text-brand-soft' : 'text-subtle'
                    ].join(' ')}
                    animate={
                      reducedMotion
                        ? undefined
                        : { y: isActive ? -1 : 0, scale: isActive ? 1.04 : 1 }
                    }
                    transition={reducedMotion ? { duration: 0.01 } : softSpring}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="bottom-nav-active"
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-brand/14 shadow-[0_0_18px_rgba(0,210,255,0.18)]"
                        transition={reducedMotion ? { duration: 0.01 } : softSpring}
                      />
                    ) : null}
                    <Icon
                      aria-hidden="true"
                      className="relative z-10"
                      size={20}
                      strokeWidth={2.15}
                    />
                  </motion.span>
                  <span className="relative z-10">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </LayoutGroup>
    </nav>
  );
}
