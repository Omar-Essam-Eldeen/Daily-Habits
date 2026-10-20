import { DEFAULT_START_DATE, HABITS, TOTAL_DAYS } from './habits';

export type Lang = 'en' | 'ar';

export interface AppSettings {
  lang: Lang;
  /** 'HH:MM' 24h, or null when reminders are off. */
  reminderTime: string | null;
}

/**
 * A user-added habit (v3). Customs live in their own collection, entirely
 * separate from the poster's core 10: they never count toward the 210
 * total, the milestones, or the challenge score/streak. IDs are permanent
 * random strings — never the habit's name or a list index — so renaming or
 * reordering can never corrupt history.
 */
export interface CustomHabit {
  id: string;
  title: string;
  note: string | null;
  /** Key into the custom icon set (see src/components/customIcons.tsx). */
  icon: string;
  /** Mantine colour name from the per-habit palette. */
  color: string;
  /** Archived habits keep their history but leave the daily list. */
  archived: boolean;
}

/** Snapshot saved when a day is submitted (v3, soft lock). */
export interface DaySubmission {
  /** Core habits ticked at submit time (0..10). */
  coreDone: number;
  /** Custom habits ticked at submit time. */
  customDone: number;
  /** Custom habits that existed (active) at submit time. */
  customTotal: number;
  /** Copy of the day note at submit time. */
  note: string;
  /** ISO timestamp of the submission. */
  submittedAt: string;
}

export interface AppData {
  /** Data-model version. v1/v2 documents have no field (= 1); v3 writes 3. */
  schemaVersion: number;
  /** 'yyyy-mm-dd' — day 1 of the challenge. */
  startDate: string;
  /** Ticked CORE habits. Key format: `${day}-${habitIndex}` (day 1..21, habitIndex 0..9). Value always true. */
  checks: Record<string, true>;
  /** Free-text note per day. Key: day number as string ('1'..'21'). */
  notes: Record<string, string>;
  settings: AppSettings;
  /** v3: user-added habits (empty for migrated v1/v2 data). */
  customHabits: CustomHabit[];
  /** v3: ticked CUSTOM habits. Key format: `${day}-${customHabitId}`. */
  customChecks: Record<string, true>;
  /** v3: submitted-day snapshots. Key: day number as string ('1'..'21'). */
  submissions: Record<string, DaySubmission>;
}

export const STORAGE_KEY = 'habits-app:v1';
/** Raw copy of the pre-v3 document, written once before the first v3 save. */
export const PRE_UPGRADE_BACKUP_KEY = 'habits-app:pre-v3-backup';

export const CURRENT_SCHEMA_VERSION = 3;

export const DEFAULT_DATA: AppData = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  startDate: DEFAULT_START_DATE,
  checks: {},
  notes: {},
  settings: { lang: 'en', reminderTime: null },
  customHabits: [],
  customChecks: {},
  submissions: {},
};

export function checkKey(day: number, habitIndex: number): string {
  return `${day}-${habitIndex}`;
}

export function customCheckKey(day: number, customId: string): string {
  return `${day}-${customId}`;
}

/** Permanent random ID for a custom habit (never derived from its name). */
export function newCustomHabitId(): string {
  try {
    return `c_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  } catch {
    return `c_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidISODate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00`);
  return !Number.isNaN(d.getTime());
}

const CUSTOM_COLORS = [
  'leaf', 'orange', 'indigo', 'violet', 'yellow', 'pink',
  'teal', 'grape', 'cyan', 'blue', 'lime', 'red',
];
export const CUSTOM_HABIT_COLORS = CUSTOM_COLORS;

function sanitizeCustomHabits(value: unknown): CustomHabit[] {
  if (!Array.isArray(value)) return [];
  const out: CustomHabit[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!isRecord(item)) continue;
    const id = item.id;
    if (typeof id !== 'string' || id.length < 1 || id.length > 64 || seen.has(id)) continue;
    const title = typeof item.title === 'string' ? item.title.trim().slice(0, 80) : '';
    if (!title) continue;
    seen.add(id);
    out.push({
      id,
      title,
      note:
        typeof item.note === 'string' && item.note.trim()
          ? item.note.trim().slice(0, 160)
          : null,
      icon: typeof item.icon === 'string' && item.icon.length <= 32 ? item.icon : 'sparkles',
      color:
        typeof item.color === 'string' && CUSTOM_COLORS.includes(item.color)
          ? item.color
          : 'leaf',
      archived: item.archived === true,
    });
    if (out.length >= 50) break; // generous sanity cap for a family app
  }
  return out;
}

function sanitizeSubmissions(value: unknown): Record<string, DaySubmission> {
  const out: Record<string, DaySubmission> = {};
  if (!isRecord(value)) return out;
  for (const key of Object.keys(value)) {
    const day = Number(key);
    const s = value[key];
    if (!Number.isInteger(day) || day < 1 || day > TOTAL_DAYS || !isRecord(s)) continue;
    const coreDone = Number(s.coreDone);
    const customDone = Number(s.customDone);
    const customTotal = Number(s.customTotal);
    if (!Number.isInteger(coreDone) || coreDone < 0 || coreDone > HABITS.length) continue;
    if (!Number.isInteger(customDone) || customDone < 0) continue;
    if (!Number.isInteger(customTotal) || customTotal < 0) continue;
    out[key] = {
      coreDone,
      customDone,
      customTotal,
      note: typeof s.note === 'string' ? s.note.slice(0, 2000) : '',
      submittedAt: typeof s.submittedAt === 'string' ? s.submittedAt.slice(0, 40) : '',
    };
  }
  return out;
}

/**
 * Validate and sanitise an unknown value into AppData, or return null when
 * the shape is not recognisably a habits-app backup/state document.
 * Accepts v1/v2 documents (no customs / submissions — they default to
 * empty) as well as v3 documents, so every existing backup keeps working.
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

  const customHabits = sanitizeCustomHabits(value.customHabits);
  const customIds = new Set(customHabits.map((h) => h.id));
  const customChecks: Record<string, true> = {};
  if (isRecord(value.customChecks)) {
    for (const key of Object.keys(value.customChecks)) {
      const match = /^(\d{1,2})-(.+)$/.exec(key);
      if (!match) continue;
      const day = Number(match[1]);
      const id = match[2] as string;
      if (day < 1 || day > TOTAL_DAYS || !customIds.has(id)) continue;
      if (value.customChecks[key] === true) customChecks[key] = true;
    }
  }

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    startDate: value.startDate,
    checks,
    notes,
    settings: { lang, reminderTime },
    customHabits,
    customChecks,
    submissions: sanitizeSubmissions(value.submissions),
  };
}

export function loadAppData(): AppData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed: unknown = JSON.parse(raw);
    const clean = sanitizeAppData(parsed);
    if (!clean) return structuredClone(DEFAULT_DATA);
    // Migration (v1/v2 → v3): before v3 writes anything back, keep one raw
    // copy of the untouched pre-upgrade document as an automatic backup.
    const wasLegacy =
      !isRecord(parsed) || typeof parsed.schemaVersion !== 'number' || parsed.schemaVersion < 3;
    if (wasLegacy) {
      try {
        if (!window.localStorage.getItem(PRE_UPGRADE_BACKUP_KEY)) {
          window.localStorage.setItem(PRE_UPGRADE_BACKUP_KEY, raw);
        }
      } catch {
        // Backup is best-effort; the migration itself must never break loading.
      }
      saveAppData(clean);
    }
    return clean;
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
