import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ShieldCheck, CheckCircle2, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';
import { useLang } from '../lib/i18n';

type Mode = 'login' | 'register';

export function Login() {
  const { authed, login, register } = useAuth();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (authed) return <Navigate to="/" replace />;

  const isRegister = mode === 'register';

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
    setConfirmPassword('');
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (isRegister) {
      if (!displayName.trim()) {
        setError(t('Nama tampilan wajib diisi.', 'Display name is required.'));
        return;
      }
      if (password.length < 6) {
        setError(t('Kata sandi minimal 6 karakter.', 'Password must be at least 6 characters.'));
        return;
      }
      if (password !== confirmPassword) {
        setError(t('Konfirmasi kata sandi tidak cocok.', 'Passwords do not match.'));
        return;
      }
    }

    setSubmitting(true);
    const result = isRegister
      ? await register(email, password, displayName)
      : await login(email, password);

    if (!result.ok) {
      setError(result.error ?? t('Terjadi kesalahan. Coba lagi.', 'Something went wrong. Try again.'));
      setSubmitting(false);
      return;
    }

    if (result.needsConfirmation) {
      setMode('login');
      setPassword('');
      setConfirmPassword('');
      setNotice(
        t(
          'Registrasi berhasil. Cek email Anda untuk konfirmasi, lalu masuk.',
          'Registration successful. Check your email to confirm, then sign in.',
        ),
      );
      setSubmitting(false);
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-md py-lg">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-sm">
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

        <div className="text-center mb-lg">
          <h1 className="text-display-lg-mobile md:text-display-lg font-bold text-primary">Oral Screen AI</h1>
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            Healthcare Portal
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg">
          <h2 className="text-headline-md font-bold text-on-surface mb-xs">
            {isRegister ? t('Buat Akun Baru', 'Create New Account') : t('Masuk ke Akun Anda', 'Sign In to Your Account')}
          </h2>
          <p className="text-body-md text-on-surface-variant mb-md">
            {isRegister
              ? t('Daftar untuk mulai memantau kesehatan mulut Anda.', 'Sign up to start monitoring your oral health.')
              : t('Pantau kesehatan mulut Anda dengan aman.', 'Monitor your oral health securely.')}
          </p>

          <form onSubmit={onSubmit} className="space-y-md">
            <label className="block">
              <span className="text-label-md font-semibold text-on-surface-variant">Email</span>
              <div className="relative mt-xs">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </label>

            {isRegister && (
              <label className="block">
                <span className="text-label-md font-semibold text-on-surface-variant">
                  {t('Nama Tampilan', 'Display Name')}
                </span>
                <div className="relative mt-xs">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  <input
                    type="text"
                    autoComplete="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t('Nama lengkap Anda', 'Your full name')}
                    required
                    className="w-full h-12 pl-11 pr-4 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="text-label-md font-semibold text-on-surface-variant">
                {t('Kata Sandi', 'Password')}
              </span>
              <div className="relative mt-xs">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                <input
                  type="password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? t('Minimal 6 karakter', 'At least 6 characters') : '••••••••'}
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </label>

            {isRegister && (
              <label className="block">
                <span className="text-label-md font-semibold text-on-surface-variant">
                  {t('Konfirmasi Kata Sandi', 'Confirm Password')}
                </span>
                <div className="relative mt-xs">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('Ulangi kata sandi', 'Re-enter password')}
                    required
                    className="w-full h-12 pl-11 pr-4 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </label>
            )}

            {error && (
              <p className="text-body-md text-error bg-error-container rounded-lg px-md py-sm">{error}</p>
            )}
            {notice && (
              <p className="text-body-md text-on-tertiary-container bg-tertiary-container rounded-lg px-md py-sm flex items-start gap-xs">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> {notice}
              </p>
            )}

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
              {submitting
                ? t('Memproses…', 'Processing…')
                : isRegister
                  ? t('Daftar', 'Sign Up')
                  : t('Masuk', 'Sign In')}
            </Button>
          </form>

          <p className="text-body-md text-on-surface-variant text-center mt-md">
            {isRegister ? t('Sudah punya akun?', 'Already have an account?') : t('Belum punya akun?', "Don't have an account?")}{' '}
            <button
              type="button"
              onClick={() => switchMode(isRegister ? 'login' : 'register')}
              className="font-semibold text-primary hover:underline"
            >
              {isRegister ? t('Masuk', 'Sign In') : t('Daftar', 'Sign Up')}
            </button>
          </p>

          <div className="mt-md pt-md border-t border-outline-variant">
            <p className="text-caption text-on-surface-variant flex items-center gap-xs flex-wrap">
              <ShieldCheck size={14} className="text-tertiary" /> {t('Akun demo:', 'Demo account:')}
              <span className="font-semibold text-on-surface">user@example.com</span> /
              <span className="font-semibold text-on-surface">user123</span>
            </p>
          </div>
        </div>

        <p className="text-caption text-on-surface-variant text-center mt-md">
          {t(
            'Oral Screen AI adalah alat bantu triase, bukan diagnosis.',
            'Oral Screen AI is a triage aid, not a diagnosis.',
          )}
        </p>
      </div>
    </div>
  );
}
