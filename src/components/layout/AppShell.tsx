import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar, MobileTopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { PageTransition } from './PageTransition';

/**
 * Responsive frame: fixed sidebar + top bar at md+, mobile top bar + bottom nav
 * below md. Page content renders through <Outlet/>, centered at 1280px.
 */
export function AppShell() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Sidebar />
      <MobileTopBar />
      <TopBar />
      <main className="md:ml-60">
        <div className="max-w-container-max mx-auto px-md md:px-xl py-md md:py-lg pb-24 md:pb-lg">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
