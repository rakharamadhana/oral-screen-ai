import { NavLink } from 'react-router-dom';
import { BOTTOM_ITEMS } from './navItems';
import { useLang } from '../../lib/i18n';

/**
 * Mobile bottom navigation (hidden at md+). Five tabs; the center Scan tab is a
 * raised, enlarged primary button so the core action stands out. Other active
 * tabs are colored; inactive tabs are muted.
 */
export function BottomNav() {
  const { t } = useLang();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-around px-base z-40">
      {BOTTOM_ITEMS.map(({ to, label, labelEn, icon: Icon }) => {
        const isScan = to === '/pemeriksaan';
        const text = t(label, labelEn);

        if (isScan) {
          return (
            <NavLink key={to} to={to} className="flex-1 flex justify-center" aria-label={text}>
              {({ isActive }) => (
                <span className="flex flex-col items-center -mt-8">
                  <span
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-surface-container-lowest shadow-lg transition-transform ${
                      isActive ? 'bg-primary text-on-primary scale-105' : 'bg-primary text-on-primary'
                    }`}
                  >
                    <Icon size={30} />
                  </span>
                  <span
                    className={`text-[11px] font-semibold mt-0.5 ${
                      isActive ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {text}
                  </span>
                </span>
              )}
            </NavLink>
          );
        }

        return (
          <NavLink key={to} to={to} end={to === '/'} className="flex-1 flex justify-center">
            {({ isActive }) => (
              <span
                className={`flex flex-col items-center gap-0.5 rounded-full px-sm py-base transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                <Icon size={22} />
                <span className="text-[11px] font-semibold">{text}</span>
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
