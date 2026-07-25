// Demo authentication gate.
//
// NOTE: this is a prototype login only — the credentials live in the client
// bundle and provide no real security. Replace with Supabase Auth for anything
// beyond a demo. See supabase/migrations for the auth-ready RLS TODO.

import { createContext, useContext, useState, type ReactNode } from 'react';

const DEMO_EMAIL = 'user@example.com';
const DEMO_PASSWORD = 'user123';
const STORAGE_KEY = 'osa:auth:v1';

interface AuthContextValue {
  authed: boolean;
  /** Returns true on success, false on bad credentials. */
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  authed: false,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(() => localStorage.getItem(STORAGE_KEY) === 'true');

  const login = (email: string, password: string): boolean => {
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
  };

  return <AuthContext.Provider value={{ authed, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
