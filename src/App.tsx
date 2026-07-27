import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AppShell } from './components/layout/AppShell';
import { LanguageProvider } from './lib/i18n';
import { AuthProvider, useAuth } from './lib/auth';
import { Login } from './pages/Login';
import { Beranda } from './pages/Beranda';
import { Pemeriksaan } from './pages/Pemeriksaan';
import { Edukasi } from './pages/Edukasi';
import { ArticleDetail } from './pages/ArticleDetail';
import { Riwayat } from './pages/Riwayat';
import { Profil } from './pages/Profil';
import { Bantuan } from './pages/Bantuan';
import type { ReactNode } from 'react';

function RequireAuth({ children }: { children: ReactNode }) {
  const { authed, ready } = useAuth();
  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }
  return authed ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Beranda />} />
            <Route path="/pemeriksaan" element={<Pemeriksaan />} />
            <Route path="/edukasi" element={<Edukasi />} />
            <Route path="/edukasi/:slug" element={<ArticleDetail />} />
            <Route path="/riwayat" element={<Riwayat />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/bantuan" element={<Bantuan />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
