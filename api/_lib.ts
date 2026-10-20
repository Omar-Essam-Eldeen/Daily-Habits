import { createHash } from 'node:crypto';

/**
 * Shared helpers for the v3 push endpoints. Underscore prefix = not an
 * endpoint (Vercel convention).
 *
 * PRIVACY: the only thing stored per device is its push subscription
 * (endpoint + encryption keys) plus language, timezone and reminder time —
 * the minimum needed to deliver a generic nightly reminder. No habit
 * data, no names, no accounts. A device is keyed by the SHA-256 of its
 * subscription endpoint, so raw endpoints are never used as record keys.
 */

export interface RedisConfig {
  url: string;
  token: string;
}

export function redisConfig(): RedisConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

/** Run one Redis command through the Upstash REST API. */
export async function redis(cfg: RedisConfig, command: (string | number)[]): Promise<unknown> {
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`redis http ${res.status}`);
  const json = (await res.json()) as { result?: unknown; error?: string };
  if (json.error) throw new Error(`redis: ${json.error}`);
  return json.result;
}

export function subscriptionId(endpoint: string): string {
  return createHash('sha256').update(endpoint).digest('hex');
}

export const subKey = (id: string): string => `sub:${id}`;
export const submittedKey = (id: string, localDate: string): string =>
  `submitted:${id}:${localDate}`;
export const sentKey = (id: string, localDate: string): string => `sent:${id}:${localDate}`;

export interface StoredSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  language: string;
  timezone: string;
  reminderTime: string;
}

/** 'yyyy-mm-dd' for "today" in an IANA timezone. */
export function localDateIn(tz: string, at: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(at);
  } catch {
    return at.toISOString().slice(0, 10);
  }
}

/** 'HH:MM' (24h, zero-padded) for "now" in an IANA timezone. */
export function localTimeIn(tz: string, at: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(at);
  } catch {
    return at.toISOString().slice(11, 16);
  }
}

export function isValidReminderTime(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isValidTimezone(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
