import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';

export function Login() {
  const { authed, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (authed) return <Navigate to="/" replace />;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    // Small delay to feel like a real request.
    setTimeout(() => {
      if (login(email, password)) {
        navigate('/', { replace: true });
      } else {
        setError('Email atau kata sandi salah. Coba lagi.');
        setSubmitting(false);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-md py-lg">
      <div className="w-full max-w-md">
        <div className="text-center mb-lg">
          <h1 className="text-display-lg-mobile md:text-display-lg font-bold text-primary">Oral Screen AI</h1>
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            Healthcare Portal
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg">
          <h2 className="text-headline-md font-bold text-on-surface mb-xs">Masuk ke Akun Anda</h2>
          <p className="text-body-md text-on-surface-variant mb-md">
            Pantau kesehatan mulut Anda dengan aman.
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

            <label className="block">
              <span className="text-label-md font-semibold text-on-surface-variant">Kata Sandi</span>
              <div className="relative mt-xs">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </label>

            {error && (
              <p className="text-body-md text-error bg-error-container rounded-lg px-md py-sm">{error}</p>
            )}

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
              {submitting ? 'Memproses…' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-md pt-md border-t border-outline-variant">
            <p className="text-caption text-on-surface-variant flex items-center gap-xs">
              <ShieldCheck size={14} className="text-tertiary" /> Akun demo:
              <span className="font-semibold text-on-surface">user@example.com</span> /
              <span className="font-semibold text-on-surface">user123</span>
            </p>
          </div>
        </div>

        <p className="text-caption text-on-surface-variant text-center mt-md">
          Oral Screen AI adalah alat bantu triase, bukan diagnosis.
        </p>
      </div>
    </div>
  );
}
