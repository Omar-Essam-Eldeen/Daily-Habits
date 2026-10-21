import { VAPID_PUBLIC_KEY } from './pushConfig';

/**
 * Web Push client (v3). Privacy contract: the ONLY thing that ever leaves
 * the device is the push subscription itself (endpoint + keys) plus the
 * chosen reminder time, language and timezone — the minimum the push
 * service needs. Habit ticks, notes and submissions NEVER leave the
 * device; the server only receives one anonymous "submitted today" signal
 * per device so it can skip the reminder for people who already finished.
 *
 * Everything here fails soft: if the backend (Vercel functions + Upstash)
 * is not configured yet, the settings UI shows a graceful "not activated"
 * note and the in-app reminder banner keeps working as before.
 */

const PUSH_STATE_KEY = 'habits-app:push';

export interface PushLocalState {
  endpoint: string;
}

export type PushSupport =
  | 'ok'
  | 'no-api' // browser lacks Notification / PushManager / service workers
  | 'denied'; // permission was refused (sticky — fixable only in browser settings)

export function pushSupport(): PushSupport {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    !('PushManager' in window) ||
    !('serviceWorker' in navigator)
  ) {
    return 'no-api';
  }
  if (Notification.permission === 'denied') return 'denied';
  return 'ok';
}

export function loadPushState(): PushLocalState | null {
  try {
    const raw = window.localStorage.getItem(PUSH_STATE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as { endpoint?: unknown }).endpoint === 'string'
    ) {
      return { endpoint: (parsed as { endpoint: string }).endpoint };
    }
    return null;
  } catch {
    return null;
  }
}

function savePushState(state: PushLocalState | null): void {
  try {
    if (state) window.localStorage.setItem(PUSH_STATE_KEY, JSON.stringify(state));
    else window.localStorage.removeItem(PUSH_STATE_KEY);
  } catch {
    // best-effort only
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

async function postJSON(path: string, body: unknown): Promise<Response> {
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export interface EnablePushInput {
  reminderTime: string;
  language: string;
}

export type EnablePushResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'unsupported' | 'denied' | 'dismissed' | 'server' | 'error';
      /** v3.1.4: human-readable diagnostics (step + error name/message),
       *  shown in the settings card so a failure is identifiable instead of
       *  hiding behind one generic banner. */
      detail?: string;
    };

/** The enable flow as named steps — a failure reports WHICH step died. */
type EnableStep =
  | 'support'
  | 'permission'
  | 'sw-ready'
  | 'existing'
  | 'subscribe'
  | 'server-post'
  | 'server-contract';

function describeError(step: EnableStep, err: unknown): string {
  if (err instanceof Error) return `${step}: ${err.name} — ${err.message}`;
  return `${step}: ${String(err)}`;
}

/** Race a promise against a timeout so a stuck step reports itself instead
 *  of spinning forever (serviceWorker.ready can hang on a broken SW). */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        const err = new Error(`${label} timed out after ${ms}ms`);
        err.name = 'TimeoutError';
        reject(err);
      }, ms);
    }),
  ]);
}

/** True when an existing subscription was created with OUR VAPID key. A
 *  subscription made under a different key (stale test state, rotated key)
 *  can never receive our sends — the server would sign with a key the
 *  subscription doesn't expect — so it must be replaced, not reused. */
function subscriptionKeyMatches(sub: PushSubscription): boolean {
  const key = sub.options?.applicationServerKey;
  if (!key) return false;
  const mine = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  const theirs = new Uint8Array(key);
  if (mine.length !== theirs.length) return false;
  return mine.every((b, i) => b === theirs[i]);
}

/**
 * Ask for permission (call ONLY from a user tap — never on first open),
 * subscribe via PushManager, and register the subscription with the server.
 * v3.1.4: every failure path carries a `detail` (step + real error) that
 * the settings card displays — desktop browsers fail this flow in several
 * distinct ways (dismissed prompt, stale keyed subscription, push-service
 * AbortError) and a silent catch-all made them indistinguishable.
 */
