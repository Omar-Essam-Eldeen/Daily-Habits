import { useMemo } from 'react';

const COLORS = ['#2f9e44', '#fab005', '#4dabf7', '#9775fa', '#f783ac', '#3bc9db', '#ffa94d'];

interface Piece {
  left: number;
  delay: number;
  size: number;
  color: string;
  round: boolean;
  duration: number;
}

/**
 * Lightweight CSS confetti burst for milestone moments — no dependencies,
 * ~28 absolutely-positioned pieces animated by a single keyframe. Hidden
 * entirely under prefers-reduced-motion (see styles.css).
 */
export function Celebration() {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: (i * 37 + 13) % 100,
        delay: ((i * 53) % 40) / 100,
        size: 6 + ((i * 29) % 7),
        color: COLORS[i % COLORS.length] ?? '#2f9e44',
        round: i % 3 === 0,
        duration: 2 + ((i * 31) % 10) / 12,
      })),
    [],
  );

  return (
    <div className="confetti-wrap" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            background: p.color,
            borderRadius: p.round ? '50%' : 2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
