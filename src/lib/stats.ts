import { HABITS, TOTAL_CHECKS, TOTAL_DAYS } from './habits';
import {
  checkKey,
  customCheckKey,
  type AppData,
  type CustomHabit,
  type DaySubmission,
} from './storage';

export function isChecked(data: AppData, day: number, habitIndex: number): boolean {
  return data.checks[checkKey(day, habitIndex)] === true;
}

export function dayCompletion(data: AppData, day: number): number {
  let done = 0;
  for (let h = 0; h < HABITS.length; h += 1) {
    if (isChecked(data, day, h)) done += 1;
  }
  return done;
}

export function isDayComplete(data: AppData, day: number): boolean {
  return dayCompletion(data, day) === HABITS.length;
}

export function habitCompletion(data: AppData, habitIndex: number): number {
  let done = 0;
  for (let d = 1; d <= TOTAL_DAYS; d += 1) {
    if (isChecked(data, d, habitIndex)) done += 1;
  }
  return done;
}

export function totalCompletion(data: AppData): number {
  return Object.keys(data.checks).length;
}

/** Completion as a percentage 0..100 (rounded). */
export function percent(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

export function overallPercent(data: AppData): number {
  return percent(totalCompletion(data), TOTAL_CHECKS);
}

/**
 * Current streak for a habit, counted back from `uptoDay` (normally today).
 * Forgiving by design: if `uptoDay` itself is not yet ticked (the day is
 * still in progress), the streak is counted back from the day before, so an
 * unfinished today never "breaks" a streak — and this number is always shown
 * next to the habit's total completion %, never as a punitive all-or-nothing.
 */
export function currentStreak(data: AppData, habitIndex: number, uptoDay: number): number {
  let day = uptoDay;
  if (day >= 1 && !isChecked(data, day, habitIndex)) day -= 1;
  let streak = 0;
  while (day >= 1 && isChecked(data, day, habitIndex)) {
    streak += 1;
    day -= 1;
  }
  return streak;
}

/** Milestone days (7 / 14 / 21) that are fully complete. */
export function completedMilestones(data: AppData): number[] {
  return [7, 14, 21].filter((d) => isDayComplete(data, d));
}

/** Completion for one week of the challenge (week 0 = days 1–7, 1 = 8–14, 2 = 15–21). */
export function weekCompletion(data: AppData, week: number): { done: number; total: number } {
  const firstDay = week * 7 + 1;
  const lastDay = Math.min(firstDay + 6, TOTAL_DAYS);
  let done = 0;
  for (let d = firstDay; d <= lastDay; d += 1) done += dayCompletion(data, d);
  return { done, total: (lastDay - firstDay + 1) * HABITS.length };
}

/** The day with the most habits ticked (earliest day wins ties). */
export function bestDay(data: AppData): { day: number; done: number } {
  let best = { day: 1, done: -1 };
  for (let d = 1; d <= TOTAL_DAYS; d += 1) {
    const done = dayCompletion(data, d);
    if (done > best.done) best = { day: d, done };
  }
  return best;
}

/**
 * Challenge "showed-up" streak ending at `uptoDay`: consecutive days with
 * at least one CORE habit ticked. Forgiving like everything else here —
 * an unfinished today (0 ticks so far) never breaks the streak.
 */
export function progressStreak(data: AppData, uptoDay: number): number {
  let day = Math.min(uptoDay, TOTAL_DAYS);
  if (day >= 1 && dayCompletion(data, day) === 0) day -= 1;
  let streak = 0;
  while (day >= 1 && dayCompletion(data, day) > 0) {
    streak += 1;
    day -= 1;
  }
  return streak;
}

/* ------------------------------------------------------------------ */
/* v3: custom habits — their own stats, completely separate from the   */
/* core challenge score (210 total, milestones, submit score).        */
/* ------------------------------------------------------------------ */

export function activeCustomHabits(data: AppData): CustomHabit[] {
  return data.customHabits.filter((h) => !h.archived);
}

export function isCustomChecked(data: AppData, day: number, customId: string): boolean {
  return data.customChecks[customCheckKey(day, customId)] === true;
}

/** Customs ticked on a day (counts habits that still exist, incl. archived). */
export function customDayCompletion(data: AppData, day: number): number {
  let done = 0;
  for (const h of data.customHabits) {
    if (isCustomChecked(data, day, h.id)) done += 1;
  }
  return done;
}

export function customHabitCompletion(data: AppData, customId: string): number {
  let done = 0;
  for (let d = 1; d <= TOTAL_DAYS; d += 1) {
    if (isCustomChecked(data, d, customId)) done += 1;
  }
  return done;
}

/** Forgiving per-custom streak, same rule as the core per-habit streaks. */
export function customCurrentStreak(data: AppData, customId: string, uptoDay: number): number {
  let day = Math.min(uptoDay, TOTAL_DAYS);
  if (day >= 1 && !isCustomChecked(data, day, customId)) day -= 1;
  let streak = 0;
  while (day >= 1 && isCustomChecked(data, day, customId)) {
    streak += 1;
    day -= 1;
  }
  return streak;
}

export function submissionFor(data: AppData, day: number): DaySubmission | null {
  return data.submissions[String(day)] ?? null;
}

export function isSubmitted(data: AppData, day: number): boolean {
  return submissionFor(data, day) !== null;
}
