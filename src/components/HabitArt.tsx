import type { ReactNode } from 'react';

/**
 * v3.1 — original artwork family for the 10 core habits (replaces the flat
 * stock-style line icons). One consistent visual language: a soft tinted
 * disc in the habit's established colour identity, a bold layered motif,
 * and a warm gold accent tying every piece back to the sunrise brand.
 * Drawn bold so it still reads at 38–42px (habit rows, heatmap cards).
 * Purely decorative — the habit's name text always sits beside it and
 * labels the row, so the art is aria-hidden.
 */

interface Palette {
  soft: string;
  mid: string;
  deep: string;
}

const PALETTES: Record<string, Palette> = {
  prayers: { soft: '#ddf2d5', mid: '#2f9e44', deep: '#175426' },
  'morning-adhkar': { soft: '#ffe8cc', mid: '#fd7e14', deep: '#d9480f' },
  'quran-portion': { soft: '#dbe4ff', mid: '#4c6ef5', deep: '#364fc7' },
  'night-prayer': { soft: '#e5dbff', mid: '#7950f2', deep: '#5f3dc4' },
  duha: { soft: '#fff3bf', mid: '#fab005', deep: '#e67700' },
  salawat: { soft: '#ffdeeb', mid: '#e64980', deep: '#a61e4d' },
  hawla: { soft: '#c3fae8', mid: '#12b886', deep: '#087f5b' },
  baqiyat: { soft: '#f3d9fa', mid: '#be4bdb', deep: '#862e9c' },
  istighfar: { soft: '#c5f6fa', mid: '#15aabf', deep: '#0b7285' },
  ikhlas: { soft: '#d0ebff', mid: '#228be6', deep: '#1864ab' },
};

const GOLD = '#ffb300';
const GOLD_LIGHT = '#ffd54f';

function sparkle(cx: number, cy: number, r: number, fill: string) {
  return (
    <path
      d={`M${cx} ${cy - r} C${cx + r * 0.18} ${cy - r * 0.18} ${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy} C${cx + r * 0.18} ${cy + r * 0.18} ${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r} C${cx - r * 0.18} ${cy + r * 0.18} ${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy} C${cx - r * 0.18} ${cy - r * 0.18} ${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r} Z`}
      fill={fill}
    />
  );
}

