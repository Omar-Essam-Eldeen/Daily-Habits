# 21 Habits — 21-Day Challenge Tracker

A small, installable web app (PWA) for a 21-day challenge built around **10 daily
habits** taken from an Arabic poster ("10 things for 21 days"). Tick the habits
each day, watch the grids fill up, and finish all 21 days.

Built with **React + Vite + TypeScript + Mantine**. Style: "Clean Social" —
neutral surfaces, one calm-green accent, rounded cards, pill buttons.

## Run it

```bash
npm install      # once
npm run icons    # once — regenerates the PWA icons in public/icons/
npm run dev      # local dev server (http://localhost:5173)
npm run build    # production build into dist/ (TypeScript check + Vite)
npm run preview  # serve the production build locally
```

Then open it on your phone or desktop browser and use **"Add to Home Screen" /
"Install app"** to install it like a normal app (standalone, full-screen).

## Features

- **Today view** — the 10 habits as large tappable check rows for the selected
  day, with a per-day progress ring. The app **opens on today's day**, computed
  from the start date and clamped to 1–21.
- **Day selector (1–21)** — jump to any day to backfill or review it; today's
  day is dotted, fully-completed days get a ✓.
- **Per-habit heatmap** — a 3×7 tile grid (21 tiles) for each habit on the
  Progress tab; tapping a tile toggles that day for that habit. Today's tile
  is ring-highlighted.
- **Progress** — overall % of all 210 checks, plus per-habit completion and a
  **forgiving streak**: the streak counts back from today (an unfinished today
  doesn't break it — it counts from yesterday), and it is always shown next to
  total completion, never as a punitive all-or-nothing score. There is **no
  zero-reset punishment** anywhere in the app.
- **Milestones** — celebration banners for days **7, 14 and 21** (rule below).
- **Day notes** — a free-text note per day, saved automatically.
- **Reminder (in-app only)** — set a daily time in Settings; while the app is
  open, if that time passes and today is incomplete, a gentle banner appears.
- **Backup** — Export downloads a JSON backup; Import validates a backup file
  and asks for confirmation **before** replacing anything.
- **Reset** — clears all ticks and notes (with a confirmation modal); language
  and reminder settings are kept, and the start date returns to the default.
- **Bilingual** — English (primary) and Arabic, switchable in the header.
  Arabic flips the whole layout to RTL properly.
- **Light / Dark / Auto** — three-way appearance toggle in the header, using
  Mantine's colour-scheme system; your choice is remembered.
- **PWA basics** — web app manifest ("21 Habits", standalone), generated
  192/512 icons, theme colour, and a minimal service worker so the app keeps
  working offline after the first visit.

## The 10 habits

In poster order (Arabic original + English):

1. الفروض الخمسة — The five daily prayers (and the sunnahs after prayer)
2. أذكار الصباح — Morning adhkar
3. الورد اليومي — Daily Qur'an portion (even a page, even a verse)
4. قيام الليل — Night prayer (just 2 rak'ahs)
5. صلاة الضحى — Duha prayer (360 acts of charity)
6. الصلاة على النبي — Blessings on the Prophet (100+ times)
7. لا حول ولا قوة إلا بالله — La hawla wa la quwwata illa billah (100+ times)
8. الباقيات الصالحات — Al-Baqiyat al-Salihat
9. ورد الاستغفار — Istighfar (1000 times)
10. سورة الإخلاص — Surah Al-Ikhlas (3 times, with evening adhkar)

## Milestone rule

A milestone day (**7, 14 or 21**) is "earned" when **all 10 habits are ticked
for that day**. Viewing that day then shows its celebration banner (each of
the three has its own message). Completing day 21 fully shows the
"Challenge complete" celebration.

## Data & privacy

- **Everything stays on the device.** All state lives in the browser's
  `localStorage` under the single versioned key **`habits-app:v1`**:
  `{ startDate, checks, notes, settings: { lang, reminderTime } }`.
- No account, no server, no uploads, no analytics, no tracking. The service
  worker only caches the app's own files for offline use.
- Switching browser/device or clearing browser site data loses the ticks —
  use **Export backup** regularly and keep the JSON somewhere safe; Import
  restores it (after confirmation).
- Default start date is **2026-10-18** (Day 21 = 2026-11-07), changeable in
  Settings. Ticks belong to day numbers (1–21), so changing the start date
  re-dates the challenge without losing ticks.

## Known limits (v1)

- **No push notifications** — reminders are in-app banners only, and only
  while the app is open. Real push needs a server/push service; deliberately
  out of scope for a local-only v1.
- Installability is "PWA basics": manifest + icons + a minimal service
  worker. A full offline precache of hashed assets and install prompts can
  be polished in v2.
- Data does not sync between devices (by design); the JSON backup is the
  transfer mechanism.
- Streaks are per-habit and forgiving (see above) — there is intentionally
  no global "perfect day streak" score.

## What's new in v2

- **Per-habit icons & colours** — every habit has its own Tabler icon and a
  subtle colour accent (icon chips + per-habit progress bars); the leaf-green
  accent still drives checks and heatmaps.
- **Motion** — checkbox pop on check-in, tile pop on the heatmaps, animated
  progress numbers/bars/ring, a light CSS confetti burst when a milestone day
  (7/14/21) is completed, and a gentle transition when switching days. All of
  it is disabled under `prefers-reduced-motion`.
- **Heatmap tooltips** — hover/focus a tile to see the full date and whether
  that day is done.
- **Weekly summary** — per-week completion bars plus your best day, on the
  Progress tab.
- **Grouped Settings** — Preferences (language, appearance), Challenge
  (start date), Reminder, Backup, and a Danger zone for reset.
- **Visually verified** — production build screenshotted in a real browser
  (EN light/dark, AR RTL, phone + desktop widths); see `screenshots/`.
- Data is 100% compatible with v1: same `habits-app:v1` localStorage key and
  the same backup JSON format, so v1 backups import cleanly.
