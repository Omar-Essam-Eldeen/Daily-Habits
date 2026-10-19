import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_START_DATE } from '../lib/habits';
import {
  checkKey,
  loadAppData,
  saveAppData,
  type AppData,
  type Lang,
} from '../lib/storage';

interface AppDataContextValue {
  data: AppData;
  toggleCheck: (day: number, habitIndex: number) => void;
  setNote: (day: number, text: string) => void;
  setStartDate: (iso: string) => void;
  setReminderTime: (time: string | null) => void;
  setLang: (lang: Lang) => void;
  replaceAll: (next: AppData) => void;
  resetProgress: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData());

  const update = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      saveAppData(next);
      return next;
    });
  }, []);

  const toggleCheck = useCallback(
    (day: number, habitIndex: number) => {
      update((prev) => {
        const key = checkKey(day, habitIndex);
        const checks = { ...prev.checks };
        if (checks[key]) {
          delete checks[key];
        } else {
          checks[key] = true;
        }
        return { ...prev, checks };
      });
    },
    [update],
  );

  const setNote = useCallback(
    (day: number, text: string) => {
      update((prev) => ({ ...prev, notes: { ...prev.notes, [String(day)]: text } }));
    },
    [update],
  );

  const setStartDate = useCallback(
    (iso: string) => update((prev) => ({ ...prev, startDate: iso })),
    [update],
  );

  const setReminderTime = useCallback(
    (time: string | null) =>
      update((prev) => ({ ...prev, settings: { ...prev.settings, reminderTime: time } })),
    [update],
  );

  const setLang = useCallback(
    (lang: Lang) => update((prev) => ({ ...prev, settings: { ...prev.settings, lang } })),
    [update],
  );

  const replaceAll = useCallback(
    (next: AppData) => {
      saveAppData(next);
      setData(next);
    },
    [setData],
  );

  const resetProgress = useCallback(() => {
    update((prev) => ({
      ...prev,
      startDate: DEFAULT_START_DATE,
      checks: {},
      notes: {},
    }));
  }, [update]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      toggleCheck,
      setNote,
      setStartDate,
      setReminderTime,
      setLang,
      replaceAll,
      resetProgress,
    }),
    [data, toggleCheck, setNote, setStartDate, setReminderTime, setLang, replaceAll, resetProgress],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside <AppDataProvider>');
  return ctx;
}
