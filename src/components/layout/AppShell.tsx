import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLocation, useOutlet } from 'react-router-dom';

import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { BrandSplash } from '@/components/layout/BrandSplash';
import { ConfigurationNotice } from '@/components/system/ConfigurationNotice';
import { OfflineBanner } from '@/components/system/OfflineBanner';
import { pageTransition } from '@/utils/motion';

export function AppShell() {
  const location = useLocation();
  const outlet = useOutlet();
  const reducedMotion = useReducedMotion();
  const isMediaDetail = location.pathname.startsWith('/media/');

  return (
    <div className="min-h-dvh bg-app text-ink antialiased">
      <BrandSplash />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-8%,rgba(89,183,255,0.18),transparent_24rem),radial-gradient(circle_at_92%_8%,rgba(0,210,255,0.09),transparent_21rem),radial-gradient(circle_at_8%_82%,rgba(27,42,82,0.34),transparent_18rem),linear-gradient(180deg,#0B1220_0%,#070B16_46%,#05070E_100%)]" />
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col">
        <OfflineBanner />
        <main
          className={[
            'flex-1',
            isMediaDetail
              ? 'pb-0'
              : 'px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 lg:px-8 lg:pb-10'
          ].join(' ')}
        >
          {!isMediaDetail ? <ConfigurationNotice /> : null}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={reducedMotion ? { duration: 0.12 } : pageTransition}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
        {!isMediaDetail ? <BottomNavigation /> : null}
      </div>
    </div>
  );
}
