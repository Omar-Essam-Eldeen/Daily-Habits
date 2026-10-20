import type { VercelRequest, VercelResponse } from '@vercel/node';
import { redis, redisConfig, subKey, subscriptionId } from './_lib';

/** POST /api/unsubscribe — remove this device's subscription record. */
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
    };
    if (typeof body?.endpoint !== 'string') {
      res.status(400).json({ ok: false, error: 'invalid-endpoint' });
      return;
    }
    await redis(cfg, ['DEL', subKey(subscriptionId(body.endpoint))]);
    res.status(200).json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: 'unsubscribe-failed' });
  }
}
