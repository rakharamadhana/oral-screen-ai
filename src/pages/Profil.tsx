import { useEffect, useState } from 'react';
import {
  User,
  ShieldCheck,
  Bell,
  Settings,
  Lock,
  Fingerprint,
  Shield,
  Globe,
  HelpCircle,
  Trash2,
  ChevronRight,
  Edit3,
  BadgeCheck,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getProfile, saveProfile } from '../lib/repository';
import { SEED_PROFILE } from '../lib/mockData';
import { useAuth } from '../lib/auth';
import type { Profile as ProfileType } from '../lib/types';

export function Profil() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const [profile, setProfile] = useState<ProfileType>(SEED_PROFILE);

  useEffect(() => {
    getProfile().then(setProfile).catch(() => setProfile(SEED_PROFILE));
  }, []);

  const setNotif = (key: keyof ProfileType['notifications']) => {
    const next = {
      ...profile,
      notifications: { ...profile.notifications, [key]: !profile.notifications[key] },
    };
    setProfile(next);
    saveProfile(next).catch(() => undefined);
  };

  return (
    <div className="space-y-md">
      {/* Header card */}
      <Card className="p-lg flex flex-col sm:flex-row items-center gap-md">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-3xl font-bold">
            {profile.fullName.charAt(0)}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center border-2 border-surface-container-lowest">
            <Edit3 size={14} />
          </button>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-headline-md font-bold text-on-surface">{profile.fullName}</h3>
          <p className="text-body-md text-on-surface-variant">{profile.email}</p>
          <div className="flex flex-wrap gap-sm justify-center sm:justify-start mt-sm">
            <span className="bg-secondary-container text-on-secondary text-label-md font-bold px-sm py-xs rounded-full uppercase">
              Member sejak {profile.memberSince}
            </span>
            {profile.verified && (
              <span className="bg-tertiary text-on-tertiary text-label-md font-bold px-sm py-xs rounded-full flex items-center gap-xs">
                <BadgeCheck size={14} /> Profil Terverifikasi
              </span>
            )}
          </div>
        </div>
        <Button>
          <Edit3 size={16} /> Ubah Profil
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* Data pribadi */}
        <SettingsCard icon={User} title="Data Pribadi">
          <Row label="Nama Lengkap" value={profile.fullName} />
          <Row label="Tanggal Lahir" value={profile.birthDate} />
          <Row label="Nomor Telepon" value={profile.phone} />
        </SettingsCard>

        {/* Keamanan */}
        <SettingsCard icon={ShieldCheck} title="Keamanan & Kata Sandi">
          <IconRow icon={Lock} title="Ubah Kata Sandi" subtitle="Terakhir diubah 2 bulan lalu" />
          <ToggleRow icon={Fingerprint} title="Biometrik Login" subtitle="Aktif (Face ID / Sidik Jari)" on />
          <IconRow icon={Shield} title="Otentikasi Dua Faktor" subtitle="Tingkatkan keamanan akun Anda" />
        </SettingsCard>

        {/* Notifikasi */}
        <SettingsCard icon={Bell} title="Notifikasi Aplikasi">
          <ToggleRow
            title="Notifikasi Pemeriksaan"
            on={profile.notifications.exams}
            onToggle={() => setNotif('exams')}
          />
          <ToggleRow
            title="Edukasi Kesehatan"
            on={profile.notifications.education}
            onToggle={() => setNotif('education')}
          />
          <ToggleRow
            title="Pembaruan Versi"
            on={profile.notifications.updates}
            onToggle={() => setNotif('updates')}
          />
        </SettingsCard>

        {/* Akun & bantuan */}
        <SettingsCard icon={Settings} title="Akun & Bantuan">
          <IconRow icon={Globe} title="Bahasa" subtitle="Indonesia" />
          <IconRow icon={HelpCircle} title="Pusat Bantuan" />
          <IconRow icon={Trash2} title="Hapus Akun" danger />
        </SettingsCard>
      </div>

      <div className="md:hidden">
        <Button
          variant="outline"
          fullWidth
          onClick={onLogout}
          className="!text-error !border-error-container !bg-error-container"
        >
          <LogOut size={18} /> Keluar
        </Button>
      </div>

      <p className="text-caption text-on-surface-variant text-center pt-sm">
        Oral Screen AI v2.4.0 — Dibuat dengan presisi medis.
      </p>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-lg">
      <h4 className="text-headline-md font-bold text-on-surface flex items-center gap-sm mb-md pb-sm border-b border-outline-variant">
        <Icon size={20} className="text-primary" /> {title}
      </h4>
      <div className="space-y-sm">{children}</div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-outline-variant last:border-0 py-sm">
      <div>
        <p className="text-caption text-on-surface-variant">{label}</p>
        <p className="text-body-md text-on-surface">{value}</p>
      </div>
      <ChevronRight size={18} className="text-on-surface-variant" />
    </div>
  );
}

function IconRow({
  icon: Icon,
  title,
  subtitle,
  danger,
}: {
  icon: typeof User;
  title: string;
  subtitle?: string;
  danger?: boolean;
}) {
  return (
    <button className="w-full flex items-center gap-sm py-sm">
      <span
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          danger ? 'bg-error-container text-error' : 'bg-surface-container text-primary'
        }`}
      >
        <Icon size={18} />
      </span>
      <span className="flex-1 text-left">
        <span className={`block text-body-md font-semibold ${danger ? 'text-error' : 'text-on-surface'}`}>
          {title}
        </span>
        {subtitle && <span className="block text-caption text-on-surface-variant">{subtitle}</span>}
      </span>
      <ChevronRight size={18} className="text-on-surface-variant" />
    </button>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  subtitle,
  on,
  onToggle,
}: {
  icon?: typeof User;
  title: string;
  subtitle?: string;
  on: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="flex items-center gap-sm py-sm">
      {Icon && (
        <span className="w-9 h-9 rounded-lg bg-surface-container text-primary flex items-center justify-center">
          <Icon size={18} />
        </span>
      )}
      <span className="flex-1">
        <span className="block text-body-md font-semibold text-on-surface">{title}</span>
        {subtitle && <span className="block text-caption text-on-surface-variant">{subtitle}</span>}
      </span>
      <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors relative ${on ? 'bg-primary' : 'bg-outline-variant'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
        />
      </button>
    </div>
  );
}
