// Authentication: real Supabase Auth (email/password) when configured, plus a
// built-in demo account bypass so the app is always explorable.
//
// - Real users: register/login go through supabase.auth. The session is
//   persisted + auto-refreshed by supabase-js.
// - Demo user (user@example.com / user123): a local bypass that works even
//   without a Supabase account or network, for demos and offline use.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

const DEMO_EMAIL = 'user@example.com';
const DEMO_PASSWORD = 'user123';
const DEMO_KEY = 'osa:auth:v1';

export type AuthResult = { ok: boolean; error?: string; needsConfirmation?: boolean };

interface AuthContextValue {
  authed: boolean;
  /** True once the initial session check has completed (avoids a login-page flash on refresh). */
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, displayName: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  authed: false,
  ready: false,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: async () => {},
});

function isDemoCreds(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}

/** Map Supabase auth error messages to friendly Indonesian copy. */
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'Email atau kata sandi salah.';
  if (m.includes('already registered') || m.includes('user already')) return 'Email sudah terdaftar.';
  if (m.includes('password should be at least')) return 'Kata sandi minimal 6 karakter.';
  if (m.includes('invalid email') || m.includes('unable to validate email')) return 'Format email tidak valid.';
  if (m.includes('email not confirmed')) return 'Email belum dikonfirmasi. Cek kotak masuk Anda.';
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [demo, setDemo] = useState<boolean>(() => localStorage.getItem(DEMO_KEY) === 'true');
  // If Supabase isn't configured there's no async session to wait for.
  const [ready, setReady] = useState<boolean>(!supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    if (isDemoCreds(email, password)) {
      localStorage.setItem(DEMO_KEY, 'true');
      setDemo(true);
      return { ok: true };
    }
    if (!supabase) return { ok: false, error: 'Autentikasi tidak tersedia.' };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ok: false, error: friendlyError(error.message) };
    return { ok: true };
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
  ): Promise<AuthResult> => {
    if (!supabase) return { ok: false, error: 'Autentikasi tidak tersedia.' };
    const name = displayName.trim();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // Stored on the Supabase auth user; surfaced later as the profile name.
      options: { data: { full_name: name, display_name: name } },
    });
    if (error) return { ok: false, error: friendlyError(error.message) };
    // Email confirmation on: a user is created but no session until confirmed.
    if (data.user && !data.session) return { ok: true, needsConfirmation: true };
    return { ok: true };
  };

  const logout = async () => {
    localStorage.removeItem(DEMO_KEY);
    setDemo(false);
    if (supabase) await supabase.auth.signOut();
  };

  const authed = demo || !!session;

  return (
    <AuthContext.Provider value={{ authed, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
