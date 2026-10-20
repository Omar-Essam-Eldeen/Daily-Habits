/**
 * VAPID public key for Web Push. Public by design — it ships in the client
 * bundle and is safe to share. The matching PRIVATE key is a server-only
 * secret (Vercel env var); see PUSH-SETUP.md. Override at build time with
 * the VITE_VAPID_PUBLIC_KEY env var.
 */
export const VAPID_PUBLIC_KEY: string =
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ??
  'BP3v31ALEDOwo-3COybinAxuDo1OHeBTY8YI23qiAwP8X2VLFvi8yL1-oSxDpkw00NO_iaP8j8KcW1IC5uUg00Q';

/** Default reminder time for phone push (the family's fixed evening ping). */
export const DEFAULT_PUSH_TIME = '21:00';
