import { Outlet } from 'react-router-dom';

import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { ConfigurationNotice } from '@/components/system/ConfigurationNotice';
import { OfflineBanner } from '@/components/system/OfflineBanner';

export function AppShell() {
  return (
    <div className="min-h-dvh bg-app text-app antialiased">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,79,135,0.24),transparent_28rem),linear-gradient(180deg,#11131d_0%,#08090f_46%,#05060a_100%)]" />
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col">
        <OfflineBanner />
        <main className="flex-1 px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:px-6 lg:px-8 lg:pb-10">
          <ConfigurationNotice />
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}
