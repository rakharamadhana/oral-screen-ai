// Lightweight bilingual i18n (Indonesian default, English optional).
//
// Usage: const { t, lang, setLang } = useLang();  t('Masuk', 'Sign In')
// Wrap the target string in t(id, en). Untouched strings stay Indonesian, so
// coverage can grow incrementally. Choice persists in localStorage.

import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'id' | 'en';

const LANG_KEY = 'osa:lang:v1';

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Returns the English string when the language is English, else Indonesian. */
  t: (id: string, en: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'id',
  setLang: () => {},
  t: (id) => id,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === 'en' || saved === 'id' ? saved : 'id';
  });

  const setLang = (next: Lang) => {
    localStorage.setItem(LANG_KEY, next);
    setLangState(next);
  };

  const t = (id: string, en: string) => (lang === 'en' ? en : id);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useLang() {
  return useContext(I18nContext);
}
