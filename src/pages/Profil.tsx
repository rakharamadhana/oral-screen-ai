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
  Loader2,
  ClipboardList,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { getProfile, saveProfile } from '../lib/repository';
import { SEED_PROFILE } from '../lib/mockData';
import { useAuth } from '../lib/auth';
import { useLang } from '../lib/i18n';
import { RISK_FACTORS, type Profile as ProfileType } from '../lib/types';

const RISK_FACTOR_EN: Record<string, string> = {
  'Perokok aktif': 'Active smoker',
  'Konsumsi alkohol rutin': 'Regular alcohol use',
  'Riwayat keluarga kanker mulut': 'Family history of oral cancer',
  'Luka mulut > 2 minggu': 'Mouth sore > 2 weeks',
};

export function Profil() {
  const { logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const [profile, setProfile] = useState<ProfileType>(SEED_PROFILE);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => setProfile(SEED_PROFILE))
      .finally(() => setLoading(false));
  }, []);

  const setNotif = (key: keyof ProfileType['notifications']) => {
    const next = {
      ...profile,
      notifications: { ...profile.notifications, [key]: !profile.notifications[key] },
    };
    setProfile(next);
    saveProfile(next).catch(() => undefined);
  };

  const handleSaveProfile = async (updated: ProfileType) => {
    setProfile(updated);
    await saveProfile(updated);
    setEditing(false);
  };

  const toggleRiskFactor = (label: string) => {
    const has = profile.riskFactors.includes(label);
    const next = {
      ...profile,
      riskFactors: has
        ? profile.riskFactors.filter((f) => f !== label)
        : [...profile.riskFactors, label],
    };
    setProfile(next);
    saveProfile(next).catch(() => undefined);
  };

  if (loading) return <ProfilSkeleton />;

  return (
    <div className="space-y-md">
      {/* Header card */}
      <Card className="p-lg flex flex-col sm:flex-row items-center gap-md">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-3xl font-bold">
            {profile.fullName.charAt(0)}
          </div>
          <button
            onClick={() => setEditing(true)}
            aria-label="Ubah foto profil"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center border-2 border-surface-container-lowest"
          >
            <Edit3 size={14} />
          </button>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-headline-md font-bold text-on-surface">{profile.fullName}</h3>
          <p className="text-body-md text-on-surface-variant">{profile.email}</p>
          <div className="flex flex-wrap gap-sm justify-center sm:justify-start mt-sm">
            <span className="bg-secondary-container text-on-secondary text-label-md font-bold px-sm py-xs rounded-full uppercase">
              {t('Member sejak', 'Member since')} {profile.memberSince}
            </span>
            {profile.verified && (
              <span className="bg-tertiary text-on-tertiary text-label-md font-bold px-sm py-xs rounded-full flex items-center gap-xs">
                <BadgeCheck size={14} /> {t('Profil Terverifikasi', 'Verified Profile')}
              </span>
            )}
          </div>
        </div>
        <Button onClick={() => setEditing(true)}>
          <Edit3 size={16} /> {t('Ubah Profil', 'Edit Profile')}
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* Data pribadi */}
        <SettingsCard icon={User} title={t('Data Pribadi', 'Personal Data')}>
          <Row label={t('Nama Lengkap', 'Full Name')} value={profile.fullName} />
          <Row label={t('Tanggal Lahir', 'Date of Birth')} value={profile.birthDate} />
          <Row label={t('Nomor Telepon', 'Phone Number')} value={profile.phone} />
        </SettingsCard>

        {/* Keamanan */}
        <SettingsCard icon={ShieldCheck} title={t('Keamanan & Kata Sandi', 'Security & Password')}>
          <IconRow
            icon={Lock}
            title={t('Ubah Kata Sandi', 'Change Password')}
            subtitle={t('Terakhir diubah 2 bulan lalu', 'Last changed 2 months ago')}
          />
          <ToggleRow
            icon={Fingerprint}
            title={t('Biometrik Login', 'Biometric Login')}
            subtitle={t('Aktif (Face ID / Sidik Jari)', 'Active (Face ID / Fingerprint)')}
            on
          />
          <IconRow
            icon={Shield}
            title={t('Otentikasi Dua Faktor', 'Two-Factor Authentication')}
            subtitle={t('Tingkatkan keamanan akun Anda', 'Strengthen your account security')}
          />
        </SettingsCard>

        {/* Notifikasi */}
        <SettingsCard icon={Bell} title={t('Notifikasi Aplikasi', 'App Notifications')}>
          <ToggleRow
            title={t('Notifikasi Pemeriksaan', 'Scan Notifications')}
            on={profile.notifications.exams}
            onToggle={() => setNotif('exams')}
          />
          <ToggleRow
            title={t('Edukasi Kesehatan', 'Health Education')}
            on={profile.notifications.education}
            onToggle={() => setNotif('education')}
          />
          <ToggleRow
            title={t('Pembaruan Versi', 'Version Updates')}
            on={profile.notifications.updates}
            onToggle={() => setNotif('updates')}
          />
        </SettingsCard>

        {/* Faktor risiko (kuesioner, ditanya sekali di sini) */}
        <SettingsCard icon={ClipboardList} title={t('Faktor Risiko Kesehatan', 'Health Risk Factors')}>
          <p className="text-caption text-on-surface-variant -mt-xs mb-sm">
            {t(
              'Centang yang sesuai dengan kondisi Anda. Dipakai sebagai konteks saat pemeriksaan.',
              'Check any that apply to you. Used as context during a scan.',
            )}
          </p>
          {RISK_FACTORS.map((factor) => {
            const checked = profile.riskFactors.includes(factor);
            return (
              <label
                key={factor}
                className={`flex items-center gap-sm px-md py-sm rounded-lg border cursor-pointer transition-colors ${
                  checked ? 'border-primary bg-surface-container-low' : 'border-outline-variant'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleRiskFactor(factor)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-body-md text-on-surface">{t(factor, RISK_FACTOR_EN[factor] ?? factor)}</span>
              </label>
            );
          })}
        </SettingsCard>

        {/* Akun & bantuan */}
        <SettingsCard icon={Settings} title={t('Akun & Bantuan', 'Account & Help')}>
          {/* Language selector */}
          <div className="flex items-center gap-sm py-sm">
            <span className="w-9 h-9 rounded-lg bg-surface-container text-primary flex items-center justify-center">
              <Globe size={18} />
            </span>
            <span className="flex-1 text-body-md font-semibold text-on-surface">
              {t('Bahasa', 'Language')}
            </span>
            <div className="inline-flex rounded-full border border-outline-variant overflow-hidden text-label-md font-semibold">
              {(['id', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-sm py-xs ${
                    lang === l ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <IconRow icon={HelpCircle} title={t('Pusat Bantuan', 'Help Center')} onClick={() => navigate('/bantuan')} />
          <IconRow icon={Trash2} title={t('Hapus Akun', 'Delete Account')} danger />
        </SettingsCard>
      </div>

      <div className="md:hidden">
        <Button
          variant="outline"
          fullWidth
          onClick={onLogout}
          className="!text-error !border-error-container !bg-error-container"
        >
          <LogOut size={18} /> {t('Keluar', 'Sign Out')}
        </Button>
      </div>

      <p className="text-caption text-on-surface-variant text-center pt-sm">
        {t('Oral Screen AI v2.4.0 — Dibuat dengan presisi medis.', 'Oral Screen AI v2.4.0 — Built with medical precision.')}
      </p>

      {editing && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}

function EditProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: ProfileType;
  onClose: () => void;
  onSave: (updated: ProfileType) => Promise<void>;
}) {
  const { t } = useLang();
  const [form, setForm] = useState<ProfileType>(profile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof ProfileType, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch {
      setError(t('Gagal menyimpan. Coba lagi.', 'Failed to save. Try again.'));
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} ariaLabel="Edit Profile">
      <h3 className="text-headline-md font-bold text-on-surface mb-md pr-lg">
        {t('Ubah Profil', 'Edit Profile')}
      </h3>

      <div className="space-y-md">
        <TextField label={t('Nama Lengkap', 'Full Name')} value={form.fullName} onChange={(v) => set('fullName', v)} />
        <TextField label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} />
        <TextField label={t('ID Pasien', 'Patient ID')} value={form.medicalId} onChange={(v) => set('medicalId', v)} />
        <TextField label={t('Tanggal Lahir', 'Date of Birth')} value={form.birthDate} onChange={(v) => set('birthDate', v)} />
        <TextField label={t('Nomor Telepon', 'Phone Number')} value={form.phone} onChange={(v) => set('phone', v)} />
      </div>

      {error && <p className="text-caption text-error mt-sm">{error}</p>}

      <div className="flex items-center justify-end gap-sm mt-lg">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          {t('Batal', 'Cancel')}
        </Button>
        <Button onClick={submit} disabled={saving}>
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" /> {t('Menyimpan…', 'Saving…')}
            </>
          ) : (
            t('Simpan', 'Save')
          )}
        </Button>
      </div>
    </Modal>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-caption text-on-surface-variant mb-xs">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-md rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface focus:border-primary focus:outline-none"
      />
    </label>
  );
}

function ProfilSkeleton() {
  return (
    <div className="space-y-md">
      {/* Header card */}
      <Card className="p-lg flex flex-col sm:flex-row items-center gap-md">
        <Skeleton className="w-24 h-24 rounded-full shrink-0" />
        <div className="flex-1 w-full space-y-sm text-center sm:text-left">
          <Skeleton className="h-6 w-48 mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-64 max-w-full mx-auto sm:mx-0" />
          <Skeleton className="h-6 w-40 rounded-full mx-auto sm:mx-0" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </Card>

      {/* Settings cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-lg space-y-md">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        ))}
      </div>
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
  onClick,
}: {
  icon: typeof User;
  title: string;
  subtitle?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-sm py-sm">
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
