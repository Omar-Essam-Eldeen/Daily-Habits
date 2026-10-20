import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  isValidTimezone,
  localDateIn,
  redis,
  redisConfig,
  subKey,
  submittedKey,
  subscriptionId,
  type StoredSubscription,
} from './_lib';

/**
 * POST /api/mark-submitted — the client pings this when the user submits
 * their day. Sets one anonymous bit ("this device submitted on its local
 * date") with a 48h TTL so send-reminders can skip tonight's ping.
 * Body: { endpoint, timezone? }. No habit content is accepted or stored.
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
      endpoint?: unknown;
      timezone?: unknown;
    };
    if (typeof body?.endpoint !== 'string') {
      res.status(400).json({ ok: false, error: 'invalid-endpoint' });
      return;
    }
    const id = subscriptionId(body.endpoint);
    // Prefer the timezone stored at subscribe time; fall back to the body's.
    let timezone = isValidTimezone(body.timezone) ? body.timezone : 'Africa/Cairo';
    const stored = await redis(cfg, ['GET', subKey(id)]);
    if (typeof stored === 'string') {
      try {
        const parsed = JSON.parse(stored) as StoredSubscription;
        if (isValidTimezone(parsed.timezone)) timezone = parsed.timezone;
      } catch {
        // keep the fallback
      }
    }
    const localDate = localDateIn(timezone);
    await redis(cfg, ['SET', submittedKey(id, localDate), '1', 'EX', 172800]);
    res.status(200).json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: 'mark-failed' });
  }
}
