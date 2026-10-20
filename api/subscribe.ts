import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  isValidReminderTime,
  isValidTimezone,
  redis,
  redisConfig,
  subKey,
  subscriptionId,
  type StoredSubscription,
} from './_lib';

/**
 * POST /api/subscribe — register (or refresh) this device's push
 * subscription. Body: { subscription: { endpoint, keys: { p256dh, auth } },
 * language, timezone, reminderTime }. Stores ONLY that record in Upstash
 * Redis — never any habit data. Returns 503 when the backend env vars are
 * not configured yet, so the client can fall back gracefully.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method-not-allowed' });
    return;
  }
  const cfg = redisConfig();
  if (!cfg) {
    res.status(503).json({ ok: false, error: 'push-not-configured' });
    return;
  }
  try {
    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as {
      subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
      language?: unknown;
      timezone?: unknown;
      reminderTime?: unknown;
    };
    const endpoint = body?.subscription?.endpoint;
    const p256dh = body?.subscription?.keys?.p256dh;
    const auth = body?.subscription?.keys?.auth;
    if (
      typeof endpoint !== 'string' ||
      !endpoint.startsWith('https://') ||
      endpoint.length > 1024 ||
      typeof p256dh !== 'string' ||
      typeof auth !== 'string'
    ) {
      res.status(400).json({ ok: false, error: 'invalid-subscription' });
      return;
    }
    const record: StoredSubscription = {
      endpoint,
      keys: { p256dh, auth },
      language: body.language === 'ar' ? 'ar' : 'en',
      timezone: isValidTimezone(body.timezone) ? body.timezone : 'Africa/Cairo',
      reminderTime: isValidReminderTime(body.reminderTime) ? body.reminderTime : '21:00',
    };
    await redis(cfg, ['SET', subKey(subscriptionId(endpoint)), JSON.stringify(record)]);
    res.status(200).json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: 'subscribe-failed' });
  }
}
