# 21 Habits — 21-Day Challenge Tracker

A small, installable web app (PWA) for a 21-day challenge built around **10 daily
habits** taken from an Arabic poster ("10 things for 21 days"). Tick the habits
each day, watch the grids fill up, and finish all 21 days.

Built with **React + Vite + TypeScript + Mantine**. Style: "Clean Social" —
neutral surfaces, one calm-green accent, rounded cards, pill buttons.

## What's new in v3.1 — "Cinematic Layers" (design only)
- **v3.1.2 (a11y polish, "axe-zero"):** the panel now comes back completely clean under axe-core's full ruleset (WCAG 2.0/2.1 A+AA + best-practice) on Today (EN/AR), Progress and Settings, in light and dark. Proper landmarks (`<header>` / one `<main>` / `<footer>`); every progress bar has an accessible name; white-on-leaf contrast fixed (3.44:1 -> ~6.4:1 via the leaf.8 shade on filled badges/buttons); and the decorative tick box is no longer a hidden `<input>` at all -- it is a pure-visual span that reproduces the old checkbox rendering pixel-for-pixel, so habit rows contain no nested interactive elements.
- **v3.1.1 (a11y hotfix):** the decorative tick-box inside each habit row is now hidden from assistive tech (aria-hidden wrapper) — it was rendering as an unlabelled checkbox input and tripping axe-core's critical "label" rule; the row button remains the single real control. Verified with axe-core: zero `label` and zero critical violations on Today (EN/AR), Progress and Settings.


No behaviour or data changes — v3.1 is a pure visual stage over v3:

- **New logo & wordmark** — an original sunrise-over-a-leaf mark (the leaf's
  vein is a check) in the header, on the summary card, in empty states, and
  regenerated as the PWA icon family (192 / 512 / maskable 512).
- **Original artwork for the 10 core habits** — a layered, gradient SVG
  family (mosque at dawn, rising sun, open Qur'an, crescent, Duha sun,
  heart, circling power-bolt, medallion, prayer beads, star-flame), one per
  habit in its established colour. Custom habits keep the icon/colour
  picker, now wearing matching gradient chips.
- **Layered sunrise fields** behind the app (slow ambient drift, frozen
  under reduced motion), **glass cards and rows** with warm layered
  shadows, a **glowing sunrise-gradient progress ring** that pulses once
  when progress changes, **layered milestone celebrations** (light rays,
  flash, two confetti depths), **per-habit gradient heatmap tiles** and
  hover/press micro-depth.
- Accessibility re-gated on the new surfaces: tile numerals and text keep
  ≥ 4.5:1 on their actual rendered backgrounds (measured), secondary text
  was deepened where glass/gradients needed it, and the focus ring is
  scheme-tuned.

## What's new in v3

- **My habits (custom habits)** — add your own habits beside the core 10,
  each with its own icon, colour, mini 3×7 heatmap and forgiving streak.
  Habits are **archived, never hard-deleted**, so history is never lost.
  Customs live in a separate collection with permanent IDs and **never
  count** toward the 210 total, milestones, or the challenge score/streak
  — the core 10 define the challenge, as always.
- **Daily submit** — a "Submit today's results" button closes the day with
  a shareable summary card (core score x/10, customs listed separately,
  streak, day note; Share / Copy buttons). Submitting **soft-locks** the
  day; "Re-open day" undoes it any time with no penalty.
- **Real phone reminders (Web Push)** — optional, free-tier: Vercel
  serverless functions (`api/`) + Upstash Redis + an hourly QStash
  schedule send one generic reminder at the chosen time (21:00 default) if
  the day isn't submitted. Only an anonymous push subscription ever
  leaves the device — **habit data never does**. Without the backend
  configured, the app falls back to the in-app banner. Setup:
  [`PUSH-SETUP.md`](PUSH-SETUP.md); env var names: [`.env.example`](.env.example).
- **Warmth pass** — warmer green/paper tones, 20px cards, a challenge
  progress ring in the header, a greeting that reacts to the day's
  progress, livelier celebration, friendlier empty states.
- **Data compatibility** — v1/v2 data and backups keep working: the
  storage key is unchanged, loading a v1/v2 document migrates it in place
  (customs/submissions default empty), the raw pre-upgrade document is
  automatically backed up under a separate localStorage key, and v3's
  importer accepts v1/v2/v3 exports alike. v3 exports also still load in
  v2 (custom habits are simply ignored there).

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
- **Reminder** — set a daily time in Settings; while the app is open, if
  that time passes and today is incomplete, a gentle banner appears. v3 can
  also send a real phone pop-up at that time (optional, see PUSH-SETUP.md).
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

## Known limits

- **Push is opt-in and best-effort** — real phone reminders (v3) need the
  free backend in PUSH-SETUP.md to be connected once; without it, reminders
  are the in-app banner only. Even connected, delivery is the push
  service's best effort (Focus / Do-Not-Disturb can delay it), and on
  iPhone it works only from the home-screen-installed app (iOS 16.4+).
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
