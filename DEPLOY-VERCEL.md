# Put the Habits App (v3) online free with Vercel (Egypt-friendly)

Same hosting switch as the Converter App: Netlify is unreliable from Egypt
(its sites are blocked at ISP level for many Egyptian users and only open
through a VPN), so we host on **Vercel** instead. Vercel's free "Hobby" plan
is enough — this is a personal, non-commercial app.

This v3 project now contains a `vercel.json` with the right build settings
and service-worker headers (the same setup the Converter App got), so Vercel
should need almost no configuration.

You end up with a link like `https://habits-app-xxxx.vercel.app` — that is
the link you open on phones/desktops to install the app, and the link you
can send to family and friends. Each person's ticks stay on their own
device; the link only delivers the app itself.

## Before you move: protect your existing ticks (important, 1 minute)

Your ticks live in the browser storage **of the exact address the app was
opened from**. A new Vercel address is a new home — the app there starts
fresh, it cannot see ticks stored under a different address (for example
the `localhost` address from `npm run dev`, or an older link).

So, if you have already ticked days in v1 or v2 on your PC:

1. Open that existing copy of the app.
2. Go to **Settings → Backup → Export** and save the JSON file.
3. After the Vercel version is live (below), open it, go to
   **Settings → Backup → Import**, and pick that JSON file. It asks you to
   confirm before replacing anything, and your ticks come back exactly.
   (v1 and v2 use the identical backup format and storage key, so this
   works across versions.)

If you haven't ticked anything in the app yet — your 21-day run is in the
chat tracker — just go straight to the deploy steps.

## Route A — GitHub import (recommended, ~5 minutes)

1. **Put the project on GitHub.**
   Unzip `habits-app-v2-project.zip`. Create a new repository on github.com
   (public or private — both work) named e.g. `habits-app`, and push the
   unzipped project folder to it (or use GitHub Desktop's
   "Publish repository").
2. **Import it into Vercel.**
   Go to https://vercel.com, sign in with GitHub, click **Add New → Project**,
   and import the `habits-app` repository.
3. **Check the settings** (they should auto-fill — the `vercel.json` in the
   project sets them):
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Click **Deploy**. In about a minute you get your live
   `*.vercel.app` link.
5. **Updates are automatic:** whenever the project changes, push to GitHub
   and Vercel redeploys the same link. When Jinx ships a new version, you
   just replace the project files and push — your ticks are on your device,
   not in the project, so they are not touched by a redeploy at the same
   address.

## Route B — Vercel CLI from your PC (no GitHub needed)

1. Install Node.js from https://nodejs.org (LTS) — you already have this
   if you ran the app locally.
2. Unzip `habits-app-v2-project.zip`, open a terminal in that folder.
3. Run: `npx vercel --prod`
4. Log in (it opens the browser once), accept the defaults (it reads
   `vercel.json`), and it prints your live link.

## Install it as an app (after you have the link)

- **Android (Chrome):** open the link → ⋮ menu → **Install app** /
  "Add to Home screen" → Install. You get an icon that opens full-screen,
  like a native app.
- **iPhone (Safari):** open the link → **Share** → **Add to Home Screen**.
- **Windows (Edge/Chrome):** open the link → install icon in the address
  bar (or ⋯ → Apps → Install this site as an app).

After the first visit the app is cached on the device and works fully
offline — no internet needed to tick your habits. Nothing is uploaded:
your ticks never leave the device they were ticked on.

## Optional: switch on real phone reminders (v3)

The `api/` functions deploy automatically with the project. To activate
phone push (free tiers only: Upstash Redis + QStash), follow
[`PUSH-SETUP.md`](PUSH-SETUP.md) — create the free database, add the env
vars in Vercel, create the hourly QStash schedule, redeploy. Until then
the app simply uses its in-app reminder banner; nothing breaks.
