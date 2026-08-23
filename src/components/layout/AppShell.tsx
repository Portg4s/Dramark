import { Outlet, useLocation } from 'react-router-dom';

import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { ConfigurationNotice } from '@/components/system/ConfigurationNotice';
import { OfflineBanner } from '@/components/system/OfflineBanner';

export function AppShell() {
  const location = useLocation();
  const isMediaDetail = location.pathname.startsWith('/media/');

  return (
    <div className="min-h-dvh bg-app text-ink antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_-10%,rgba(89,183,255,0.16),transparent_24rem),radial-gradient(circle_at_92%_8%,rgba(113,215,255,0.10),transparent_22rem),linear-gradient(180deg,#0c1020_0%,#070912_46%,#04050b_100%)]" />
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col">
        <OfflineBanner />
        <main
          className={[
            'flex-1 page-enter',
            isMediaDetail
              ? 'pb-0'
              : 'px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 lg:px-8 lg:pb-10'
          ].join(' ')}
        >
          {!isMediaDetail ? <ConfigurationNotice /> : null}
          <Outlet />
        </main>
        {!isMediaDetail ? <BottomNavigation /> : null}
      </div>
    </div>
  );
}
