import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Receiver } from '@upstash/qstash';
import webpush from 'web-push';
import {
  localDateIn,
  localTimeIn,
  redis,
  redisConfig,
  sentKey,
  subKey,
  submittedKey,
  type StoredSubscription,
} from './_lib';

// Raw body needed to verify QStash signatures.
export const config = { api: { bodyParser: false } };

/**
 * /api/send-reminders — invoked hourly by an Upstash QStash schedule (or
 * manually with the CRON_SECRET). For every stored subscription: if the
 * device's local time has reached its reminder time (within a 2-hour
 * window) AND the device has not submitted today AND we have not already
 * sent today → send ONE generic reminder. The message never contains
 * habit content. Dead subscriptions (404/410 from the push service) are
 * deleted. Delivery is best-effort (OS focus modes can still delay it).
 */

const MESSAGES = {
  en: {
    title: '21 Habits',
    body: "Time to wrap up today — tick your habits and submit your day.",
  },
  ar: {
    title: 'عادات ٢١',
    body: 'حان وقت إنهاء اليوم — علّم عاداتك وسلّم نتائج يومك.',
  },
} as const;

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function isAuthorized(req: VercelRequest, rawBody: string): Promise<boolean> {
  // Route 1: QStash signature (the scheduled production path).
  const signature = req.headers['upstash-signature'];
  const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (typeof signature === 'string' && currentKey && nextKey) {
    try {
      const receiver = new Receiver({ currentSigningKey: currentKey, nextSigningKey: nextKey });
      await receiver.verify({ signature, body: rawBody });
      return true;
    } catch {
      return false;
    }
  }
  // Route 2: shared secret (manual tests / fallback triggers).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const headerSecret = req.headers['x-cron-secret'];
    const auth = req.headers.authorization;
    const queryKey = typeof req.query?.key === 'string' ? req.query.key : undefined;
    if (headerSecret === secret || auth === `Bearer ${secret}` || queryKey === secret) {
      return true;
    }
  }
  return false;
}

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const cfg = redisConfig();
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com';
  if (!cfg || !vapidPublic || !vapidPrivate) {
    res.status(503).json({ ok: false, error: 'push-not-configured' });
    return;
  }

  const rawBody = await readRawBody(req).catch(() => '');
  if (!(await isAuthorized(req, rawBody))) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const summary = { checked: 0, sent: 0, skippedSubmitted: 0, skippedWindow: 0, alreadySent: 0, dead: 0, errors: 0 };

  try {
    // Walk every subscription record (family scale — SCAN pages are tiny).
    let cursor = '0';
    const keys: string[] = [];
    do {
      const page = (await redis(cfg, ['SCAN', cursor, 'MATCH', 'sub:*', 'COUNT', 100])) as [
        string,
        string[],
      ];
      cursor = page[0];
      keys.push(...page[1]);
    } while (cursor !== '0');

    for (const key of keys) {
      const id = key.slice('sub:'.length);
      const raw = await redis(cfg, ['GET', key]);
      if (typeof raw !== 'string') continue;
      let sub: StoredSubscription;
      try {
        sub = JSON.parse(raw) as StoredSubscription;
      } catch {
        continue;
      }
      summary.checked += 1;

      const localDate = localDateIn(sub.timezone);
      const localNow = minutesOf(localTimeIn(sub.timezone));
      const reminderAt = minutesOf(sub.reminderTime);
      // Send only inside [reminderTime, reminderTime + 2h) local.
      if (localNow < reminderAt || localNow >= reminderAt + 120) {
        summary.skippedWindow += 1;
        continue;
      }
      const submitted = await redis(cfg, ['GET', submittedKey(id, localDate)]);
      if (submitted) {
        summary.skippedSubmitted += 1;
        continue;
      }
      // Idempotency: exactly one send per device per local day, even if
      // the schedule fires more often than hourly.
      const claimed = await redis(cfg, ['SET', sentKey(id, localDate), '1', 'NX', 'EX', 90000]);
      if (claimed !== 'OK') {
        summary.alreadySent += 1;
        continue;
      }

      const msg = sub.language === 'ar' ? MESSAGES.ar : MESSAGES.en;
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify({ title: msg.title, body: msg.body, lang: sub.language, url: '/' }),
        );
        summary.sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          // Subscription is gone for good — clean it up.
          await redis(cfg, ['DEL', key]).catch(() => undefined);
          await redis(cfg, ['DEL', sentKey(id, localDate)]).catch(() => undefined);
          summary.dead += 1;
        } else {
          // Transient failure: release the claim so a later run can retry.
          await redis(cfg, ['DEL', sentKey(id, localDate)]).catch(() => undefined);
          summary.errors += 1;
        }
      }
    }
    res.status(200).json({ ok: true, ...summary });
  } catch {
    res.status(500).json({ ok: false, error: 'send-failed', ...summary });
  }
}