const ART: Record<string, (p: Palette) => ReactNode> = {
  /* Five prayers — mosque dome, minarets, rising sun dot. */
  prayers: (p) => (
    <>
      <circle cx="24" cy="13.5" r="4.6" fill={GOLD} />
      <path d="M24 15.5 C27.5 19 31 20.8 31 25 L17 25 C17 20.8 20.5 19 24 15.5 Z" fill={p.mid} />
      <rect x="12.5" y="25" width="23" height="3.4" rx="1.2" fill={p.deep} />
      <rect x="15.5" y="28.4" width="17" height="9.6" fill={p.mid} />
      <path d="M21.4 38 v-4.6 a2.6 2.6 0 0 1 5.2 0 V38 Z" fill={p.soft} />
      <rect x="8.6" y="19" width="3" height="19" fill={p.deep} />
      <path d="M7.4 19 a2.7 2.7 0 0 1 5.4 0 Z" fill={p.mid} />
      <rect x="36.4" y="19" width="3" height="19" fill={p.deep} />
      <path d="M35.2 19 a2.7 2.7 0 0 1 5.4 0 Z" fill={p.mid} />
      <rect x="6.5" y="38" width="35" height="2.4" rx="1.2" fill={p.deep} opacity="0.75" />
    </>
  ),

  /* Morning adhkar — sun rising over horizon lines, birds. */
  'morning-adhkar': (p) => (
    <>
      <g stroke={p.deep} strokeWidth="2.1" strokeLinecap="round">
        <line x1="24" y1="13.5" x2="24" y2="17" />
        <line x1="14.8" y1="17.8" x2="17" y2="20.4" />
        <line x1="33.2" y1="17.8" x2="31" y2="20.4" />
      </g>
      <path d="M15.5 29 a8.5 8.5 0 0 1 17 0 Z" fill={GOLD_LIGHT} />
      <path d="M15.5 29 a8.5 8.5 0 0 1 17 0 Z" fill="none" stroke={GOLD} strokeWidth="1.4" />
      <line x1="9" y1="33.5" x2="39" y2="33.5" stroke={p.mid} strokeWidth="2.8" strokeLinecap="round" />
      <line x1="13.5" y1="38.5" x2="34.5" y2="38.5" stroke={p.deep} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M11.5 13.5 l2.6 -2.4 2.6 2.4" fill="none" stroke={p.deep} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30.5 10.8 l2.3 -2.1 2.3 2.1" fill="none" stroke={p.deep} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  /* Daily Qur'an portion — open book, gold bookmark, sparkle. */
  'quran-portion': (p) => (
    <>
      <path
        d="M24 14.5 C20.2 12 15.8 11.4 12 13 V33.5 C15.8 32 20.2 32.6 24 35.2 C27.8 32.6 32.2 32 36 33.5 V13 C32.2 11.4 27.8 12 24 14.5 Z"
        fill={p.mid}
      />
      <path
        d="M24 17 C20.8 14.9 17.2 14.4 14.2 15.4 V31 C17.2 30 20.8 30.5 24 32.6 C27.2 30.5 30.8 30 33.8 31 V15.4 C30.8 14.4 27.2 14.9 24 17 Z"
        fill={p.soft}
      />
      <g stroke={p.deep} strokeWidth="1.7" strokeLinecap="round" opacity="0.65">
        <line x1="16.8" y1="20" x2="21.4" y2="20.9" />
        <line x1="16.8" y1="24" x2="21.4" y2="24.9" />
        <line x1="16.8" y1="28" x2="21.4" y2="28.9" />
        <line x1="26.6" y1="20.9" x2="31.2" y2="20" />
        <line x1="26.6" y1="24.9" x2="31.2" y2="24" />
        <line x1="26.6" y1="28.9" x2="31.2" y2="28" />
      </g>
      <polygon points="22.6,34.6 27.4,34.6 27.4,42 25,39.6 22.6,42" fill={GOLD} />
      {sparkle(38.6, 9.6, 3.4, GOLD)}
    </>
  ),

  /* Night prayer — gold crescent, stars, dome silhouette. */
  'night-prayer': (p) => (
    <>
      <path d="M30.5 7.5 a14.5 14.5 0 1 0 10 21.6 a11.6 11.6 0 1 1 -10 -21.6 Z" fill={GOLD_LIGHT} />
      {sparkle(36.5, 11, 3.2, p.mid)}
      {sparkle(41, 20.5, 2.3, GOLD)}
      {sparkle(31.5, 17.5, 1.9, p.mid)}
      <path d="M13.5 41 C13.5 35.5 18.5 34.2 24 31 C29.5 34.2 34.5 35.5 34.5 41 Z" fill={p.deep} />
      <rect x="11" y="41" width="26" height="2.3" rx="1.1" fill={p.deep} />
    </>
  ),

  /* Duha — full morning sun with a green sprout. */
  duha: (p) => (
    <>
      <g stroke={p.deep} strokeWidth="2.3" strokeLinecap="round">
        <line x1="24" y1="5.5" x2="24" y2="9.5" />
        <line x1="11.6" y1="10.6" x2="14.4" y2="13.4" />
        <line x1="36.4" y1="10.6" x2="33.6" y2="13.4" />
        <line x1="7.5" y1="22" x2="11.5" y2="22" />
        <line x1="40.5" y1="22" x2="36.5" y2="22" />
      </g>
      <circle cx="24" cy="22" r="10" fill={GOLD} />
      <circle cx="24" cy="22" r="6.8" fill={GOLD_LIGHT} />
      <path d="M24 41 v-6.5" stroke="#2f9e44" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 36.5 C21.5 36.8 19.8 35.4 19.4 33 C21.9 32.8 23.6 34.1 24 36.5 Z" fill="#2f9e44" />
      <path d="M24 35 C26.5 35.3 28.2 33.9 28.6 31.5 C26.1 31.3 24.4 32.6 24 35 Z" fill="#57b43c" />
      <line x1="13.5" y1="41.5" x2="34.5" y2="41.5" stroke={p.deep} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),

  /* Blessings on the Prophet — layered heart, sparkles. */
  salawat: (p) => (
    <>
      <path
        d="M24 39.5 C12.8 30.3 10.2 22.8 14.3 17.2 C17.4 13.3 22.9 14.2 24 18.8 C25.1 14.2 30.6 13.3 33.7 17.2 C37.8 22.8 35.2 30.3 24 39.5 Z"
        fill={p.mid}
      />
      <path
        d="M21.8 33.4 C15.6 28.2 14.2 23.8 16.5 20.4 C18.2 17.9 21.6 18.4 22.4 21.2"
        fill="none"
        stroke={p.soft}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
      />
      {sparkle(10.8, 10.8, 3.1, GOLD)}
      {sparkle(37.6, 9.8, 2.5, GOLD)}
      <circle cx="35.5" cy="35" r="1.7" fill={p.deep} opacity="0.55" />
      <circle cx="13" cy="34" r="1.4" fill={p.deep} opacity="0.55" />
    </>
  ),

  /* La hawla wa la quwwata illa billah — power: circling arrows + bolt. */
  hawla: (p) => (
    <>
      <path d="M24 8.5 a15.5 15.5 0 0 1 13.4 8" fill="none" stroke={p.deep} strokeWidth="2.9" strokeLinecap="round" />
      <polygon points="40.6,12.4 39.8,19.4 33.6,15.6" fill={p.deep} />
      <path d="M24 39.5 a15.5 15.5 0 0 1 -13.4 -8" fill="none" stroke={p.deep} strokeWidth="2.9" strokeLinecap="round" />
      <polygon points="7.4,35.6 8.2,28.6 14.4,32.4" fill={p.deep} />
      <polygon points="26.2,13.5 16.8,27 22.8,27 21,35.5 31.2,21.4 25,21.4" fill={GOLD} stroke={p.deep} strokeWidth="1.2" strokeLinejoin="round" />
    </>
  ),

  /* Al-baqiyat al-salihat — radiant medallion flower (lasting good deeds). */
  baqiyat: (p) => (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={i}
          cx="24"
          cy="15.6"
          rx="4.1"
          ry="8.6"
          fill={p.mid}
          opacity="0.8"
          transform={`rotate(${i * 45} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="7.4" fill={p.deep} />
      <circle cx="24" cy="24" r="3.4" fill={GOLD_LIGHT} />
      {sparkle(39, 9.5, 2.6, GOLD)}
      {sparkle(9, 37.5, 2.2, GOLD)}
    </>
  ),

  /* Istighfar 1000 — misbaha prayer beads with tassel. */
  istighfar: (p) => (
    <>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const cx = 24 + 12.6 * Math.cos(a);
        const cy = 22 + 12.6 * Math.sin(a);
        const top = i === 0;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={top ? 3.6 : 2.7}
            fill={top ? GOLD : i % 2 === 0 ? p.mid : p.deep}
          />
        );
      })}
      <line x1="24" y1="34.6" x2="24" y2="38.4" stroke={p.deep} strokeWidth="2" strokeLinecap="round" />
      <g stroke={p.deep} strokeWidth="1.9" strokeLinecap="round">
        <line x1="24" y1="38.4" x2="20.8" y2="43" />
        <line x1="24" y1="38.4" x2="24" y2="43.6" />
        <line x1="24" y1="38.4" x2="27.2" y2="43" />
      </g>
    </>
  ),

  /* Surah Al-Ikhlas — eight-point star with a sincerity flame. */
  ikhlas: (p) => (
    <>
      <rect x="13.5" y="13.5" width="21" height="21" rx="3.5" fill={p.mid} />
      <rect x="13.5" y="13.5" width="21" height="21" rx="3.5" fill={p.mid} transform="rotate(45 24 24)" />
      <path
        d="M24 16.8 C27.2 20.6 28.8 23.2 28.8 26.4 a4.8 4.8 0 1 1 -9.6 0 C19.2 23.2 20.8 20.6 24 16.8 Z"
        fill={GOLD}
      />
      <circle cx="24" cy="27.4" r="1.9" fill={p.deep} />
      {sparkle(38.8, 9.2, 2.5, GOLD)}
    </>
  ),
};

export function HabitArt({ habitId, size = 40 }: { habitId: string; size?: number }) {
  const palette = PALETTES[habitId] ?? PALETTES.prayers!;
  const art = ART[habitId] ?? ART.prayers!;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <circle cx="24" cy="24" r="22" fill={palette.soft} />
      <circle cx="24" cy="24" r="22" fill="none" stroke={palette.mid} strokeOpacity="0.25" strokeWidth="1.2" />
      {art(palette)}
    </svg>
  );
}
