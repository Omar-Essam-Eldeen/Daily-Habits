import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { DirectionProvider, useDirection } from '@mantine/core';
import { useAppData } from '../state/AppDataContext';
import type { Lang } from '../lib/storage';
import { translations, type TranslationKey } from './translations';

interface LanguageContextValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Hand-rolled, dependency-free i18n: the language lives in the persisted app
 * settings; this provider exposes `t()`, keeps <html lang/dir> in sync, and
 * tells Mantine the text direction so the layout flips properly for Arabic.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { data, setLang } = useAppData();
  const lang = data.settings.lang;
  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      dir,
      setLang,
      t: (key) => translations[lang][key] ?? translations.en[key] ?? key,
    }),
    [lang, dir, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>
      <DirectionProvider initialDirection={dir}>
        <DirectionSync dir={dir} />
        {children}
      </DirectionProvider>
    </LanguageContext.Provider>
  );
}

/** Keeps Mantine's direction context in sync when the language changes. */
function DirectionSync({ dir }: { dir: 'ltr' | 'rtl' }) {
  const { setDirection } = useDirection();
  useEffect(() => {
    setDirection(dir);
  }, [dir, setDirection]);
  return null;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
