import { TOTAL_DAYS } from './habits';

/** Parse a 'yyyy-mm-dd' string into a local Date (midnight, local time). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map((n) => Number.parseInt(n, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Format a local Date as 'yyyy-mm-dd'. */
export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function todayISO(): string {
  return formatISODate(new Date());
}

/** The calendar date of challenge day `day` (1-based) given the start date. */
export function dateOfDay(startISO: string, day: number): Date {
  return addDays(parseISODate(startISO), day - 1);
}

/**
 * Which challenge day is "today" (1..21, clamped) given the start date.
 * Before the start date it is day 1; after the challenge ends it is day 21.
 */
export function todayDayNumber(startISO: string): number {
  const start = startOfDay(parseISODate(startISO));
  const now = startOfDay(new Date());
  const diff = Math.round((now.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.min(TOTAL_DAYS, Math.max(1, diff));
}

/** True when today is still inside the 21-day window. */
export function isWithinChallenge(startISO: string): boolean {
  const start = startOfDay(parseISODate(startISO));
  const now = startOfDay(new Date());
  const diff = Math.round((now.getTime() - start.getTime()) / 86_400_000);
  return diff >= 0 && diff < TOTAL_DAYS;
}

/** Long, localised date label, e.g. "Sunday, 18 October" / Arabic equivalent. */
export function formatDayLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/** Short label for the day selector, e.g. "18 Oct". */
export function formatShortDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
}
