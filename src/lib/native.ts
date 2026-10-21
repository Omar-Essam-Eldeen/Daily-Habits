/**
 * Native shell bridge (v3.3.0) — talks to the Capacitor runtime that the
 * Android app injects as `window.Capacitor` before any page JS runs. On the
 * web / PWA there is no such global, every helper here is inert, and the app
 * behaves exactly as before. No @capacitor package is imported, so the web
 * bundle and its dependency lock stay untouched — the native project adds
 * the plugins on its side.
 *
 * Why this exists: the old APK was a browser wrapper (TWA) whose full-screen
 * mode depends on the phone's browser completing a verification handshake;
 * when that hiccups, the app degrades to a browser tab with a URL bar. The
 * native shell bundles the app itself — no browser, no handshake, no bar.
 *
 * Reminders in the shell can't use Web Push (a WebView has no PushManager),
 * so they are scheduled ON-DEVICE with the LocalNotifications plugin:
 * one gentle notification at the chosen time on days not yet submitted.
 * Nothing leaves the phone — the server is not involved at all.
 */

interface PermissionStatus {
  display: string;
}

interface LocalNotificationsPlugin {
  checkPermissions: () => Promise<PermissionStatus>;
  requestPermissions: () => Promise<PermissionStatus>;
  schedule: (options: {
    notifications: Array<{
      id: number;
      title: string;
      body: string;
      schedule: { at: Date; allowWhileIdle: boolean };
    }>;
  }) => Promise<unknown>;
  cancel: (options: { notifications: Array<{ id: number }> }) => Promise<unknown>;
}

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  Plugins?: { LocalNotifications?: LocalNotificationsPlugin };
}

function capacitor(): CapacitorGlobal | null {
  if (typeof window === 'undefined') return null;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  return cap ?? null;
}

/** True only inside the native Android shell. */
export function isNativeApp(): boolean {
  try {
    return capacitor()?.isNativePlatform?.() === true;
  } catch {
    return false;
  }
}

function localNotifications(): LocalNotificationsPlugin | null {
  if (!isNativeApp()) return null;
  return capacitor()?.Plugins?.LocalNotifications ?? null;
}

/** Current notification permission, without prompting. */
export async function nativeNotificationPermission(): Promise<string> {
  const ln = localNotifications();
  if (!ln) return 'unsupported';
  try {
    const status = await ln.checkPermissions();
    return status.display;
  } catch {
    return 'unknown';
  }
}

/** Ask for notification permission (call ONLY from an explicit user tap). */
export async function requestNativeNotificationPermission(): Promise<boolean> {
  const ln = localNotifications();
  if (!ln) return false;
  try {
    const status = await ln.requestPermissions();
    return status.display === 'granted';
  } catch {
    return false;
  }
}

/** Fixed notification id — the reminder is a single re-armed one-shot. */
const REMINDER_NOTIFICATION_ID = 210021;

const NATIVE_REMINDERS_KEY = 'habits-app:native-reminders';

/**
 * The native card's on/off lives in its own local flag, mirroring how Web
 * Push keeps its own state (habits-app:push): settings.reminderTime is
 * shared with the in-app banner reminder, so it can't double as this
 * switch — a time being set is not the same as phone reminders being on.
 */
export function nativeRemindersEnabled(): boolean {
  try {
    return window.localStorage.getItem(NATIVE_REMINDERS_KEY) === 'on';
  } catch {
    return false;
  }
}

export function setNativeRemindersEnabled(on: boolean): void {
  try {
    if (on) window.localStorage.setItem(NATIVE_REMINDERS_KEY, 'on');
    else window.localStorage.removeItem(NATIVE_REMINDERS_KEY);
  } catch {
    /* storage unavailable — the sync below simply won't arm */
  }
}

export interface NativeReminderSync {
  /** The native card's own on/off flag. */
  enabled: boolean;
  /** 'HH:MM' — the shared reminder time (or the default when unset). */
  time: string;
  /** Whether today's day has already been submitted. */
  submittedToday: boolean;
  title: string;
  body: string;
}

/**
 * Recompute the on-device reminder from current state. Cancels any pending
 * reminder, then — when reminders are on and permission is granted — arms a
 * single notification: today at the chosen time (when it is still ahead and
 * today is unsubmitted), otherwise tomorrow at the chosen time. The app
 * re-arms on every open/submit/time/language change, so a fired reminder is
 * replaced the next time the app is used; a day already submitted never
 * rings. Safe to call often; never prompts.
 */
export async function syncNativeReminder(sync: NativeReminderSync): Promise<void> {
  const ln = localNotifications();
  if (!ln) return;
  try {
    await ln.cancel({ notifications: [{ id: REMINDER_NOTIFICATION_ID }] });
  } catch {
    /* nothing pending — fine */
  }
  if (!sync.enabled) return;
  try {
    const status = await ln.checkPermissions();
    if (status.display !== 'granted') return;
    const [hours, minutes] = sync.time.split(':').map((part) => Number(part) || 0);
    const now = new Date();
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    if (sync.submittedToday || next.getTime() <= now.getTime()) {
      next.setDate(next.getDate() + 1);
    }
    await ln.schedule({
      notifications: [
        {
          id: REMINDER_NOTIFICATION_ID,
          title: sync.title,
          body: sync.body,
          schedule: { at: next, allowWhileIdle: true },
        },
      ],
    });
  } catch {
    /* scheduling is best-effort — the in-app reminder still applies */
  }
}

/** Remove any pending on-device reminder (used when reminders turn off). */
export async function cancelNativeReminder(): Promise<void> {
  const ln = localNotifications();
  if (!ln) return;
  try {
    await ln.cancel({ notifications: [{ id: REMINDER_NOTIFICATION_ID }] });
  } catch {
    /* already gone */
  }
}