export async function enablePush(input: EnablePushInput): Promise<EnablePushResult> {
  let step: EnableStep = 'support';
  try {
    if (pushSupport() === 'no-api') {
      return {
        ok: false,
        reason: 'unsupported',
        detail: 'support: PushManager / Notification / serviceWorker missing in this browser',
      };
    }

    step = 'permission';
    const permission = await Notification.requestPermission();
    if (permission === 'denied') {
      return {
        ok: false,
        reason: 'denied',
        detail: 'permission: the browser reports notifications denied for this site',
      };
    }
    if (permission !== 'granted') {
      // 'default' — the prompt was closed without choosing. NOT a denial;
      // the user can simply tap Enable again.
      return {
        ok: false,
        reason: 'dismissed',
        detail: `permission: prompt closed without a choice (state: ${permission})`,
      };
    }

    step = 'sw-ready';
    const registration = await withTimeout(
      navigator.serviceWorker.ready,
      10000,
      'serviceWorker.ready',
    );
    if (!registration.active) {
      const err = new Error('service worker registration has no active worker yet');
      err.name = 'InvalidStateError';
      throw err;
    }

    step = 'existing';
    let existing = await registration.pushManager.getSubscription();
    if (existing && !subscriptionKeyMatches(existing)) {
      // Stale subscription under a different key — drop it and subscribe
      // fresh below, instead of registering an undeliverable endpoint.
      await existing.unsubscribe().catch(() => undefined);
      existing = null;
    }

    step = 'subscribe';
    let subscription = existing;
    if (!subscription) {
      const subscribeOnce = () =>
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
      try {
        subscription = await subscribeOnce();
      } catch (firstErr) {
        // Desktop browsers (Edge especially) intermittently fail the first
        // subscribe with a transient AbortError ("push service error" /
        // "no active Service Worker"). One retry after re-awaiting the
        // registration clears most of them.
        console.warn('[push] first subscribe attempt failed, retrying once', firstErr);
        await withTimeout(navigator.serviceWorker.ready, 10000, 'serviceWorker.ready');
        subscription = await subscribeOnce();
      }
    }

    step = 'server-post';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo';
    const res = await postJSON('/api/subscribe', {
      subscription: subscription.toJSON(),
      language: input.language,
      timezone,
      reminderTime: input.reminderTime,
    });
    // Require the endpoint's real JSON contract — a static host's SPA
    // fallback can answer 200 HTML for /api/*, which must NOT count as
    // "reminders activated".
    step = 'server-contract';
    let contractOk = res.ok;
    let contractNote = '';
    if (contractOk) {
      try {
        const json: unknown = await res.json();
        contractOk =
          typeof json === 'object' && json !== null && (json as { ok?: unknown }).ok === true;
        if (!contractOk) contractNote = ' (JSON without ok:true)';
      } catch {
        contractOk = false;
        contractNote = ' (response was not JSON)';
      }
    }
    if (!contractOk) {
      // Stay locally subscribed? No — without the server record nothing can
      // be sent, so roll back to keep the UI honest.
      await subscription.unsubscribe().catch(() => undefined);
      return {
        ok: false,
        reason: 'server',
        detail: `server-contract: HTTP ${res.status}${contractNote}`,
      };
    }
    savePushState({ endpoint: subscription.endpoint });
    return { ok: true };
  } catch (err) {
    console.error('[push] enable failed:', describeError(step, err), err);
    return { ok: false, reason: 'error', detail: describeError(step, err) };
  }
}

export async function disablePush(): Promise<void> {
  try {
    const state = loadPushState();
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    const endpoint = subscription?.endpoint ?? state?.endpoint;
    if (subscription) await subscription.unsubscribe().catch(() => undefined);
    if (endpoint) {
      await postJSON('/api/unsubscribe', { endpoint }).catch(() => undefined);
    }
  } catch {
    // best-effort
  } finally {
    savePushState(null);
  }
}

/** True when this device has an active push subscription registered locally. */
export async function isPushEnabled(): Promise<boolean> {
  try {
    if (pushSupport() === 'no-api') return false;
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    return subscription !== null && loadPushState() !== null;
  } catch {
    return false;
  }
}

/**
 * Fire-and-forget: tell the server this device submitted today so tonight's
 * reminder skips it. Sends only the subscription endpoint + timezone —
 * an anonymous signal, no habit data. Silently ignored when push is off or
 * the backend is not configured.
 */
export function markSubmittedToday(): void {
  try {
    const state = loadPushState();
    if (!state) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo';
    void postJSON('/api/mark-submitted', { endpoint: state.endpoint, timezone }).catch(
      () => undefined,
    );
  } catch {
    // never block the UI on this
  }
}

/** Re-register after a reminder-time / language change (endpoint is the key). */
export async function refreshPushRegistration(input: EnablePushInput): Promise<void> {
  try {
    const state = loadPushState();
    if (!state) return;
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo';
    await postJSON('/api/subscribe', {
      subscription: subscription.toJSON(),
      language: input.language,
      timezone,
      reminderTime: input.reminderTime,
    }).catch(() => undefined);
  } catch {
    // best-effort
  }
}
