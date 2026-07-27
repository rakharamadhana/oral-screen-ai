import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { SIDEBAR_ITEMS } from './navItems';
import { EMPTY_PROFILE } from '../../lib/mockData';
import { getProfile } from '../../lib/repository';
import { useAuth } from '../../lib/auth';
import { useLang } from '../../lib/i18n';
import type { Profile } from '../../lib/types';

/** Fixed 240px desktop sidebar (hidden below md). */
export function Sidebar() {
  const { logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => undefined);
  }, []);
  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-surface border-r border-outline-variant flex-col py-md px-sm z-50">
      <div className="px-md py-sm">
        <h1 className="text-headline-md font-bold text-primary">Oral Screen AI</h1>
        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
          Healthcare Portal
        </p>
      </div>

      <nav className="flex-1 mt-lg px-xs space-y-base">
        {SIDEBAR_ITEMS.map(({ to, label, labelEn, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-sm px-md py-sm rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-label-md font-semibold">{t(label, labelEn)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-md pt-md border-t border-outline-variant space-y-md">
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold">
            {profile.fullName.charAt(0) || '·'}
          </div>
          <div>
            <p className="text-label-md font-semibold text-on-surface">
              {profile.fullName || t('Memuat…', 'Loading…')}
            </p>
            {profile.medicalId && (
              <p className="text-[10px] text-on-surface-variant">ID: {profile.medicalId}</p>
            )}
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-sm text-error text-label-md font-semibold hover:opacity-80 transition-opacity"
        >
          <LogOut size={18} />
          {t('Keluar', 'Sign Out')}
        </button>
      </div>
    </aside>
  );
}
