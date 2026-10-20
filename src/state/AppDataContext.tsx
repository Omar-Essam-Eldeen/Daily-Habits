import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_START_DATE } from '../lib/habits';
import { customDayCompletion, dayCompletion } from '../lib/stats';
import {
  checkKey,
  customCheckKey,
  loadAppData,
  newCustomHabitId,
  saveAppData,
  type AppData,
  type CustomHabit,
  type DaySubmission,
  type Lang,
} from '../lib/storage';

export interface CustomHabitDraft {
  title: string;
  note: string | null;
  icon: string;
  color: string;
}

interface AppDataContextValue {
  data: AppData;
  toggleCheck: (day: number, habitIndex: number) => void;
  setNote: (day: number, text: string) => void;
  setStartDate: (iso: string) => void;
  setReminderTime: (time: string | null) => void;
  setLang: (lang: Lang) => void;
  replaceAll: (next: AppData) => void;
  resetProgress: () => void;
  /* v3 */
  toggleCustomCheck: (day: number, customId: string) => void;
  addCustomHabit: (draft: CustomHabitDraft) => void;
  updateCustomHabit: (id: string, draft: CustomHabitDraft) => void;
  setCustomArchived: (id: string, archived: boolean) => void;
  submitDay: (day: number) => void;
  reopenDay: (day: number) => void;
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
      customChecks: {},
      submissions: {},
    }));
  }, [update]);

  const toggleCustomCheck = useCallback(
    (day: number, customId: string) => {
      update((prev) => {
        const key = customCheckKey(day, customId);
        const customChecks = { ...prev.customChecks };
        if (customChecks[key]) {
          delete customChecks[key];
        } else {
          customChecks[key] = true;
        }
        return { ...prev, customChecks };
      });
    },
    [update],
  );

  const addCustomHabit = useCallback(
    (draft: CustomHabitDraft) => {
      update((prev) => {
        const habit: CustomHabit = {
          id: newCustomHabitId(),
          title: draft.title.trim().slice(0, 80),
          note: draft.note?.trim() ? draft.note.trim().slice(0, 160) : null,
          icon: draft.icon,
          color: draft.color,
          archived: false,
        };
        if (!habit.title) return prev;
        return { ...prev, customHabits: [...prev.customHabits, habit] };
      });
    },
    [update],
  );

  const updateCustomHabit = useCallback(
    (id: string, draft: CustomHabitDraft) => {
      update((prev) => ({
        ...prev,
        customHabits: prev.customHabits.map((h) =>
          h.id === id
            ? {
                ...h,
                title: draft.title.trim().slice(0, 80) || h.title,
                note: draft.note?.trim() ? draft.note.trim().slice(0, 160) : null,
                icon: draft.icon,
                color: draft.color,
              }
            : h,
        ),
      }));
    },
    [update],
  );

  const setCustomArchived = useCallback(
    (id: string, archived: boolean) => {
      update((prev) => ({
        ...prev,
        customHabits: prev.customHabits.map((h) => (h.id === id ? { ...h, archived } : h)),
      }));
    },
    [update],
  );

  /** Snapshot the day and soft-lock it (re-openable — see reopenDay). */
  const submitDay = useCallback(
    (day: number) => {
      update((prev) => {
        const active = prev.customHabits.filter((h) => !h.archived).length;
        const snapshot: DaySubmission = {
          coreDone: dayCompletion(prev, day),
          customDone: customDayCompletion(prev, day),
          customTotal: Math.max(active, customDayCompletion(prev, day)),
          note: prev.notes[String(day)] ?? '',
          submittedAt: new Date().toISOString(),
        };
        return { ...prev, submissions: { ...prev.submissions, [String(day)]: snapshot } };
      });
    },
    [update],
  );

  /** Undo a submission (soft lock) so the day can be edited and re-submitted. */
  const reopenDay = useCallback(
    (day: number) => {
      update((prev) => {
        const submissions = { ...prev.submissions };
        delete submissions[String(day)];
        return { ...prev, submissions };
      });
    },
    [update],
  );

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
      toggleCustomCheck,
      addCustomHabit,
      updateCustomHabit,
      setCustomArchived,
      submitDay,
      reopenDay,
    }),
    [
      data,
      toggleCheck,
      setNote,
      setStartDate,
      setReminderTime,
      setLang,
      replaceAll,
      resetProgress,
      toggleCustomCheck,
      addCustomHabit,
      updateCustomHabit,
      setCustomArchived,
      submitDay,
      reopenDay,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside <AppDataProvider>');
  return ctx;
}
