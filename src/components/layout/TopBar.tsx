import { useLocation, useNavigate } from 'react-router-dom';
import { HelpCircle, Bell } from 'lucide-react';
import { ROUTE_TITLES } from './navItems';
import { useLang } from '../../lib/i18n';

/** Desktop sticky top bar with the current page title (hidden below md). */
export function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { lang } = useLang();
  const title = ROUTE_TITLES[pathname]?.[lang === 'en' ? 1 : 0] ?? 'Oral Screen AI';

  return (
    <header className="hidden md:flex ml-60 h-16 items-center justify-between px-xl bg-surface border-b border-outline-variant sticky top-0 z-40">
      <h2 className="text-headline-md font-bold text-primary">{title}</h2>
      <div className="flex items-center gap-md">
        <button
          onClick={() => navigate('/bantuan')}
          aria-label="Bantuan"
          className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full"
        >
          <HelpCircle size={22} />
        </button>
        <button
          aria-label="Notifikasi"
          className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full relative"
        >
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>
      </div>
    </header>
  );
}

/** Mobile top bar: wordmark + help/notification (hidden at md+). */
export function MobileTopBar() {
  const navigate = useNavigate();
  return (
    <header className="md:hidden flex items-center justify-between px-md h-14 bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
      <h1 className="text-headline-md font-bold text-primary">Oral Screen AI</h1>
      <div className="flex items-center gap-sm">
        <button
          onClick={() => navigate('/bantuan')}
          aria-label="Bantuan"
          className="p-2 text-on-surface-variant rounded-full"
        >
          <HelpCircle size={22} />
        </button>
        <button aria-label="Notifikasi" className="p-2 text-on-surface-variant rounded-full relative">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>
      </div>
    </header>
  );
}
