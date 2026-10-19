import { DEFAULT_START_DATE, HABITS, TOTAL_DAYS } from './habits';

export type Lang = 'en' | 'ar';

export interface AppSettings {
  lang: Lang;
  /** 'HH:MM' 24h, or null when reminders are off. */
  reminderTime: string | null;
}

export interface AppData {
  /** 'yyyy-mm-dd' — day 1 of the challenge. */
  startDate: string;
  /** Ticked habits. Key format: `${day}-${habitIndex}` (day 1..21, habitIndex 0..9). Value always true. */
  checks: Record<string, true>;
  /** Free-text note per day. Key: day number as string ('1'..'21'). */
  notes: Record<string, string>;
  settings: AppSettings;
}

export const STORAGE_KEY = 'habits-app:v1';

export const DEFAULT_DATA: AppData = {
  startDate: DEFAULT_START_DATE,
  checks: {},
  notes: {},
  settings: { lang: 'en', reminderTime: null },
};

export function checkKey(day: number, habitIndex: number): string {
  return `${day}-${habitIndex}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidISODate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00`);
  return !Number.isNaN(d.getTime());
}

/**
 * Validate and sanitise an unknown value into AppData, or return null when
 * the shape is not recognisably a habits-app backup/state document.
 * Unknown or malformed entries are dropped rather than trusted.
 */
export function sanitizeAppData(value: unknown): AppData | null {
  if (!isRecord(value)) return null;
  if (!isValidISODate(value.startDate)) return null;
  if (!isRecord(value.checks) || !isRecord(value.notes) || !isRecord(value.settings)) return null;

  const checks: Record<string, true> = {};
  for (const key of Object.keys(value.checks)) {
    const match = /^(\d{1,2})-(\d{1,2})$/.exec(key);
    if (!match) continue;
    const day = Number(match[1]);
    const habitIndex = Number(match[2]);
    if (day < 1 || day > TOTAL_DAYS || habitIndex < 0 || habitIndex >= HABITS.length) continue;
    if (value.checks[key] === true) checks[key] = true;
  }

  const notes: Record<string, string> = {};
  for (const key of Object.keys(value.notes)) {
    const day = Number(key);
    const text = value.notes[key];
    if (Number.isInteger(day) && day >= 1 && day <= TOTAL_DAYS && typeof text === 'string') {
      notes[key] = text.slice(0, 2000);
    }
  }

  const lang: Lang = value.settings.lang === 'ar' ? 'ar' : 'en';
  const reminderRaw = value.settings.reminderTime;
  const reminderTime =
    typeof reminderRaw === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(reminderRaw)
      ? reminderRaw
      : null;

  return {
    startDate: value.startDate,
    checks,
    notes,
    settings: { lang, reminderTime },
  };
}

export function loadAppData(): AppData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed: unknown = JSON.parse(raw);
    return sanitizeAppData(parsed) ?? structuredClone(DEFAULT_DATA);
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

export function saveAppData(data: AppData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable (private mode) — the app keeps working in-memory.
  }
}
