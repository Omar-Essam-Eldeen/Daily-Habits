# Phone reminders (Web Push) — free setup guide

The app works fully without this setup: reminders stay as the gentle
in-app banner. This guide switches on REAL phone pop-ups (the app can be
closed) using only free tiers. Total time: ~10 minutes. Everything below
is free — do not add a payment method anywhere.

> ⚠️ **Upstash warning:** never add a payment method / credit card to
> Upstash. A free account with no payment method stays free; adding one
> can convert resources to pay-as-you-go.

## What you already have

Your VAPID keypair was generated during the v3 build. The PUBLIC key is
built into the app. The PRIVATE key is in a separate private file that was
delivered with the app (**VAPID-KEYS-PRIVATE.txt** — keep it private,
never commit it to GitHub, never share the zip publicly with it inside).

## Step 1 — Create the free database (Upstash Redis)

1. Go to https://console.upstash.com and sign up (free).
2. Create a Redis database: any name (e.g. `habits-reminders`), region
   close to you (e.g. Frankfurt `eu-central-1`), **Free** plan.
3. On the database page, find **REST API** and copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. This database stores ONLY push subscriptions (a device endpoint, its
   encryption keys, language, timezone, reminder time) and one anonymous
   "submitted today" flag per device. **No habit data is ever stored.**

## Step 2 — Add environment variables in Vercel

Vercel → your habits project → **Settings → Environment Variables** → add
(Production):

| Name | Value |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | from Step 1 |
| `UPSTASH_REDIS_REST_TOKEN` | from Step 1 |
| `VAPID_PUBLIC_KEY` | from VAPID-KEYS-PRIVATE.txt |
| `VAPID_PRIVATE_KEY` | from VAPID-KEYS-PRIVATE.txt (secret!) |
| `VAPID_SUBJECT` | `mailto:` + an email you control |
| `CRON_SECRET` | invent a long random string (e.g. 30+ characters) |

## Step 3 — Create the hourly schedule (Upstash QStash)

QStash is what calls the sender every hour — it is needed because
Vercel's free (Hobby) cron can only run once a day and with up to ~59
minutes of drift, which is useless for a 21:00 reminder.

1. In the Upstash console open **QStash** → **Schedules** → Create.
2. Destination URL:
   `https://YOUR-APP.vercel.app/api/send-reminders?key=YOUR_CRON_SECRET`
   (replace with your real app URL and the secret from Step 2).
3. Schedule (cron): `0 * * * *` (top of every hour).
4. Also copy the two signing keys from the QStash page
   (`QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`) and add them
   as Vercel env vars too — belt and braces.

The schedule is free within QStash's free quota (an hourly call is far
below it).

## Step 4 — Redeploy

Vercel → Deployments → ⋮ → **Redeploy** (env vars only apply to new
deployments).

## Step 5 — Turn it on in the app

On each phone: open the **installed** app (home-screen icon) →
**Settings → Phone reminders** → pick 21:00 → **Enable phone reminders**
→ allow notifications when the browser asks.

- Android/Chrome: works from the installed PWA or the browser tab.
- iPhone: **must** be the home-screen installed app, iOS 16.4 or newer —
  Apple does not allow web push in Safari tabs.
- If a phone once tapped "Block", the app cannot re-ask — allow
  notifications again from the browser/phone settings for the site.

## How it behaves

- QStash calls the sender hourly. At/after a phone's local reminder time
  (21:00 default), if that phone has **not** submitted its day, it gets
  ONE generic bilingual-appropriate reminder. Submitting the day (the big
  button) tells the server "done" anonymously, so no ping arrives.
- At most one reminder per device per day (idempotent), never before the
  chosen time, never after a 2-hour window.
- Subscriptions that the push service reports as gone (404/410) are
  deleted automatically.
- Delivery is best-effort: a phone in Focus/Do-Not-Disturb can delay or
  silence it (that's the OS, not the app).

## Test it

After redeploying, open this in your browser (signed-in secret required):
`https://YOUR-APP.vercel.app/api/send-reminders?key=YOUR_CRON_SECRET`
outside the reminder window it returns `{"ok":true,...}` with everything
skipped. To see a real ping, temporarily set your reminder time in the
app to the current hour, wait for the top of the hour (or call the URL
above), and don't submit the day first.

## If something is off

- App says "not activated on the server yet" → env vars missing or the
  project wasn't redeployed after adding them.
- Endpoint returns `push-not-configured` → same as above.
- Endpoint returns `unauthorized` → the `key` in the QStash URL doesn't
  match `CRON_SECRET`, and QStash signing keys aren't set.
- No pings but everything returns ok → check the phone's notification
  permission for the app, and that the app was installed (iPhone).
