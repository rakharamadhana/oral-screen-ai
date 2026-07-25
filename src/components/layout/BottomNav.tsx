import { NavLink } from 'react-router-dom';
import { BOTTOM_ITEMS } from './navItems';

/**
 * Mobile bottom navigation (hidden at md+). Five tabs; the ACTIVE tab renders as
 * a filled indigo pill (icon + label in white), inactive tabs are muted.
 */
export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-around px-base z-40">
      {BOTTOM_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === '/'} className="flex-1 flex justify-center">
          {({ isActive }) => (
            <span
              className={`flex flex-col items-center gap-0.5 rounded-full transition-colors ${
                isActive
                  ? 'bg-primary text-on-primary px-md py-base'
                  : 'text-on-surface-variant px-sm py-base'
              }`}
            >
              <Icon size={22} />
              <span className="text-[11px] font-semibold">{label}</span>
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
