/**
 * v3.1 identity — the "21 Habits" logo mark (original artwork).
 *
 * A sunrise over a leaf, the leaf's vein drawn as a check mark: dawn (the
 * poster's morning habits), growth (the leaf), done (the check). Warm
 * golden-leaf palette, drawn as layered SVG gradients so it stays crisp
 * from the 46px header lockup down to the summary card. The PWA icons in
 * public/icons are generated from this same design (scripts/generate-icons.mjs).
 * Decorative wherever the app name already appears as text (aria-hidden).
 */
export function LogoMark({ size = 46 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="lg-badge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#57b43c" />
          <stop offset="0.55" stopColor="#2f9e44" />
          <stop offset="1" stopColor="#1e6c30" />
        </linearGradient>
        <radialGradient id="lg-sun-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd54f" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffd54f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lg-leaf" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#ddf2d5" />
          <stop offset="1" stopColor="#fff8e1" />
        </linearGradient>
      </defs>

      {/* badge */}
      <rect x="2" y="2" width="60" height="60" rx="15" fill="url(#lg-badge)" />
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="15"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.4"
      />

      {/* rising sun + halo */}
      <circle cx="45" cy="20" r="14" fill="url(#lg-sun-glow)" />
      <circle cx="45" cy="20" r="8" fill="#ffd54f" />
      <circle cx="45" cy="20" r="8" fill="none" stroke="#ffb300" strokeWidth="1.4" />

      {/* leaf */}
      <path
        d="M13.5 43.5 C13.5 29.5 25.5 19.5 44 17.5 C46.2 33.5 38 48 23.5 50 C17.5 50.8 13.5 48.5 13.5 43.5 Z"
        fill="url(#lg-leaf)"
      />

      {/* the vein, drawn as a check */}
      <path
        d="M20.5 40.5 L28 46.5 L41.5 26"
        fill="none"
        stroke="#1e6c30"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
